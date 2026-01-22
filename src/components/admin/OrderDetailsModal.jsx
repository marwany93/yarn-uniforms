'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
    schools: { en: 'Schools', ar: 'المدارس' },
    factories: { en: 'Factories', ar: 'المصانع' },
    companies: { en: 'Companies', ar: 'الشركات' },
    hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
    pending: { en: 'Pending Review', ar: 'قيد المراجعة' },
    processing: { en: 'Processing', ar: 'قيد المعالجة' },
    in_production: { en: 'In Production', ar: 'قيد الإنتاج' },
    ready_for_delivery: { en: 'Ready for Delivery', ar: 'جاهز للتسليم' },
    delivered: { en: 'Delivered', ar: 'تم التسليم' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };

  const statusOptions = [
    { value: 'pending', label: t(translations.pending) },
    { value: 'processing', label: t(translations.processing) },
    { value: 'in_production', label: t(translations.in_production) },
    { value: 'ready_for_delivery', label: t(translations.ready_for_delivery) },
    { value: 'delivered', label: t(translations.delivered) },
    { value: 'cancelled', label: t(translations.cancelled) },
  ];

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
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-center items-center">
              <img src={value.url} alt="Preview" className="w-32 h-32 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
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
              {/* Professional Copy Button */}
              <button
                onClick={() => copyToClipboard(order.orderId)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg ltr:ml-2 rtl:mr-2"
                title={copied ? "Copied!" : "Copy Order ID"}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t(translations.sector)}</p>
                <p className="text-lg font-semibold text-gray-900">{t(translations[order.sector])}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t(translations.createdAt)}</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t(translations.updateStatus)}</h3>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} disabled={updatingStatus} className={`flex-1 px-3 py-2 rounded-lg border border-gray-300 ${statusColors[currentStatus]} font-medium`}>
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={handleStatusUpdate} disabled={updatingStatus || currentStatus === order.status} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">{updatingStatus ? t(translations.saving) : t(translations.saveStatus)}</button>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t(translations.orderInformation)}</h3>
              <div className="space-y-4">
                {order.formData && Object.entries(order.formData).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex flex-col md:flex-row gap-2">
                      <span className="text-sm font-medium text-gray-700 md:w-1/3">{formatFieldName(key)}</span>
                      <div className="text-sm text-gray-900 md:w-2/3 break-words">{renderFieldValue(value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetailsModal;