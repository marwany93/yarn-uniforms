'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/hooks/useLanguage';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CheckoutModal from '@/components/cart/CheckoutModal';

export default function CartPage() {
    const router = useRouter();

    const cartContext = useCart();
    const { cart = [], removeFromCart = () => { }, clearCart = () => { }, getCartItemCount = () => 0 } = cartContext || {};

    const { t, language } = useLanguage();
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [lastOrderSector, setLastOrderSector] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    }, [showSuccess]);

    const translations = {
        pageTitle: { en: 'Quotation Request Review', ar: 'مراجعة طلب عرض السعر' },
        clientInformation: { en: 'Client Information', ar: 'بيانات العميل' },
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
        requestSent: { en: 'Your request has been sent successfully.', ar: 'تم إرسال الطلب بنجاح.' },
        orderReference: { en: 'Order Reference', ar: 'رقم الطلب' },
        weWillContact: { en: 'We will contact you shortly.', ar: 'سنتواصل معك قريباً.' },
        backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
        newOrder: { en: 'New Order', ar: 'طلب جديد' },
    };

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

    const getContactInfo = () => {
        if (cart.length === 0) return null;
        return cart[0]?.details?.contactInfo || null;
    };

    const contactInfo = getContactInfo();

    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleProceedToCheckout = () => {
        if (cart.length === 0) return;

        // التحقق إذا كان الطلب خاص بالأفراد (طلاب)
        const isStudentOrder = cart.some(item => item.sector === 'students' || item.details?.sector === 'students' || item.details?.isStudentOrder);

        if (isStudentOrder) {
            // طلاب (B2C): لازم يفتح نافذة التوصيل عشان يدخل العنوان
            setShowCheckoutModal(true);
        } else {
            // مدارس وشركات (B2B): يتأكد إن البيانات موجودة ويبعت فوراً
            const hasB2BInfo = contactInfo && (contactInfo.name || contactInfo.contactPerson);

            if (hasB2BInfo) {
                processOrder(contactInfo); // إرسال الطلب مباشرة بدون نوافذ
            } else {
                setShowCheckoutModal(true); // احتياطي فقط لو البيانات فُقدت
            }
        }
    };

    const processOrder = async (customerData) => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        try {
            const newOrderId = 'YARN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
            setOrderId(newOrderId);

            const isStudentOrder = cart.some(item => item.sector === 'students' || item.details?.isStudentOrder);
            const orderSector = isStudentOrder ? 'students' : 'schools';
            setLastOrderSector(orderSector);

            const orderData = {
                orderId: newOrderId,
                customer: {
                    name: customerData?.contactPerson || customerData?.name || 'N/A',
                    email: customerData?.email || 'N/A',
                    phone: customerData?.phone || 'N/A',
                    // التعديل هنا: سحب كود أو اسم المدرسة من منتجات الطالب
                    schoolName: customerData?.schoolName || contactInfo?.schoolName || cart.find(item => item.sector === 'students')?.details?.schoolName || cart.find(item => item.sector === 'students')?.details?.schoolId || 'N/A',
                    shippingAddress: customerData?.shippingAddress || null,
                    type: isStudentOrder ? 'B2C' : 'B2B'
                },
                items: cart,
                sector: orderSector,
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

            await addDoc(collection(db, 'orders'), orderData);
            console.log('✅ Order saved to Firestore:', newOrderId);

            try {
                await fetch('/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: customerData?.email || 'N/A',
                        orderId: newOrderId,
                        customerName: customerData?.contactPerson || customerData?.name,
                        items: cart.map(item => ({
                            name: item.productNameAr || item.productName,
                            size: item.details.sizes ? Object.keys(item.details.sizes).join(', ') : '',
                            quantity: item.quantity
                        })),
                        total: 0,
                        type: 'NEW_ORDER'
                    })
                });
            } catch (emailError) {
                console.error('❌ Failed to send email:', emailError);
            }

            clearCart();
            try {
                sessionStorage.clear();
            } catch (e) {
                console.warn('Failed to clear session storage:', e);
            }

            setShowCheckoutModal(false);
            setShowSuccess(true);
        } catch (error) {
            console.error('❌ Error saving order to Firestore:', error);
            alert('Failed to submit order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // -- التوجيه الذكي للمكان السابق --
    const [returnUrl, setReturnUrl] = useState('');
    const [generalUrl, setGeneralUrl] = useState('/sectors/schools');

    useEffect(() => {
        if (cart.length > 0) {
            const isStudent = cart.some(item => item.sector === 'students' || item.details?.sector === 'students');
            const schoolId = cart.find(item => item.details?.schoolId)?.details?.schoolId;

            // الرابط العام لاختيار المدارس
            const general = isStudent ? '/students' : '/sectors/schools';
            setGeneralUrl(general);

            // رابط المدرسة المحددة
            let url = general;
            if (isStudent && schoolId) {
                url = `/students/${schoolId}`;
            }

            setReturnUrl(url);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('cartReturnUrl', url);
                sessionStorage.setItem('cartGeneralUrl', general);
            }
        } else if (typeof window !== 'undefined') {
            const savedUrl = sessionStorage.getItem('cartReturnUrl');
            if (savedUrl) setReturnUrl(savedUrl);

            const savedGeneral = sessionStorage.getItem('cartGeneralUrl');
            if (savedGeneral) setGeneralUrl(savedGeneral);
        }
    }, [cart]);

    // دالة بدء طلب جديد
    const handleNewOrder = () => {
        clearCart();
        setShowSuccess(false);
        router.push(generalUrl); // يرجع لصفحة اختيار المدارس العامة
    };

    // شاشة السلة الفارغة
    if (cart.length === 0 && !showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t(translations.emptyCart)}</h2>
                        <p className="text-gray-600 mb-8">{language === 'ar' ? 'ابدأ بإضافة المنتجات إلى سلتك' : 'Start adding products to your cart'}</p>
                        <button
                            onClick={() => router.push(generalUrl)} // يرجع لصفحة اختيار المدارس العامة
                            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                        >
                            {t(translations.startOrdering)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // شاشة نجاح الطلب
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
                    <div className="text-7xl mb-6">✅</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t(translations.thankYou)}</h1>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-500 font-semibold mb-1">{t(translations.orderReference)}</p>
                        <p className="text-3xl font-bold text-primary">{orderId}</p>
                    </div>
                    <p className="text-xl text-gray-700 mb-2">{t(translations.requestSent)}</p>
                    <p className="text-gray-600 mb-8">{t(translations.weWillContact)}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => router.push('/')} className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                            {t(translations.backToHome)}
                        </button>
                        <button onClick={handleNewOrder} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all">
                            {t(translations.newOrder)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
                    <div className="text-7xl mb-6">✅</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t(translations.thankYou)}</h1>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-500 font-semibold mb-1">{t(translations.orderReference)}</p>
                        <p className="text-3xl font-bold text-primary">{orderId}</p>
                    </div>
                    <p className="text-xl text-gray-700 mb-2">{t(translations.requestSent)}</p>
                    <p className="text-gray-600 mb-8">{t(translations.weWillContact)}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => router.push('/')} className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                            {t(translations.backToHome)}
                        </button>
                        <button onClick={handleNewOrder} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all">
                            {t(translations.newOrder)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{t(translations.pageTitle)}</h1>
                    <div className="h-1 w-24 bg-primary rounded"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {contactInfo && contactInfo.name && !isStudentOrder && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    {t(translations.clientInformation)}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contactInfo.schoolName && (
                                        <div>
                                            <div className="text-sm text-gray-500 font-semibold mb-1">{t(translations.schoolName)}</div>
                                            <div className="text-lg font-bold text-gray-900">{contactInfo.schoolName}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">{t(translations.contactPerson)}</div>
                                        <div className="text-lg font-bold text-gray-900">{contactInfo.contactPerson || contactInfo.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">{t(translations.email)}</div>
                                        <div className="text-gray-700">{contactInfo.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-semibold mb-1">{t(translations.phone)}</div>
                                        <div className="text-gray-700" dir="ltr">{contactInfo.phone}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">{t(translations.orderItems)}</h2>
                            {cart.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex gap-4 items-start">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                                                <Image
                                                    src={item.image}
                                                    alt={language === 'ar' ? item.productNameAr : item.productName}
                                                    fill
                                                    className="object-contain p-2 hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Info & Actions */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-2">
                                                    {/* Title & Code */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-lg font-bold text-primary mb-1">
                                                            {item.code || item.productId}
                                                        </div>
                                                        <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate" title={item.productName}>
                                                            {language === 'ar' ? (item.productNameAr || item.productName) : item.productName}
                                                        </h3>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => {
                                                                if (item.sector === 'students' && item.details?.schoolId) {
                                                                    router.push(`/students/${item.details.schoolId}?editId=${item.id}`);
                                                                } else {
                                                                    router.push(`/sectors/schools?editId=${item.id}`);
                                                                }
                                                            }}
                                                            className="w-9 h-9 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"
                                                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm"
                                                            title={language === 'ar' ? 'حذف' : 'Delete'}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Size Matrix (Clean View) */}
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="text-xs font-bold text-gray-400 mb-3">
                                                        {t(translations.sizeQuantity)}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {Object.entries(item.details.sizes || {}).map(([size, qty]) => (
                                                            <div key={size} className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                                                                <span className="text-gray-500 text-sm font-medium">
                                                                    {language === 'ar' ? 'مقاس' : 'Size'} {size}
                                                                </span>
                                                                <span className="mx-2 h-4 w-px bg-gray-300"></span>
                                                                <span className="text-gray-900 font-bold text-sm">
                                                                    {qty}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {/* Total Pill (Pushed to the end) */}
                                                        <div className="inline-flex items-center px-4 py-1.5 bg-[#1e293b] text-white rounded-lg font-bold text-sm mr-auto rtl:mr-0 rtl:ml-auto shadow-md">
                                                            {t(translations.total)}: {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t(translations.orderSummary)}</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-semibold">{t(translations.totalItems)}</span>
                                    <span className="text-3xl font-bold text-primary">{getTotalItems()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {t(translations.submitQuotation)}
                            </button>

                            <button onClick={() => router.push(returnUrl || generalUrl)} className="w-full mt-3 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                                {language === 'ar' ? 'إضافة المزيد' : 'Add More Items'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showCheckoutModal && (
                <CheckoutModal
                    isOpen={showCheckoutModal}
                    onClose={() => setShowCheckoutModal(false)}
                    onSubmit={processOrder}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}