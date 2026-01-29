'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// Component that uses useSearchParams - must be wrapped in Suspense
function TrackOrderContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        enterOrderId: { en: 'Please enter an Order ID', ar: 'يرجى إدخال رقم الطلب' },
        orderDetails: { en: 'Order Details', ar: 'تفاصيل الطلب' },
        status: { en: 'Status', ar: 'الحالة' },
        sector: { en: 'Sector', ar: 'القطاع' },
        createdAt: { en: 'Created At', ar: 'تاريخ الإنشاء' },

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

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        in_production: 'bg-purple-100 text-purple-800 border-purple-200',
        ready_for_delivery: 'bg-green-100 text-green-800 border-green-200',
        delivered: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    const handleTrack = useCallback(async (idToSearch = null) => {
        // Use provided ID or input value, and trim it
        const searchId = (idToSearch || orderId).trim();

        // GUARD CLAUSE: Check if ID is empty
        if (!searchId) {
            setError(t(translations.enterOrderId));
            setOrder(null);
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const ordersRef = collection(db, 'orders');
            // Only create query if searchId is valid
            const q = query(ordersRef, where('orderId', '==', searchId), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(t(translations.notFound));
            } else {
                const orderData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                setOrder(orderData);
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(t(translations.notFound));
        } finally {
            setLoading(false);
        }
    }, [orderId, t, translations.enterOrderId, translations.notFound]);

    // Check URL params on mount
    useEffect(() => {
        const id = searchParams.get('id');
        if (id && id.trim()) {
            setOrderId(id.trim());
            handleTrack(id.trim());
        }
    }, [searchParams, handleTrack]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            // Properly handle Firestore Timestamp
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (err) {
            console.error('Error formatting date:', err);
            return 'N/A';
        }
    };

    const formatValue = (value) => {
        // Handle file objects
        if (typeof value === 'object' && value !== null) {
            if (value.name) return value.name;
            if (value.url) return 'File attached';
            return JSON.stringify(value);
        }
        // Handle arrays
        if (Array.isArray(value)) return value.join(', ');
        // Handle regular values
        return String(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
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

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="space-y-4">
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg font-mono"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-xl'
                                }`}
                        >
                            {loading ? t(translations.searching) : t(translations.trackButton)}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 text-center flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </p>
                    </div>
                )}

                {/* Order Details */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white mb-1">
                                {t(translations.orderDetails)}
                            </h2>
                            <p className="text-primary-100 text-sm font-mono">
                                {order.orderId}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Status */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">{t(translations.status)}</p>
                                <div className={`inline-block px-4 py-2 rounded-lg border font-semibold ${statusColors[order.status]}`}>
                                    {t(translations[order.status])}
                                </div>
                            </div>

                            {/* Sector */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{t(translations.sector)}</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {t(translations[order.sector])}
                                </p>
                            </div>

                            {/* Created Date */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{t(translations.createdAt)}</p>
                                <p className="text-gray-900">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>

                            {/* Order Info */}
                            {order.formData && Object.keys(order.formData).length > 0 && (
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                                    <div className="space-y-2 text-sm">
                                        {Object.entries(order.formData).map(([key, value]) => {
                                            // Skip null/undefined values
                                            if (value === null || value === undefined) return null;

                                            return (
                                                <div key={key} className="flex justify-between items-start gap-4">
                                                    <span className="text-gray-600 capitalize flex-shrink-0">
                                                        {key.replace(/_/g, ' ')}:
                                                    </span>
                                                    <span className="text-gray-900 font-medium text-right">
                                                        {formatValue(value)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main page component with Suspense boundary
export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading tracking page...</p>
                </div>
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}
