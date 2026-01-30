'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TrackOrderPage() {
    const { t, language } = useLanguage();
    const [orderReference, setOrderReference] = useState('');
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const translations = {
        pageTitle: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        subtitle: { en: 'Enter your order reference to check the status', ar: 'أدخل رقم الطلب للتحقق من الحالة' },
        orderRefLabel: { en: 'Order Reference', ar: 'رقم الطلب' },
        orderRefPlaceholder: { en: 'e.g., YARN-K9X2M4P', ar: 'مثال: YARN-K9X2M4P' },
        trackButton: { en: 'Track Order', ar: 'تتبع الطلب' },
        searching: { en: 'Searching...', ar: 'جارٍ البحث...' },
        infoMessage: { en: 'You will receive your order reference after submitting a quotation request.', ar: 'ستتلقى رقم الطلب بعد إرسال طلب عرض السعر.' },
        orderStatus: { en: 'Order Status', ar: 'حالة الطلب' },
        orderDetails: { en: 'Order Details', ar: 'تفاصيل الطلب' },
        sector: { en: 'Sector', ar: 'القطاع' },
        dateCreated: { en: 'Date Created', ar: 'تاريخ الإنشاء' },
        expectedCompletion: { en: 'Expected Completion', ar: 'التسليم المتوقع' },
        notSet: { en: 'Not set yet', ar: 'لم يتم تحديده بعد' },
        customer: { en: 'Customer', ar: 'العميل' },
        totalItems: { en: 'Total Items', ar: 'إجمالي القطع' }
    };

    const statusColors = {
        'Order Received': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Contacting': 'bg-blue-100 text-blue-800 border-blue-300',
        'Quotation Sent': 'bg-indigo-100 text-indigo-800 border-indigo-300',
        'Sample Production': 'bg-purple-100 text-purple-800 border-purple-300',
        'Manufacturing': 'bg-orange-100 text-orange-800 border-orange-300',
        'Delivered': 'bg-green-100 text-green-800 border-green-300',
        'Cancelled': 'bg-red-100 text-red-800 border-red-300'
    };

    const handleTrack = async (e) => {
        e.preventDefault();

        if (!orderReference.trim()) {
            setError(language === 'ar' ? 'الرجاء إدخال رقم الطلب' : 'Please enter an order reference');
            return;
        }

        setLoading(true);
        setError('');
        setOrderResult(null);

        try {
            // Query Firestore for the 'orderId' field
            const q = query(collection(db, 'orders'), where('orderId', '==', orderReference.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(language === 'ar' ? 'لم يتم العثور على الطلب. يرجى التحقق من الرقم والمحاولة مرة أخرى.' : 'Order not found. Please check the ID and try again.');
            } else {
                // Get the first matching document
                const data = querySnapshot.docs[0].data();
                setOrderResult(data);
            }
        } catch (err) {
            console.error("Tracking error:", err);
            setError(language === 'ar' ? 'فشل تتبع الطلب. يرجى المحاولة مرة أخرى لاحقاً.' : 'Failed to track order. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';

        try {
            // Handle Firestore Timestamp
            if (timestamp.toDate) {
                return timestamp.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            // Handle regular Date or timestamp object
            if (timestamp.seconds) {
                return new Date(timestamp.seconds * 1000).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            // Handle string dates
            if (typeof timestamp === 'string') {
                return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            return '—';
        } catch (error) {
            console.error('Date formatting error:', error);
            return '—';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📦</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {t(translations.pageTitle)}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {t(translations.subtitle)}
                    </p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <form onSubmit={handleTrack}>
                        <div className="mb-6">
                            <label
                                htmlFor="orderRef"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                {t(translations.orderRefLabel)}
                            </label>
                            <input
                                id="orderRef"
                                type="text"
                                value={orderReference}
                                onChange={(e) => setOrderReference(e.target.value.toUpperCase())}
                                placeholder={t(translations.orderRefPlaceholder)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-mono"
                                dir="ltr"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl'
                                }`}
                        >
                            {loading ? t(translations.searching) : t(translations.trackButton)}
                        </button>
                    </form>

                    {/* Info Message */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <span className="text-xl">ℹ️</span>
                            <p className="text-sm text-blue-900">
                                {t(translations.infoMessage)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">❌</span>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Order Result */}
                {orderResult && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header with Status */}
                        <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">{t(translations.orderRefLabel)}</p>
                                    <h2 className="text-2xl font-bold font-mono">{orderResult.orderId}</h2>
                                </div>
                                <div className="text-5xl">✅</div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="p-6 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-600 mb-2">{t(translations.orderStatus)}</p>
                            <div className={`inline-block px-4 py-2 rounded-full border-2 font-bold text-lg ${statusColors[orderResult.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}>
                                {orderResult.status || 'Unknown'}
                            </div>
                        </div>

                        {/* Expected Completion */}
                        {orderResult.expectedCompletionDate && (
                            <div className="p-6 bg-green-50 border-b border-green-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">📅</span>
                                    <div>
                                        <p className="text-sm font-semibold text-green-900 mb-1">
                                            {t(translations.expectedCompletion)}
                                        </p>
                                        <p className="text-lg font-bold text-green-700">
                                            {formatDate(orderResult.expectedCompletionDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Details */}
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t(translations.orderDetails)}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                                        {t(translations.customer)}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {orderResult.customer?.schoolName || orderResult.customer?.name || 'N/A'}
                                    </p>
                                </div>

                                {/* Sector */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                                        {t(translations.sector)}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {orderResult.sector || 'N/A'}
                                    </p>
                                </div>

                                {/* Total Items */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                                        {t(translations.totalItems)}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {orderResult.totalItems || orderResult.items?.length || 'N/A'} pieces
                                    </p>
                                </div>

                                {/* Date Created */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                                        {t(translations.dateCreated)}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(orderResult.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
