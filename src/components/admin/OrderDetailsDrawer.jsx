'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/hooks/useLanguage';

export default function OrderDetailsDrawer({ isOpen, onClose, order }) {
    const { language, t } = useLanguage();
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // --- Localization Maps ---

    const adminTrans = {
        title: { en: 'Order Details', ar: 'تفاصيل الطلب' },
        customerInfo: { en: 'CUSTOMER INFORMATION', ar: 'بيانات العميل' },
        timeline: { en: 'ORDER STATUS & TIMELINE', ar: 'حالة الطلب والجدول الزمني' },
        currentStatus: { en: 'Current Status', ar: 'الحالة الحالية' },
        updateStatus: { en: 'Update Status', ar: 'تحديث الحالة' },
        expectedDate: { en: 'Expected Completion Date (Optional)', ar: 'تاريخ الانتهاء المتوقع (اختياري)' },
        dateHint: { en: 'Leave empty if unknown', ar: 'اتركه فارغاً إذا كان غير محدد' },
        updateBtn: { en: 'Update Order', ar: 'تحديث الطلب' },
        updating: { en: 'Updating...', ar: 'جاري التحديث...' },
        totalTitle: { en: 'Order Items (Total)', ar: 'المنتجات (Total)' },
        totalQty: { en: 'Items', ar: 'قطع' },
        code: { en: 'Code', ar: 'الكود' },
        fabric: { en: 'Fabric', ar: 'الخامة' },
        color: { en: 'Color', ar: 'اللون' },
        custom: { en: 'Custom:', ar: 'مخصص:' },
        viewSample: { en: 'View Sample', ar: 'عرض العينة' },
        unspecified: { en: 'Unspecified', ar: 'غير محدد' },
        notSelected: { en: 'Not selected', ar: 'لم يتم التحديد' },
        sizeBreakdown: { en: 'Size Breakdown', ar: 'تفاصيل المقاسات' },
        size: { en: 'Size', ar: 'مقاس' },
        pcs: { en: 'pcs', ar: 'قطعة' },
        notes: { en: 'Notes:', ar: 'ملاحظات:' },
        customerUpload: { en: 'Customer Uploaded Reference/Logo', ar: 'مرفق / شعار من العميل' },
        clickToView: { en: 'Click image to preview', ar: 'اضغط على الصورة للمعانية' },
        openFull: { en: 'Open Full Size', ar: 'عرض بالحجم الكامل' },
        viewAttachment: { en: 'View Attachment', ar: 'عرض المرفق' },
        viewLogo: { en: 'View Logo', ar: 'عرض الشعار' },
        logo: { en: 'Logo:', ar: 'الشعار:' },
        metadata: { en: 'Order Metadata', ar: 'بيانات الطلب' },
        sector: { en: 'Sector', ar: 'القطاع' },
        created: { en: 'Created', ar: 'تاريخ الإنشاء' },
        totalItems: { en: 'Total Items', ar: 'إجمالي القطع' },
        close: { en: 'Close', ar: 'إغلاق' },
        statusUpdated: { en: 'Status Updated Successfully', ar: 'تم تحديث الحالة بنجاح' }
    };

    const STATUS_STAGES = [
        'Order Received',
        'Contacting',
        'Quotation Sent',
        'Sample Production',
        'Manufacturing',
        'Delivered',
        'Cancelled'
    ];

    const statusTranslations = {
        'Order Received': { en: 'Order Received', ar: 'تم استلام الطلب' },
        'Contacting': { en: 'Contacting', ar: 'جاري التواصل' },
        'Quotation Sent': { en: 'Quotation Sent', ar: 'تم إرسال عرض السعر' },
        'Sample Production': { en: 'Sample Production', ar: 'تنفيذ العينة' },
        'Manufacturing': { en: 'Manufacturing', ar: 'مرحلة التصنيع' },
        'Delivered': { en: 'Delivered', ar: 'تم التسليم' },
        'Cancelled': { en: 'Cancelled', ar: 'ملغي' }
    };

    const sectorMap = {
        'schools': { en: 'Schools', ar: 'مدارس' },
        'school': { en: 'Schools', ar: 'مدارس' },
        'factories': { en: 'Factories', ar: 'مصانع' },
        'corporate': { en: 'Corporate', ar: 'شركات' },
        'medical': { en: 'Medical', ar: 'طبي' },
        'hospitality': { en: 'Hospitality', ar: 'ضيافة' },
        'students': { en: 'Students (B2C)', ar: 'أفراد (طلاب)' }
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

    // Color mapping for standard palette logic (keeping hex values)
    const COLOR_MAP = {
        1: { label: 'White', hex: '#FFFFFF', border: '#D1D5DB' },
        2: { label: 'Green', hex: '#166534' },
        3: { label: 'Navy', hex: '#1e3a8a' },
        4: { label: 'Blue', hex: '#2563eb' },
        5: { label: 'Black', hex: '#000000' },
        6: { label: 'Grey', hex: '#4b5563' },
        7: { label: 'Red', hex: '#DC2626' },
        8: { label: 'Beige', hex: '#F5F5DC', border: '#D1D5DB' },
        9: { label: 'Light Blue', hex: '#ADD8E6' }
    };

    const statusColors = {
        'Order Received': 'bg-yellow-100 text-yellow-800',
        'Contacting': 'bg-blue-100 text-blue-800',
        'Quotation Sent': 'bg-indigo-100 text-indigo-800',
        'Sample Production': 'bg-purple-100 text-purple-800',
        'Manufacturing': 'bg-orange-100 text-orange-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
    };

    // --- Effects & Logic ---

    useEffect(() => {
        if (order && isOpen) {
            setNewStatus(order.status || 'Order Received');
            if (order.expectedCompletionDate) {
                const dateStr = typeof order.expectedCompletionDate === 'string'
                    ? order.expectedCompletionDate
                    : order.expectedCompletionDate?.toDate?.()?.toISOString()?.split('T')[0] || '';
                setExpectedDate(dateStr);
            } else {
                setExpectedDate('');
            }
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const today = new Date().toISOString().split('T')[0];

    const getStatusLabel = (status) => {
        if (!status) return status;
        const normalized = statusTranslations[status];
        if (normalized) return language === 'ar' ? normalized.ar : normalized.en;
        return status;
    };

    const handleUpdateOrder = async () => {
        if (!order?.id) return;
        setUpdating(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            const targetDate = expectedDate ? new Date(expectedDate) : null;

            await updateDoc(orderRef, {
                status: newStatus,
                expectedCompletionDate: targetDate || null,
                lastUpdated: new Date()
            });

            // --- Send Status Update Email ---
            try {
                await fetch('/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: order.customer?.email,
                        orderId: order.orderId,
                        customerName: order.customer?.name,
                        status: newStatus,
                        type: 'STATUS_UPDATE'
                    })
                });
                console.log('📧 Status update email sent');
            } catch (emailError) {
                console.error('❌ Failed to send email:', emailError);
            }
            // -------------------------------
            alert('✅ ' + t(adminTrans.statusUpdated));
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('❌ Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // --- Render ---

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 bg-white shadow-2xl z-50 overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t(adminTrans.title)}</h2>
                        <p className="text-sm text-primary-600 font-semibold mt-1">{order.orderId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => copyToClipboard(order.orderId)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
                            title="Copy Order ID"
                        >
                            {copiedId === order.orderId ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* --- Customer Information Section --- */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                        <h4 className={`text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider border-b border-gray-200 pb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t(adminTrans.customerInfo)}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                                <span className="block text-xs text-gray-500 mb-1">{language === 'ar' ? 'الاسم' : 'Name'}</span>
                                <p className="text-sm font-bold text-gray-900">{order.customer?.name || 'N/A'}</p>
                            </div>

                            {/* School */}
                            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                                <span className="block text-xs text-gray-500 mb-1">{language === 'ar' ? 'المدرسة' : 'School'}</span>
                                <p className="text-sm font-bold text-gray-900">{order.customer?.schoolName || 'N/A'}</p>
                            </div>

                            {/* Email */}
                            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                                <span className="block text-xs text-gray-500 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                                <p className="text-sm font-bold text-gray-900 break-all font-mono text-xs sm:text-sm">
                                    {order.customer?.email || 'N/A'}
                                </p>
                            </div>

                            {/* Phone - Force LTR for numbers, but align Right for Arabic context */}
                            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                                <span className="block text-xs text-gray-500 mb-1">{language === 'ar' ? 'رقم الجوال' : 'Phone'}</span>
                                <div
                                    className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                                    dir="ltr"
                                >
                                    <span className="text-gray-500 font-medium text-sm">
                                        {order.customer?.countryCode || order.countryCode || '+966'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 tracking-wider">
                                        {order.customer?.phone || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Status & Timeline --- */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{t(adminTrans.timeline)}</h3>
                        <div className="space-y-4">
                            {/* Current Status */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">{t(adminTrans.currentStatus)}</label>
                                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            {/* Status Update Dropdown (Fixed RTL Arrow) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t(adminTrans.updateStatus)}</label>
                                <div className="relative">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm h-10 ${language === 'ar' ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                                    >
                                        {Object.keys(statusTranslations).map((statusKey) => (
                                            <option key={statusKey} value={statusKey}>
                                                {getStatusLabel(statusKey)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Expected Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t(adminTrans.expectedDate)}</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={expectedDate}
                                    onChange={(e) => setExpectedDate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t(adminTrans.dateHint)}</p>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleUpdateOrder}
                                disabled={updating}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
                            >
                                {updating ? t(adminTrans.updating) : t(adminTrans.updateBtn)}
                            </button>
                        </div>
                    </div>

                    {/* --- Order Items --- */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            {t(adminTrans.totalTitle).replace('(Total)', `(${order.totalItems || order.items?.length || 0} ${t(adminTrans.totalQty)})`)}
                        </h3>
                        <div className="space-y-4">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex gap-3 mb-3">
                                            {item.image && (
                                                <div className="relative w-20 h-20 flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.productName || 'Product'}
                                                        fill
                                                        className="object-cover rounded-lg border-2 border-gray-300"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-base">
                                                    {language === 'ar' ? (item.productNameAr || item.productName) : item.productName}
                                                </h4>
                                                {item.code && (
                                                    <p className="text-xs text-gray-500 mt-1">{t(adminTrans.code)}: {item.code}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Badges / Specifications */}
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {item.details?.material && (
                                                <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded">
                                                    🧶 {item.details.material}
                                                </span>
                                            )}
                                            {item.details?.stage && (
                                                <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded">
                                                    {(() => {
                                                        const stageVal = item.details.stage;
                                                        const mappedStage = stageMap[stageVal]
                                                            ? (language === 'ar' ? stageMap[stageVal].ar : stageMap[stageVal].en)
                                                            : stageVal;
                                                        return <>🏫 {mappedStage}</>;
                                                    })()}
                                                </span>
                                            )}
                                            {item.details?.logoName && !item.details?.uploadedLogoUrl && (
                                                <span className="text-xs bg-green-50 border border-green-300 text-green-700 px-2 py-1 rounded font-medium">
                                                    🏷️ {t(adminTrans.logo)} {item.details.logoName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details Box: Fabric, Color, Ref, Logo */}
                                        {(item.details?.fabric || item.fabric || item.details?.color || item.selectedColor || item.referenceFileUrl || item.details?.uploadedLogoUrl || item.details?.logoType) && (
                                            <div className="mt-3 space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">

                                                {/* Fabric */}
                                                {(item.details?.fabric || item.fabric) && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">{t(adminTrans.fabric)}:</span>
                                                        <span className="px-2 py-0.5 bg-white border rounded text-gray-800">
                                                            {language === 'ar' ? (item.details?.fabricAr || item.fabricAr || item.details?.fabric || item.fabric) : (item.details?.fabric || item.fabric)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Color */}
                                                {(item.details?.color || item.selectedColor) && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">{t(adminTrans.color)}:</span>
                                                        {item.details?.color === 'custom' || item.selectedColor === 'custom' ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-yellow-700 font-medium">{t(adminTrans.custom)} {item.details?.customColorName || item.customColorName || t(adminTrans.unspecified)}</span>
                                                                {(item.details?.customColorUrl || item.customColorUrl) && (
                                                                    <a
                                                                        href={item.details?.customColorUrl || item.customColorUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline text-xs flex items-center"
                                                                    >
                                                                        ({t(adminTrans.viewSample)} 📎)
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span>
                                                                    {(() => {
                                                                        const colorVal = item.details?.color || item.selectedColor;
                                                                        // Handle string vs number IDs if mixed
                                                                        const colorId = String(colorVal);
                                                                        return colorMap[colorId]
                                                                            ? (language === 'ar' ? colorMap[colorId].ar : colorMap[colorId].en)
                                                                            : colorVal;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Logo Details */}
                                                {item.details?.logoType && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">{t(adminTrans.logo)}:</span>
                                                        <span className="px-2 py-0.5 bg-white border rounded text-gray-800">
                                                            {(() => {
                                                                const type = item.details.logoType;
                                                                const placement = item.details.logoPlacement;

                                                                const typeText = logoTypeMap[type]
                                                                    ? (language === 'ar' ? logoTypeMap[type].ar : logoTypeMap[type].en)
                                                                    : type;

                                                                const placementText = logoPlacementMap[placement]
                                                                    ? (language === 'ar' ? logoPlacementMap[placement].ar : logoPlacementMap[placement].en)
                                                                    : placement;

                                                                return `${typeText} ${placementText ? `(${placementText})` : ''}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Reference File */}
                                                {item.referenceFileUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">{t(adminTrans.reference)}:</span>
                                                        <a
                                                            href={item.referenceFileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-xs"
                                                        >
                                                            {t(adminTrans.viewFile)} 📎
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Uploaded Logo Check */}
                                                {item.details?.uploadedLogoUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">{t(adminTrans.logo)}:</span>
                                                        <a
                                                            href={item.details.uploadedLogoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-xs"
                                                        >
                                                            {t(adminTrans.viewLogo)} 📎
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Size Breakdown */}
                                        {item.details?.sizes && Object.keys(item.details.sizes).length > 0 ? (
                                            <div className="bg-white p-3 rounded border-2 border-blue-100 mt-2">
                                                <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">📏 {t(adminTrans.sizeBreakdown)}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(item.details.sizes).map(([size, qty]) => (
                                                        qty > 0 && (
                                                            <div key={size} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 font-medium">
                                                                <span className="text-gray-600">{t(adminTrans.size)} </span>
                                                                <span className="font-bold text-blue-900">{size}</span>
                                                                <span className="text-gray-600">: </span>
                                                                <span className="font-bold text-blue-900">{qty}</span>
                                                                <span className="text-xs text-gray-500"> {t(adminTrans.pcs)}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 p-2 rounded border border-red-200 mt-2">
                                                <p className="text-xs text-red-600">⚠️ No size data found for this item</p>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {item.details?.notes && (
                                            <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <span className="font-semibold">📝 {t(adminTrans.notes)} </span>
                                                {item.details.notes}
                                            </div>
                                        )}

                                        {/* Customer Uploaded Interactive Preview */}
                                        {item.details?.uploadedLogoUrl && (
                                            <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                                <p className="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wider">
                                                    📎 {t(adminTrans.customerUpload)}
                                                </p>
                                                <div className="flex items-start gap-3">
                                                    <a
                                                        href={item.details.uploadedLogoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0"
                                                    >
                                                        <div className="relative w-20 h-20 bg-white border-2 border-yellow-300 rounded-lg hover:scale-110 transition-transform cursor-pointer shadow-md">
                                                            <Image
                                                                src={item.details.uploadedLogoUrl}
                                                                alt="Customer Logo"
                                                                fill
                                                                className="object-contain rounded-lg"
                                                            />
                                                        </div>
                                                    </a>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {t(adminTrans.clickToView)}
                                                        </p>
                                                        <a
                                                            href={item.details.uploadedLogoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 underline hover:text-blue-800 font-medium"
                                                        >
                                                            🔗 {t(adminTrans.openFull)}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic text-center p-4">{t(adminTrans.noItems)}</p>
                            )}
                        </div>
                    </div>

                    {/* --- Order Metadata --- */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{t(adminTrans.metadata)}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t(adminTrans.sector)}:</span>
                                <span className="text-gray-900 font-medium">
                                    {(() => {
                                        const sec = order.sector?.toLowerCase()?.trim();
                                        return sectorMap[sec]
                                            ? (language === 'ar' ? sectorMap[sec].ar : sectorMap[sec].en)
                                            : (order.sector || 'N/A');
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t(adminTrans.created)}:</span>
                                <span className="text-gray-900 font-medium" dir="ltr">
                                    {order.createdAt?.toDate?.()
                                        ? order.createdAt.toDate().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                                        : (order.createdAt?.seconds
                                            ? new Date(order.createdAt.seconds * 1000).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                                            : 'N/A')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t(adminTrans.totalItems)}:</span>
                                <span className="text-gray-900 font-medium">{order.totalItems || 0}</span>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {t(adminTrans.close)}
                    </button>
                </div>
            </div >
        </>
    );
}