'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';

export default function TrackOrderPage() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const orderIdFromUrl = searchParams.get('id');

    const [orderId, setOrderId] = useState(orderIdFromUrl || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const translations = {
        title: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        subtitle: {
            en: 'Enter your order ID to check the current status',
            ar: 'أدخل رقم الطلب للتحقق من الحالة الحالية'
        },
        orderIdLabel: { en: 'Order ID', ar: 'رقم الطلب' },
        orderIdPlaceholder: { en: 'Enter Order ID', ar: 'أدخل رقم الطلب' },
        trackButton: { en: 'Track Order', ar: 'تتبع الطلب' },
        searching: { en: 'Searching...', ar: 'جاري البحث...' },
        notFound: { en: 'Order not found. Please check your order ID.', ar: 'الطلب غير موجود. يرجى التحقق من رقم الطلب.' },
        orderDetails: { en: 'Order Details', ar: 'تفاصيل الطلب' },
        status: { en: 'Status', ar: 'الحالة' },
        sector: { en: 'Sector', ar: 'القطاع' },
        createdAt: { en: 'Created', ar: 'تاريخ الإنشاء' },
        backToHome: { en: '← Back to Home', ar: '→ العودة للرئيسية' },

        // Sectors
        schools: { en: 'Schools', ar: 'المدارس' },
        factories: { en: 'Factories', ar: 'المصانع' },
        companies: { en: 'Companies', ar: 'الشركات' },
        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },

        // Status
        pending: { en: 'Pending Review', ar: 'قيد المراجعة' },
        processing: { en: 'Processing', ar: 'قيد المعالجة' },
        in_production: { en: 'In Production', ar: 'قيد الإنتاج' },
        ready_for_delivery: { en: 'Ready for Delivery', ar: 'جاهز للتسليم' },
        delivered: { en: 'Delivered', ar: 'تم التسليم' },
        cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };

    const statusConfig = {
        pending: { color: 'yellow', icon: '⏳', progress: 20 },
        processing: { color: 'blue', icon: '🔄', progress: 40 },
        in_production: { color: 'purple', icon: '⚙️', progress: 60 },
        ready_for_delivery: { color: 'green', icon: '📦', progress: 80 },
        delivered: { color: 'gray', icon: '✅', progress: 100 },
        cancelled: { color: 'red', icon: '❌', progress: 0 },
    };

    useEffect(() => {
        if (orderIdFromUrl) {
            handleTrack(null, orderIdFromUrl);
        }
    }, [orderIdFromUrl]);

    const handleTrack = async (e, searchId = null) => {
        if (e) e.preventDefault();

        const idToSearch = searchId || orderId.trim();
        if (!idToSearch) return;

        setLoading(true);
        setError('');
        setSearched(true);
        setOrder(null);

        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('orderId', '==', idToSearch), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(t(translations.notFound));
            } else {
                const orderData = querySnapshot.docs[0].data();
                setOrder({ id: querySnapshot.docs[0].id, ...orderData });
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(t(translations.notFound));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="container-custom">
                <Link
                    href="/"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t(translations.backToHome)}
                </Link>

                <div className="max-w-3xl mx-auto">
                    {/* Search Box */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 text-3xl">
                                📦
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {t(translations.title)}
                            </h1>
                            <p className="text-gray-600">
                                {t(translations.subtitle)}
                            </p>
                        </div>

                        <form onSubmit={handleTrack} className="space-y-4">
                            <div>
                                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t(translations.orderIdLabel)}
                                </label>
                                <input
                                    type="text"
                                    id="orderId"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder={t(translations.orderIdPlaceholder)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                    }`}
                            >
                                {loading ? t(translations.searching) : t(translations.trackButton)}
                            </button>
                        </form>
                    </div>

                    {/* Order Details */}
                    {searched && order && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t(translations.orderDetails)}
                                </h2>
                                <p className="text-lg text-primary-600 font-mono font-bold">
                                    {order.orderId}
                                </p>
                            </div>

                            {/* Status Progress */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        {t(translations.status)}
                                    </span>
                                    <span className={`text-sm font-semibold badge-${order.status}`}>
                                        {statusConfig[order.status]?.icon} {t(translations[order.status])}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${order.status === 'cancelled' ? 'bg-red-500' :
                                            order.status === 'delivered' ? 'bg-gray-500' :
                                                'bg-primary-600'
                                            }`}
                                        style={{ width: `${statusConfig[order.status]?.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{t(translations.sector)}</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {t(translations[order.sector])}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{t(translations.createdAt)}</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Form Data */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t({ en: 'Order Information', ar: 'معلومات الطلب' })}
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(order.formData || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 text-right">
                                                {typeof value === 'object' && value.url ? (
                                                    <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                                        {value.name || 'View File'}
                                                    </a>
                                                ) : Array.isArray(value) ? (
                                                    value.join(', ')
                                                ) : (
                                                    String(value)
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {searched && error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-fade-in">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
