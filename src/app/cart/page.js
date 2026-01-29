'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/hooks/useLanguage';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CartPage() {
    const router = useRouter();

    // Defensive coding: provide fallback values
    const cartContext = useCart();
    const { cart = [], removeFromCart = () => { }, clearCart = () => { }, getCartItemCount = () => 0 } = cartContext || {};

    const { t, language } = useLanguage();
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const translations = {
        pageTitle: { en: 'Quotation Request Review', ar: 'مراجعة طلب عرض السعر' },
        clientInformation: { en: 'Client Information', ar: 'معلومات العميل' },
        schoolName: { en: 'School Name', ar: 'اسم المدرسة' },
        contactPerson: { en: 'Contact Person', ar: 'شخص الاتصال' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        phone: { en: 'Phone', ar: 'رقم الهاتف' },
        orderItems: { en: 'Order Items', ar: 'عناصر الطلب' },
        item: { en: 'Item', ar: 'المنتج' },
        specifications: { en: 'Specifications', ar: 'المواصفات' },
        sizeQuantity: { en: 'Size & Quantity', ar: 'المقاسات والكميات' },
        material: { en: 'Material', ar: 'الخامة' },
        stage: { en: 'Stage', ar: 'المرحلة' },
        logo: { en: 'Logo', ar: 'الشعار' },
        notes: { en: 'Notes', ar: 'ملاحظات' },
        uploaded: { en: 'Uploaded', ar: 'تم الرفع' },
        none: { en: 'None', ar: 'لا يوجد' },
        kgPrimary: { en: 'KG & Primary', ar: 'روضة وابتدائي' },
        prepSecondary: { en: 'Prep & Secondary', ar: 'إعدادي وثانوي' },
        total: { en: 'Total', ar: 'الإجمالي' },
        items: { en: 'items', ar: 'قطعة' },
        remove: { en: 'Remove', ar: 'حذف' },
        orderSummary: { en: 'Order Summary', ar: 'ملخص الطلب' },
        totalItems: { en: 'Total Items', ar: 'إجمالي القطع' },
        submitQuotation: { en: 'Submit Quotation Request', ar: 'إرسال طلب العرض' },
        emptyCart: { en: 'Your cart is empty', ar: 'سلتك فارغة' },
        startOrdering: { en: 'Start Ordering', ar: 'بدء الطلب' },
        thankYou: { en: 'Thank you!', ar: 'شكراً لك!' },
        requestSent: { en: 'Your quotation request has been sent successfully.', ar: 'تم إرسال طلب عرض السعر بنجاح.' },
        orderReference: { en: 'Order Reference', ar: 'رقم الطلب' },
        weWillContact: { en: 'We will contact you shortly with a detailed quotation.', ar: 'سنتواصل معك قريباً مع عرض سعر مفصل.' },
        backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
        newOrder: { en: 'New Order', ar: 'طلب جديد' },
    };

    // Get contact info from first cart item
    const getContactInfo = () => {
        if (cart.length === 0) return null;
        return cart[0]?.details?.contactInfo || null;
    };

    const contactInfo = getContactInfo();

    // Calculate total items
    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleSubmit = async () => {
        if (cart.length === 0) return;

        try {
            // Generate secure alphanumeric order ID (format: YARN-A1B2C3D)
            const newOrderId = 'YARN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
            setOrderId(newOrderId);

            // Get contact info from first cart item (from details.contactInfo)
            const contactInfo = cart[0]?.details?.contactInfo || {};

            // Create structured order object for Firestore
            const orderData = {
                orderId: newOrderId,
                customer: {
                    name: contactInfo.contactPerson || contactInfo.name || 'N/A',
                    email: contactInfo.email || 'N/A',
                    phone: contactInfo.phone || 'N/A',
                    schoolName: contactInfo.schoolName || 'N/A'
                },
                items: cart,
                sector: 'Schools',
                status: 'Order Received',
                statusHistory: [
                    {
                        status: 'Order Received',
                        date: new Date(),
                        note: 'Initial submission'
                    }
                ],
                expectedCompletionDate: null,
                createdAt: serverTimestamp(),
                totalItems: getCartItemCount()
            };

            // Save order to Firestore
            await addDoc(collection(db, 'orders'), orderData);
            console.log('✅ Order saved to Firestore:', newOrderId);

            // Clear cart after successful save
            clearCart();

            // Show success modal
            setShowSuccess(true);
        } catch (error) {
            console.error('❌ Error saving order to Firestore:', error);
            alert('Failed to submit order. Please try again.');
        }
    };

    const handleNewOrder = () => {
        clearCart();
        setShowSuccess(false);
        router.push('/sectors/schools');
    };

    // Empty cart state
    if (cart.length === 0 && !showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {t(translations.emptyCart)}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {language === 'ar'
                                ? 'ابدأ بإضافة المنتجات إلى سلتك'
                                : 'Start adding products to your cart'
                            }
                        </p>
                        <button
                            onClick={() => router.push('/sectors/schools')}
                            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                        >
                            {t(translations.startOrdering)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success modal
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
                    <div className="text-7xl mb-6">✅</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {t(translations.thankYou)}
                    </h1>

                    {/* Order Reference Number */}
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-500 font-semibold mb-1">
                            {t(translations.orderReference)}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                            {orderId}
                        </p>
                    </div>

                    <p className="text-xl text-gray-700 mb-2">
                        {t(translations.requestSent)}
                    </p>
                    <p className="text-gray-600 mb-8">
                        {t(translations.weWillContact)}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.push('/')}
                            className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                        >
                            {t(translations.backToHome)}
                        </button>
                        <button
                            onClick={handleNewOrder}
                            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                        >
                            {t(translations.newOrder)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main cart view
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {t(translations.pageTitle)}
                    </h1>
                    <div className="h-1 w-24 bg-primary rounded"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section A: Client Information */}
                        {contactInfo && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    {t(translations.clientInformation)}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">
                                            {t(translations.schoolName)}
                                        </div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {contactInfo.schoolName}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">
                                            {t(translations.contactPerson)}
                                        </div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {contactInfo.contactPerson}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">
                                            {t(translations.email)}
                                        </div>
                                        <div className="text-gray-700">
                                            {contactInfo.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">
                                            {t(translations.phone)}
                                        </div>
                                        <div className="text-gray-700" dir="ltr">
                                            {contactInfo.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section B: Order Items */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t(translations.orderItems)}
                            </h2>

                            {cart.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        {/* Item Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Image */}
                                            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="text-xl font-bold text-primary mb-1">
                                                            {item.code}
                                                        </div>
                                                        <div className="text-gray-700 font-semibold">
                                                            {item.productName}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <span>🗑️</span>
                                                        <span className="font-semibold">{t(translations.remove)}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specifications */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="text-sm text-gray-500 font-semibold mb-1">
                                                    {t(translations.material)}
                                                </div>
                                                <div className="text-gray-900">
                                                    {item.details.material}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 font-semibold mb-1">
                                                    {t(translations.stage)}
                                                </div>
                                                <div className="text-gray-900">
                                                    {item.details.stage === 'kg_primary'
                                                        ? t(translations.kgPrimary)
                                                        : t(translations.prepSecondary)
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 font-semibold mb-1">
                                                    {t(translations.logo)}
                                                </div>
                                                <div className="text-gray-900">
                                                    {item.details.logo
                                                        ? `${t(translations.uploaded)} ✓`
                                                        : t(translations.none)
                                                    }
                                                </div>
                                            </div>
                                            {item.details.notes && (
                                                <div className="md:col-span-2">
                                                    <div className="text-sm text-gray-500 font-semibold mb-1">
                                                        {t(translations.notes)}
                                                    </div>
                                                    <div className="text-gray-900">
                                                        {item.details.notes}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Size Matrix */}
                                        <div className="border-t pt-4">
                                            <div className="text-sm font-semibold text-gray-700 mb-3">
                                                {t(translations.sizeQuantity)}
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {Object.entries(item.details.sizes).map(([size, qty]) => (
                                                    <div
                                                        key={size}
                                                        className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20"
                                                    >
                                                        <span className="font-semibold text-gray-700">
                                                            {language === 'ar' ? 'مقاس' : 'Size'} {size}:
                                                        </span>
                                                        <span className="ml-2 font-bold text-primary">
                                                            {qty}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="px-4 py-2 bg-primary text-white rounded-lg font-bold">
                                                    {t(translations.total)}: {item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {t(translations.orderSummary)}
                            </h2>

                            {/* Total Items */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-semibold">
                                        {t(translations.totalItems)}
                                    </span>
                                    <span className="text-3xl font-bold text-primary">
                                        {getTotalItems()}
                                    </span>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">ℹ️</span>
                                        <div className="text-sm text-blue-900">
                                            {language === 'ar'
                                                ? 'هذا طلب عرض سعر. سنقوم بإرسال الاسعار التفصيلية قريباً.'
                                                : 'This is a quotation request. We will send detailed pricing soon.'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {t(translations.submitQuotation)}
                            </button>

                            <button
                                onClick={() => router.push('/sectors/schools')}
                                className="w-full mt-3 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                            >
                                {language === 'ar' ? 'إضافة المزيد' : 'Add More Items'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
