'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';

export default function CartSummary() {
    const { cart, getCartItemCount } = useCart();
    const router = useRouter();
    const { t, language } = useLanguage();

    const translations = {
        title: { en: 'Cart Summary', ar: 'ملخص الطلب' },
        emptyTitle: { en: 'No items added yet', ar: 'لا توجد منتجات' },
        emptyHint: { en: 'Configure products to see them here', ar: 'قم بإعداد المنتجات لتظهر هنا' },
        item: { en: 'item', ar: 'منتج' },
        items: { en: 'items', ar: 'منتجات' },
        pcs: { en: 'pcs', ar: 'قطعة' },
        color: { en: 'Color', ar: 'اللون' },
        custom: { en: 'Custom', ar: 'مخصص' },
        totalItems: { en: 'Total Items:', ar: 'إجمالي القطع:' },
        viewCart: { en: 'View Cart & Submit', ar: 'عرض السلة وإتمام الطلب' },
        continueHint: { en: 'Continue configuring or review your order', ar: 'أكمل اختيار المنتجات أو راجع طلبك الآن' }
    };

    if (cart.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🛒 {t(translations.title)}</h3>
                <div className="text-center py-8">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="text-gray-500 text-sm">{t(translations.emptyTitle)}</p>
                    <p className="text-gray-400 text-xs mt-2">{t(translations.emptyHint)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
                <h3 className="text-lg font-bold flex items-center justify-between text-white">
                    <span>🛒 {t(translations.title)}</span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {cart.length} {cart.length === 1 ? t(translations.item) : t(translations.items)}
                    </span>
                </h3>
            </div>

            {/* Item List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                        <div className="flex items-start gap-3">
                            {item.image && (
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.productName}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {language === 'ar' ? (item.details?.nameAr || item.productNameAr || item.productName) : item.productName}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                    {item.code}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                        {item.quantity} {t(translations.pcs)}
                                    </span>
                                    {item.details?.fabric && (
                                        <span className="text-xs text-gray-600 truncate">
                                            {language === 'ar' ? (item.details?.fabricAr || item.fabricAr || item.details.fabric) : item.details.fabric}
                                        </span>
                                    )}
                                </div>
                                {/* Color indicator */}
                                {item.details?.color && item.details.color !== 'custom' && (
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="text-xs text-gray-500">{t(translations.color)}:</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {item.details.color}
                                        </span>
                                    </div>
                                )}
                                {item.details?.customColorName && (
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="text-xs text-gray-500">{t(translations.custom)}:</span>
                                        <span className="text-xs font-medium text-gray-700 truncate">
                                            {item.details.customColorName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            {/* Modern Footer Section */}
            <div className="bg-gray-50 p-6 border-t border-gray-100">
                {/* Total Row - Compact & Unitless */}
                <div className="flex items-center justify-center gap-3 mb-6 dir-rtl">
                    <span className="text-gray-600 font-medium text-lg">
                        {t(translations.totalItems)}
                    </span>
                    <span className="text-4xl font-bold text-primary tracking-tight">
                        {getCartItemCount()}
                    </span>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => router.push('/cart')}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {t(translations.viewCart)}
                </button>

                {/* Hint Text */}
                <p className="text-xs text-center text-gray-400 mt-4 font-medium">
                    {t(translations.continueHint)}
                </p>
            </div>
        </div >
    );
}
