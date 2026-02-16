'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';

export default function CartSummary() {
    const { cart, getCartItemCount } = useCart();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [isBouncing, setIsBouncing] = useState(false);

    // Trigger bounce animation when cart items change
    useEffect(() => {
        if (cart.length > 0) {
            setIsBouncing(true);
            const timer = setTimeout(() => setIsBouncing(false), 300);
            return () => clearTimeout(timer);
        }
    }, [cart.length]);

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

    const colorMap = {
        '1': { ar: 'أبيض', en: 'White' }, '2': { ar: 'أخضر', en: 'Green' },
        '3': { ar: 'برتقالي', en: 'Orange' }, '4': { ar: 'أصفر', en: 'Yellow' },
        '5': { ar: 'أزرق', en: 'Blue' }, '6': { ar: 'كحلي', en: 'Navy' },
        '7': { ar: 'أحمر', en: 'Red' }, 'custom': { ar: 'لون مخصص', en: 'Custom Color' }
    };

    const logoTypeMap = {
        'embroidery': { ar: 'تطريز', en: 'Embroidery' },
        'printing': { ar: 'طباعة', en: 'Printing' },
        'wovenPatch': { ar: 'حياكة', en: 'Woven Patch' }
    };

    const logoPlacementMap = {
        'chest': { ar: 'الصدر', en: 'Chest' },
        'shoulder': { ar: 'الكتف', en: 'Shoulder' },
        'back': { ar: 'الظهر', en: 'Back' }
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
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${cart.length > 0 ? 'border-2 border-primary/20 shadow-primary/10' : ''}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
                <h3 className="text-lg font-bold flex items-center justify-between text-white">
                    <span>🛒 {t(translations.title)}</span>
                    <span className={`text-sm bg-white/20 px-3 py-1 rounded-full transition-transform duration-300 ${isBouncing ? 'scale-125 bg-white/40' : 'scale-100'} ${cart.length > 0 ? 'animate-pulse' : ''}`}>
                        {cart.length} {cart.length === 1 ? t(translations.item) : t(translations.items)}
                    </span>
                </h3>
            </div>

            {/* Item List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                    <div key={index} className="flex gap-3 mb-4 p-2 bg-white rounded-lg border border-gray-100">
                        {/* Image */}
                        <div className="w-16 h-16 shrink-0 relative bg-gray-50 rounded-md border border-gray-200">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.productName}
                                    fill
                                    className="object-contain p-1"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    📷
                                </div>
                            )}
                        </div>

                        {/* Details Column */}
                        <div className="flex-1 min-w-0">
                            {/* Header: Name & Qty */}
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-gray-900 truncate ml-1">
                                    {language === 'ar' ? (item.details?.nameAr || item.productNameAr || item.productName) : item.productName}
                                </h4>
                                <span className="shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {item.quantity} {t(translations.pcs)}
                                </span>
                            </div>

                            {/* Specs List (Compact) */}
                            <div className="text-xs text-gray-500 space-y-0.5">
                                {/* Fabric */}
                                {(item.details?.fabric || item.fabric) && (
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70">{language === 'ar' ? 'القماش:' : 'Fabric:'}</span>
                                        <span className="font-medium text-gray-700">
                                            {language === 'ar' ? (item.details?.fabricAr || item.fabricAr || item.details?.fabric) : (item.details?.fabric || item.fabric)}
                                        </span>
                                    </div>
                                )}

                                {/* Color */}
                                {(item.details?.color || item.details?.customColorName) && (
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70">{language === 'ar' ? 'اللون:' : 'Color:'}</span>
                                        <span className="font-medium text-gray-700">
                                            {item.details.color === 'custom'
                                                ? (item.details.customColorName || (language === 'ar' ? 'مخصص' : 'Custom'))
                                                : (colorMap[item.details.color]?.[language] || item.details.color)}
                                        </span>
                                    </div>
                                )}

                                {/* Logo (Conditionally Rendered) */}
                                {item.details?.logoType && (
                                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1 rounded w-fit mt-1">
                                        <span className="font-medium">
                                            {logoTypeMap[item.details.logoType]?.[language]}
                                            {item.details.logoPlacement && ` (${logoPlacementMap[item.details.logoPlacement]?.[language]})`}
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
