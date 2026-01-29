'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function TrackOrderPage() {
    const { t, language } = useLanguage();
    const [orderReference, setOrderReference] = useState('');

    const translations = {
        pageTitle: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        subtitle: { en: 'Enter your order reference to check the status', ar: 'أدخل رقم الطلب للتحقق من الحالة' },
        orderRefLabel: { en: 'Order Reference', ar: 'رقم الطلب' },
        orderRefPlaceholder: { en: 'e.g., YARN-K9X2M4P', ar: 'مثال: YARN-K9X2M4P' },
        trackButton: { en: 'Track Order', ar: 'تتبع الطلب' },
        comingSoon: { en: 'Order tracking feature coming soon!', ar: 'ميزة تتبع الطلبات قريباً!' },
        infoMessage: { en: 'You will receive your order reference after submitting a quotation request.', ar: 'ستتلقى رقم الطلب بعد إرسال طلب عرض السعر.' }
    };

    const handleTrack = () => {
        if (!orderReference.trim()) {
            alert(language === 'ar' ? 'الرجاء إدخال رقم الطلب' : 'Please enter an order reference');
            return;
        }
        alert(t(translations.comingSoon));
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
                <div className="bg-white rounded-2xl shadow-lg p-8">
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
                        />
                    </div>

                    <button
                        onClick={handleTrack}
                        className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {t(translations.trackButton)}
                    </button>

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
            </div>
        </div>
    );
}
