'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/hooks/useLanguage';

// Enhanced Map
const STATUS_MAP = {
    'new': 0, 'received': 0, 'order received': 0, 'pending': 0,
    'contacting': 1, 'contact': 1, 'in contact': 1, 'contacted': 1,
    'quotation': 2, 'quotation sent': 2, 'quote': 2, 'offer': 2,
    'sample': 3, 'sample production': 3, 'sampling': 3, 'samples': 3,
    'manufacturing': 4, 'production': 4, 'in progress': 4, 'processing': 4,
    'delivered': 5, 'shipping': 5, 'shipped': 5, 'completed': 5, 'done': 5
};

const translations = {
    title: { en: 'Track Your Order', ar: 'تتبع طلبك' },
    subtitle: { en: 'Enter your order ID to see the current status', ar: 'أدخل رقم الطلب لمعرفة الحالة الحالية' },
    placeholder: { en: 'Order ID', ar: 'رقم الطلب' },
    button: { en: 'Track', ar: 'تتبع' },
    currentStatus: { en: 'Current Status', ar: 'الحالة الحالية' },
    expectedDateTitle: { en: 'Expected Completion Date', ar: 'تاريخ الانتهاء المتوقع' },
    errorNotFound: { en: 'Order ID not found', ar: 'رقم الطلب غير موجود' },
    steps: [
        { en: 'Order Received', ar: 'تم استلام الطلب' },
        { en: 'Contacting', ar: 'جاري التواصل' },
        { en: 'Quotation Sent', ar: 'تم إرسال عرض السعر' },
        { en: 'Sample Production', ar: 'تنفيذ العينة' },
        { en: 'Manufacturing', ar: 'مرحلة التصنيع' },
        { en: 'Delivered', ar: 'تم التوصيل' }
    ]
};

function TrackOrderContent() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    const [orderId, setOrderId] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [expectedDate, setExpectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderFound, setOrderFound] = useState(false);

    // 1. الدالة معرفة بـ async و useCallback وتسبق الـ useEffect
    const fetchOrder = useCallback(async (id) => {
        if (!id) return;

        setLoading(true);
        setError('');
        setOrderFound(false);
        setExpectedDate(null);

        try {
            const cleanId = id.trim().toUpperCase();
            const ordersRef = collection(db, 'orders');

            // البحث عن طريق orderId (الأساسي)
            const q = query(ordersRef, where('orderId', '==', cleanId));
            const querySnapshot = await getDocs(q);

            let data = null;

            if (!querySnapshot.empty) {
                data = querySnapshot.docs[0].data();
            } else {
                // محاولة البحث عن طريق Document ID كخيار احتياطي
                const q2 = query(ordersRef, where('id', '==', cleanId));
                const querySnapshot2 = await getDocs(q2);
                if (!querySnapshot2.empty) {
                    data = querySnapshot2.docs[0].data();
                }
            }

            if (data) {
                // تحديد المرحلة الحالية
                const rawStatus = data.status || data.orderStatus || 'new';
                const statusKey = rawStatus.toString().toLowerCase().trim();
                const stepIndex = STATUS_MAP[statusKey] !== undefined ? STATUS_MAP[statusKey] : 0;
                setCurrentStep(stepIndex);

                // معالجة تاريخ الانتهاء المتوقع
                const dateField = data.expectedCompletionDate || data.expectedDate || data.deliveryDate;

                if (dateField) {
                    let dateObj = null;
                    if (dateField.toDate) {
                        dateObj = dateField.toDate(); // Firestore Timestamp
                    } else if (typeof dateField === 'string' || typeof dateField === 'number') {
                        dateObj = new Date(dateField);
                    }

                    if (dateObj && !isNaN(dateObj.getTime())) {
                        setExpectedDate(dateObj);
                    }
                }

                setOrderFound(true);
            } else {
                setError(t(translations.errorNotFound));
            }

        } catch (err) {
            console.error("Error fetching order:", err);
            setError(language === 'ar' ? "حدث خطأ أثناء البحث" : "An error occurred during search");
        } finally {
            setLoading(false);
        }
    }, [t, language]);

    // 2. استدعاء الدالة عند وجود ID في الرابط
    useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl) {
            setOrderId(idFromUrl);
            fetchOrder(idFromUrl);
        }
    }, [searchParams, fetchOrder]);

    const handleTrack = (e) => {
        e.preventDefault();
        fetchOrder(orderId);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-primary p-8 text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">{t(translations.title)}</h1>
                    <p className="opacity-90">{t(translations.subtitle)}</p>
                </div>

                <div className="p-8">
                    {/* Search Input */}
                    <form onSubmit={handleTrack} className="flex gap-4 flex-col sm:flex-row mb-8">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder={t(translations.placeholder)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : t(translations.button)}
                        </button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Results Area */}
                    {orderFound && !loading && (
                        <div className="animate-fade-in">

                            {/* Order ID Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {t(translations.currentStatus)}
                                </h3>
                                <span className="text-primary font-mono font-bold text-lg bg-primary-50 px-3 py-1 rounded">
                                    {orderId}
                                </span>
                            </div>

                            {/* Expected Date Badge */}
                            {expectedDate && (
                                <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold mb-1">
                                            {t(translations.expectedDateTitle)}
                                        </p>
                                        <p className="text-lg font-bold text-blue-900" dir="ltr">
                                            {expectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="relative px-2 sm:px-4">
                                <div className={`absolute top-4 bottom-10 w-0.5 bg-gray-200 ${language === 'ar' ? 'right-[27px] sm:right-[35px]' : 'left-[27px] sm:left-[35px]'}`}></div>

                                <div className="space-y-8 relative">
                                    {translations.steps.map((step, index) => {
                                        let statusClass = 'pending';
                                        if (index < currentStep) statusClass = 'completed';
                                        if (index === currentStep) statusClass = 'current';

                                        return (
                                            <div key={index} className="flex items-start gap-4 sm:gap-6 relative">
                                                <div className={`z-10 w-14 h-14 rounded-full flex items-center justify-center border-4 shrink-0 transition-all duration-300
                                                        ${statusClass === 'completed' ? 'bg-green-500 border-green-100 text-white shadow-md' :
                                                        statusClass === 'current' ? 'bg-primary border-white text-white shadow-xl ring-4 ring-primary-100 scale-110' :
                                                            'bg-white border-gray-200 text-gray-300'}`}>
                                                    {statusClass === 'completed' ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-lg font-bold">{index + 1}</span>
                                                    )}
                                                </div>

                                                <div className={`pt-2 transition-all duration-300 ${statusClass === 'pending' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                                                    <h4 className={`font-bold text-lg sm:text-xl ${statusClass === 'current' ? 'text-primary' : 'text-gray-800'}`}>
                                                        {language === 'ar' ? step.ar : step.en}
                                                    </h4>
                                                    {statusClass === 'current' && (
                                                        <p className="text-sm text-primary font-medium mt-1 animate-pulse">
                                                            {language === 'ar' ? 'جاري العمل الآن...' : 'Currently in progress...'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TrackOrderContent />
        </Suspense>
    );
}