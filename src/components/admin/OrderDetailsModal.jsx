'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order?.status) setCurrentStatus(order.status);
  }, [order]);

  const translations = {
    orderDetails: { en: 'Order Details', ar: 'تفاصيل الطلب' },
    close: { en: 'Close', ar: 'إغلاق' },
    status: { en: 'Status', ar: 'الحالة' },
    updateStatus: { en: 'Update Status', ar: 'تحديث الحالة' },
    saveStatus: { en: 'Save Status', ar: 'حفظ الحالة' },
    saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
    statusUpdated: { en: 'Status updated successfully!', ar: 'تم تحديث الحالة بنجاح!' },
    createdAt: { en: 'Created', ar: 'تاريخ الإنشاء' },
    updatedAt: { en: 'Last Updated', ar: 'آخر تحديث' },
    orderInformation: { en: 'Order Information', ar: 'معلومات الطلب' },
    downloadFile: { en: 'Download', ar: 'تحميل' },
    viewFile: { en: 'View', ar: 'عرض' },
    sector: { en: 'Sector', ar: 'القطاع' },
    // Statuses
    pending: { en: 'Pending Review', ar: 'قيد المراجعة' },
    processing: { en: 'Processing', ar: 'قيد المعالجة' },
    in_production: { en: 'In Production', ar: 'قيد الإنتاج' },
    ready_for_delivery: { en: 'Ready for Delivery', ar: 'جاهز للتسليم' },
    delivered: { en: 'Delivered', ar: 'تم التسليم' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
    // B2C Translations
    customerInfo: { en: 'Customer Information', ar: 'بيانات العميل' },
    shippingAddress: { en: 'Shipping Address', ar: 'عنوان التوصيل' },
    orderItems: { en: 'Order Items', ar: 'المنتجات' },
    schoolName: { en: 'School Name', ar: 'المدرسة' },
    phone: { en: 'Phone', ar: 'رقم الجوال' },
    email: { en: 'Email', ar: 'البريد الإلكتروني' },
    size: { en: 'Size', ar: 'المقاس' },
    qty: { en: 'Qty', ar: 'الكمية' },
    productCode: { en: 'Code', ar: 'الكود' },
  };

  const statusOptions = [
    { value: 'pending', label: t(translations.pending) },
    { value: 'processing', label: t(translations.processing) },
    { value: 'in_production', label: t(translations.in_production) },
    { value: 'ready_for_delivery', label: t(translations.ready_for_delivery) },
    { value: 'delivered', label: t(translations.delivered) },
    { value: 'cancelled', label: t(translations.cancelled) },
  ];

  const sectorMap = {
    'students': { ar: 'أفراد (طالب/ولي أمر)', en: 'Individuals (Student/Parent)' },
    'schools': { ar: 'مدارس', en: 'Schools' },
    'medical': { ar: 'القطاع الطبي', en: 'Medical' },
    'corporate': { ar: 'الشركات والمكاتب', en: 'Corporate' },
    'hospitality': { ar: 'المطاعم والكافيهات', en: 'Hospitality' },
    'transportation': { ar: 'النقل والطيران', en: 'Transportation' },
    'domestic': { ar: 'العمالة المنزلية', en: 'Domestic' }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    in_production: 'bg-purple-100 text-purple-800',
    ready_for_delivery: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleStatusUpdate = async () => {
    if (!order?.id || currentStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: currentStatus, updatedAt: new Date() });
      order.status = currentStatus;
      alert(t(translations.statusUpdated));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatFieldName = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const renderFieldValue = (value) => {
    if (typeof value === 'object' && value !== null && value.url) {
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => (value.name || value.url).toLowerCase().endsWith(ext));
      return (
        <div className="flex flex-col space-y-3">
          <span className="text-sm text-gray-600">{value.name || 'File'}</span>
          {isImage && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-center items-center relative">
              <Image src={value.url} alt="Preview" width={128} height={128} className="object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div className="flex space-x-2 rtl:space-x-reverse">
            <a href={value.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">{t(translations.viewFile)}</a>
            <a href={value.url} download className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">{t(translations.downloadFile)}</a>
          </div>
        </div>
      );
    }
    return Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : String(value));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{t(translations.orderDetails)}</h2>
                <p className="text-white/90 text-sm font-mono mt-1">{order.orderId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(order.orderId)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg rtl:mr-2 ltr:ml-2"
                title={copied ? "Copied!" : "Copy Order ID"}
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
            {/* Sector & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t(translations.sector)}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {language === 'ar'
                    ? (order.sectorAr || sectorMap[order.sector]?.ar || order.sector)
                    : (sectorMap[order.sector]?.en || order.sector)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t(translations.createdAt)}</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Status Update */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t(translations.updateStatus)}</h3>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} disabled={updatingStatus} className={`flex-1 px-3 py-2 rounded-lg border border-gray-300 ${statusColors[currentStatus]} font-medium`}>
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={handleStatusUpdate} disabled={updatingStatus || currentStatus === order.status} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">{updatingStatus ? t(translations.saving) : t(translations.saveStatus)}</button>
              </div>
            </div>

            {/* --- B2C Customer Data (New) --- */}
            {order.customer && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t(translations.customerInfo)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">{t(translations.schoolName)}</p>
                    <p className="font-semibold">{order.customer.schoolName || 'N/A'}</p>

                    <p className="text-sm text-gray-500 mt-3 mb-1">{t(translations.phone)}</p>
                    <p className="font-semibold" dir="ltr">{order.customer.phone}</p>
                  </div>
                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">{t(translations.email)}</p>
                    <p className="font-semibold">{order.customer.email}</p>

                    <p className="text-sm text-gray-500 mt-3 mb-1">Name</p>
                    <p className="font-semibold">{order.customer.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- B2C Shipping Address (New) --- */}
            {order.customer?.shippingAddress && (
              <div className="mb-6 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📍 {t(translations.shippingAddress)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'المنطقة' : 'Region'}</p>
                    <p className="text-sm font-bold text-gray-900">{language === 'ar' ? (order.customer.shippingAddress.regionAr || order.customer.shippingAddress.region) : (order.customer.shippingAddress.regionEn || order.customer.shippingAddress.region)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'المدينة' : 'City'}</p>
                    <p className="text-sm font-bold text-gray-900">{language === 'ar' ? (order.customer.shippingAddress.cityAr || order.customer.shippingAddress.city) : (order.customer.shippingAddress.cityEn || order.customer.shippingAddress.city)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'الحي' : 'District'}</p>
                    <p className="text-sm font-bold text-gray-900">{order.customer.shippingAddress.district}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'الشارع' : 'Street'}</p>
                    <p className="text-sm font-bold text-gray-900">{order.customer.shippingAddress.street}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'رقم المبنى' : 'Building No'}</p>
                    <p className="text-sm font-bold text-gray-900">{order.customer.shippingAddress.building}</p>
                  </div>
                  {order.customer.shippingAddress.landmark && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-semibold mb-1">{language === 'ar' ? 'معلم مميز' : 'Landmark'}</p>
                      <p className="text-sm font-bold text-gray-900">{order.customer.shippingAddress.landmark}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- B2C Order Items (New) --- */}
            {order.items && order.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t(translations.orderItems)}</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-white border rounded-xl p-3 shadow-sm flex gap-4">
                      {item.image && (
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                          <Image src={item.image} alt={item.productName} fill className="object-contain p-1" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          {language === 'ar' ? (item.productNameAr || item.productName) : item.productName}
                        </h4>
                        <div className="text-xs text-primary-600 font-semibold mb-2">
                          {t(translations.productCode)}: {item.code || item.productId}
                        </div>

                        {/* Sizes Grid */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.details?.sizes || {}).map(([size, qty]) => (
                            <span key={size} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 border border-gray-200">
                              <span className="text-gray-500 mr-1">{t(translations.size)} {size}:</span>
                              <span className="font-bold text-gray-900">{qty}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Legacy B2B Data --- */}
            {order.formData && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t(translations.orderInformation)} (Legacy)</h3>
                <div className="space-y-4">
                  {Object.entries(order.formData).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex flex-col md:flex-row gap-2">
                        <span className="text-sm font-medium text-gray-700 md:w-1/3">{formatFieldName(key)}</span>
                        <div className="text-sm text-gray-900 md:w-2/3 break-words">{renderFieldValue(value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetailsModal;