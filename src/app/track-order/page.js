'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/hooks/useLanguage';
import { CheckCircle, Clock, Truck, Package } from 'lucide-react';

// Simplified 2-step status map for B2C student orders
const STATUS_MAP = {
    // Step 1: Order Received
    'order received': 1, 'new': 1, 'received': 1, 'pending': 1,
    // Step 2: Shipped
    'shipped': 2, 'shipping': 2, 'delivered': 2, 'completed': 2, 'done': 2,
    // Cancelled
    'cancelled': -1
};

const translations = {
    title: { en: 'Track Your Order', ar: 'تتبع طلبك' },
    subtitle: { en: 'Enter your order ID to see the latest status', ar: 'أدخل رقم الطلب لمعرفة آخر حالة' },
    placeholder: { en: 'Order ID (e.g. YARN-XXXXX)', ar: 'رقم الطلب (مثال: YARN-XXXXX)' },
    button: { en: 'Track', ar: 'تتبع' },
    currentStatus: { en: 'Current Status', ar: 'الحالة الحالية' },
    errorNotFound: { en: 'Order ID not found. Please double-check and try again.', ar: 'رقم الطلب غير موجود. تحقق من الرقم وحاول مرة أخرى.' },
    steps: [
        {
            en: 'Order Received & Processing',
            ar: 'تم استلام الطلب وجاري التجهيز',
            desc: { en: 'Your order has been confirmed and is being prepared.', ar: 'تم تأكيد طلبك وهو قيد التجهيز.' }
        },
        {
            en: 'Handed to Shipping Provider',
            ar: 'تم التسليم لشركة الشحن',
            desc: { en: 'Your order is on its way to you.', ar: 'طلبك في طريقه إليك.' }
        },
    ],
    shippingPartner: { en: 'Shipping Partner Tracking', ar: 'تتبع شركة الشحن' },
    shippingPartnerSoon: {
        en: 'A direct tracking link from our shipping partner will appear here once available.',
        ar: 'سيظهر رابط التتبع المباشر من شركة الشحن هنا فور توفره.'
    },
    cancelled: { en: 'Order Cancelled', ar: 'الطلب ملغي' }
};

function TrackOrderContent() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    const [orderId, setOrderId] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderFound, setOrderFound] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [rawStatus, setRawStatus] = useState('');

    const fetchOrder = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setError('');
        setOrderFound(false);
        setIsCancelled(false);

        try {
            const cleanId = id.trim().toUpperCase();
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('orderId', '==', cleanId));
            const snapshot = await getDocs(q);

            let data = null;
            if (!snapshot.empty) {
                data = snapshot.docs[0].data();
            } else {
                const q2 = query(ordersRef, where('id', '==', cleanId));
                const snapshot2 = await getDocs(q2);
                if (!snapshot2.empty) data = snapshot2.docs[0].data();
            }

            if (data) {
                const statusKey = (data.status || 'new').toLowerCase().trim();
                setRawStatus(data.status || '');

                if (statusKey === 'cancelled') {
                    setIsCancelled(true);
                } else {
                    const step = STATUS_MAP[statusKey] ?? 1;
                    setCurrentStep(step);
                }
                setOrderFound(true);
            } else {
                setError(t(translations.errorNotFound));
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(language === 'ar' ? 'حدث خطأ أثناء البحث' : 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [t, language]);

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
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary p-8 text-center text-white">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-90" />
                        <h1 className="text-3xl font-bold mb-2">{t(translations.title)}</h1>
                        <p className="opacity-80 text-sm">{t(translations.subtitle)}</p>
                    </div>

                    <div className="p-6">
                        {/* Search Form */}
                        <form onSubmit={handleTrack} className="flex gap-3 flex-col sm:flex-row">
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder={t(translations.placeholder)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none bg-gray-50 font-mono text-sm"
                                dir="ltr"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {loading ? '...' : t(translations.button)}
                            </button>
                        </form>

                        {/* Error */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {orderFound && !loading && (
                    <div className="space-y-4">

                        {/* Order ID badge */}
                        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between border border-gray-100">
                            <span className="text-sm text-gray-500 font-medium">{t(translations.currentStatus)}</span>
                            <span className="text-primary font-mono font-bold text-sm bg-primary/5 px-3 py-1 rounded-lg">{orderId.toUpperCase()}</span>
                        </div>

                        {/* Cancelled State */}
                        {isCancelled && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <div className="text-4xl mb-3">❌</div>
                                <h3 className="font-bold text-red-700 text-lg">{t(translations.cancelled)}</h3>
                            </div>
                        )}

                        {/* 2-Step Tracker */}
                        {!isCancelled && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    {/* Progress Bar */}
                                    <div className="relative mb-8">
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div
                                                className="h-2 bg-primary rounded-full transition-all duration-700"
                                                style={{ width: `${((currentStep - 1) / 1) * 100}%` }}
                                            />
                                        </div>
                                        {/* Step dots */}
                                        <div className="absolute -top-1.5 left-0 right-0 flex justify-between">
                                            {[1, 2].map((s) => (
                                                <div
                                                    key={s}
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                                        currentStep >= s
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-white border-gray-300'
                                                    }`}
                                                >
                                                    {currentStep > s && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                                                    {currentStep === s && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step Cards */}
                                    <div className="space-y-4">
                                        {translations.steps.map((step, idx) => {
                                            const stepNum = idx + 1;
                                            const isCompleted = currentStep > stepNum;
                                            const isCurrent = currentStep === stepNum;
                                            const isPending = currentStep < stepNum;
                                            const Icon = idx === 0 ? Clock : Truck;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                                        isCurrent ? 'border-primary/30 bg-primary/5 shadow-sm' :
                                                        isCompleted ? 'border-green-200 bg-green-50' :
                                                        'border-gray-100 bg-gray-50 opacity-50'
                                                    }`}
                                                >
                                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                        isCompleted ? 'bg-green-500 text-white' :
                                                        isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' :
                                                        'bg-gray-200 text-gray-400'
                                                    }`}>
                                                        {isCompleted
                                                            ? <CheckCircle className="w-5 h-5" />
                                                            : <Icon className="w-5 h-5" />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-bold text-base leading-tight ${
                                                            isCurrent ? 'text-primary' :
                                                            isCompleted ? 'text-green-700' :
                                                            'text-gray-500'
                                                        }`}>
                                                            {language === 'ar' ? step.ar : step.en}
                                                        </h4>
                                                        <p className={`text-sm mt-1 ${isCurrent ? 'text-primary/70' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {language === 'ar' ? step.desc.ar : step.desc.en}
                                                        </p>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                {language === 'ar' ? 'جاري الآن' : 'In Progress'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Shipping Partner Placeholder (shown when shipped) */}
                                {currentStep >= 2 && (
                                    <div className="border-t border-gray-100 p-5 bg-blue-50/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                                <Truck className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-blue-900 text-sm mb-1">
                                                    {t(translations.shippingPartner)}
                                                </h4>
                                                <p className="text-blue-600/70 text-xs leading-relaxed">
                                                    {t(translations.shippingPartnerSoon)}
                                                </p>
                                                {/* Placeholder tracking button - future API hook */}
                                                <div className="mt-3 px-4 py-2 bg-blue-100 rounded-lg text-blue-400 text-xs font-medium text-center border border-blue-200 border-dashed cursor-not-allowed select-none">
                                                    {language === 'ar' ? '🔗 رابط التتبع — قريباً' : '🔗 Tracking Link — Coming Soon'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
            <TrackOrderContent />
        </Suspense>
    );
}