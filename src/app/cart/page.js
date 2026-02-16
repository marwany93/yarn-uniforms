'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
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

    // Auto-scroll to top when Success View appears
    useEffect(() => {
        if (showSuccess) {
            // Instant jump to top
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome/Firefox
        }
    }, [showSuccess]);

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
        fabric: { en: 'Fabric Type', ar: 'نوع القماش' },
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
        submitQuotation: { en: 'Submit Order', ar: 'إرسال الطلب' },
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

    // --- Translation Maps ---
    const stageMap = {
        'kg_primary': { ar: 'رياض أطفال وابتدائي', en: 'KG & Primary' },
        'prep_secondary': { ar: 'إعدادي وثانوي', en: 'Middle/High School' },
        'high_school': { ar: 'ثانوي', en: 'High School' }
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

            // --- Send Confirmation Email ---
            try {
                await fetch('/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: contactInfo.email,
                        orderId: newOrderId,
                        customerName: contactInfo.contactPerson || contactInfo.name,
                        items: cart.map(item => ({
                            name: item.productNameAr || item.productName,
                            size: item.details.sizes ? Object.keys(item.details.sizes).join(', ') : '',
                            quantity: item.quantity
                        })),
                        total: 0, // Quotation request = 0 price
                        type: 'NEW_ORDER'
                    })
                });
                console.log('📧 Confirmation email sent');
            } catch (emailError) {
                console.error('❌ Failed to send email:', emailError);
            }
            // -------------------------------

            // Clear cart after successful save
            clearCart();

            // CLARITY FIX: Clear all wizard state from session storage
            // This ensures the next order starts fresh without old contact info or category selections
            try {
                sessionStorage.removeItem('schoolContactInfo');
                sessionStorage.removeItem('selectedCategoryIds');
                sessionStorage.removeItem('schoolWizardState'); // Just in case
                sessionStorage.clear(); // Safety wipe to ensure no stale data persists
                console.log('🧹 Session storage cleared');
            } catch (e) {
                console.warn('Failed to clear session storage:', e);
            }

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
                                        <div className="flex gap-4 mb-4">
                                            {/* Product Image (Right side in RTL) */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                                                <Image
                                                    src={item.image}
                                                    alt={language === 'ar' ? item.productNameAr : item.productName}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            </div>

                                            {/* Info & Actions */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    {/* Title */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xl font-bold text-primary mb-0.5">
                                                            {item.code}
                                                        </div>
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate" title={item.productName}>
                                                            {item.productName}
                                                        </h3>
                                                    </div>

                                                    {/* Action Buttons (Strictly constrained) */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            onClick={() => router.push('/sectors/schools?editId=' + item.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                            title={language === 'ar' ? 'حذف' : 'Delete'}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specifications */}
                                        <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm grid grid-cols-2 gap-y-3 gap-x-2">
                                            {/* Fabric */}
                                            <div>
                                                <span className="block text-gray-500 text-xs mb-0.5">{language === 'ar' ? 'القماش' : 'Fabric'}</span>
                                                <span className="font-bold text-gray-800">{language === 'ar' ? (item.details.fabricAr || item.details.fabric) : item.details.fabric}</span>
                                            </div>

                                            {/* Stage */}
                                            <div>
                                                <span className="block text-gray-500 text-xs mb-0.5">{language === 'ar' ? 'المرحلة' : 'Stage'}</span>
                                                <span className="font-bold text-gray-800">
                                                    {item.details.stage ? (language === 'ar' ? stageMap[item.details.stage]?.ar : stageMap[item.details.stage]?.en) : '-'}
                                                </span>
                                            </div>

                                            {/* Color */}
                                            <div>
                                                <span className="block text-gray-500 text-xs mb-0.5">{language === 'ar' ? 'اللون' : 'Color'}</span>
                                                <span className="font-bold text-gray-800">
                                                    {item.details.color === 'custom'
                                                        ? (item.details.customColorName || (language === 'ar' ? 'مخصص' : 'Custom'))
                                                        : (item.details.color ? (language === 'ar' ? colorMap[item.details.color]?.ar : colorMap[item.details.color]?.en) : '-')}
                                                </span>
                                            </div>

                                            {/* Logo */}
                                            <div>
                                                <span className="block text-gray-500 text-xs mb-0.5">{language === 'ar' ? 'الشعار' : 'Logo'}</span>
                                                <span className="font-bold text-gray-800">
                                                    {!item.details.logoType ? (language === 'ar' ? 'لا يوجد' : 'None') : (
                                                        <>
                                                            {language === 'ar' ? logoTypeMap[item.details.logoType]?.ar : logoTypeMap[item.details.logoType]?.en}
                                                            {item.details.logoPlacement && (
                                                                <span className="text-gray-500 text-xs mx-1">
                                                                    ({language === 'ar' ? logoPlacementMap[item.details.logoPlacement]?.ar : logoPlacementMap[item.details.logoPlacement]?.en})
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Notes (Full Width) */}
                                            {item.details.notes && (
                                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                                    <span className="block text-gray-500 text-xs mb-0.5">{t(translations.notes)}</span>
                                                    <p className="text-gray-800">{item.details.notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Size Matrix */}
                                        <div className="border-t pt-4">
                                            <div className="text-sm font-semibold text-gray-700 mb-3">
                                                {t(translations.sizeQuantity)}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(item.details.sizes).map(([size, qty]) => (
                                                    <div key={size} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                                        <span className="text-gray-500 text-sm font-medium">
                                                            {language === 'ar' ? 'مقاس' : 'Size'} {size}
                                                        </span>
                                                        <span className="mx-2 h-4 w-px bg-gray-300"></span>
                                                        <span className="text-primary font-bold text-sm">
                                                            {qty}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-md shadow-sm font-bold text-sm">
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
                                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
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
