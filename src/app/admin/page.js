'use client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import OrderDetailsDrawer from '@/components/admin/OrderDetailsDrawer';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, in_production: 0, ready_for_delivery: 0, delivered: 0, cancelled: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null); // Track which ID is currently showing the "Checkmark"

    useEffect(() => {
        if (!loading && !user) router.push('/admin/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
            const newStats = ordersData.reduce((acc, order) => {
                acc.total++;
                if (order.status) acc[order.status]++;
                return acc;
            }, { total: 0, pending: 0, processing: 0, in_production: 0, ready_for_delivery: 0, delivered: 0, cancelled: 0 });
            setStats(newStats);
        });
        return () => unsubscribe();
    }, [user]);

    // Function to handle copy inside the table
    const copyToClipboard = async (text, e) => {
        e.stopPropagation(); // Prevents the row click event (opening the modal)
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(text);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) { console.error('Failed to copy:', err); }
    };

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

    const translations = { dashboard: { en: 'Admin Dashboard', ar: 'لوحة تحكم المسؤول' }, manageOrders: { en: 'Manage all uniform orders', ar: 'إدارة جميع طلبات الزي الموحد' }, logout: { en: 'Logout', ar: 'تسجيل خروج' }, totalOrders: { en: 'Total Orders', ar: 'إجمالي الطلبات' }, pending: { en: 'Pending', ar: 'قيد المراجعة' }, inProduction: { en: 'In Production', ar: 'قيد الإنتاج' }, delivered: { en: 'Delivered', ar: 'تم التسليم' }, recentOrders: { en: 'Recent Orders', ar: 'أحدث الطلبات' }, orderId: { en: 'Order ID', ar: 'رقم الطلب' }, customer: { en: 'Customer', ar: 'العميل' }, sector: { en: 'Sector', ar: 'القطاع' }, status: { en: 'Status', ar: 'الحالة' }, created: { en: 'Created', ar: 'تاريخ الإنشاء' }, actions: { en: 'Actions', ar: 'إجراءات' }, viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' }, noOrders: { en: 'No orders found.', ar: 'لا توجد طلبات.' } };

    const statusMap = {
        'new': { en: 'Order Received', ar: 'تم استلام الطلب' },
        'order received': { en: 'Order Received', ar: 'تم استلام الطلب' },
        'contacting': { en: 'Contacting', ar: 'جاري التواصل' },
        'quotation sent': { en: 'Quotation Sent', ar: 'تم إرسال عرض السعر' },
        'sample production': { en: 'Sample Production', ar: 'تنفيذ العينة' },
        'manufacturing': { en: 'Manufacturing', ar: 'مرحلة التصنيع' },
        'delivered': { en: 'Delivered', ar: 'تم التوصيل' },
        'cancelled': { en: 'Cancelled', ar: 'ملغي' },
        'processing': { en: 'Processing', ar: 'قيد المعالجة' },
        'in production': { en: 'In Production', ar: 'قيد الإنتاج' },
        'ready for delivery': { en: 'Ready for Delivery', ar: 'جاهز للتسليم' }
    };

    const sectorMap = {
        'students': { ar: 'أفراد (طالب/ولي أمر)', en: 'Individuals (Student/Parent)' },
        'schools': { ar: 'مدارس', en: 'Schools' },
        'school': { ar: 'مدارس', en: 'Schools' },
        'factories': { ar: 'مصانع', en: 'Factories' },
        'corporate': { ar: 'الشركات والمكاتب', en: 'Corporate' },
        'medical': { ar: 'القطاع الطبي', en: 'Medical' },
        'hospitality': { ar: 'المطاعم والكافيهات', en: 'Hospitality' },
        'transportation': { ar: 'النقل والطيران', en: 'Transportation' },
        'domestic': { ar: 'العمالة المنزلية', en: 'Domestic' }
    };

    const statusColors = { 'Order Received': 'bg-yellow-100 text-yellow-800', pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', in_production: 'bg-purple-100 text-purple-800', ready_for_delivery: 'bg-green-100 text-green-800', delivered: 'bg-gray-100 text-gray-800', cancelled: 'bg-red-100 text-red-800', 'Contacting': 'bg-blue-100 text-blue-800', 'Quotation Sent': 'bg-indigo-100 text-indigo-800', 'Sample Production': 'bg-purple-100 text-purple-800', 'Manufacturing': 'bg-orange-100 text-orange-800', 'Delivered': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800' };

    return (
        <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <nav className="bg-white shadow-sm"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between h-16"><div className="flex items-center"><div className="flex-shrink-0 flex items-center"><div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xl">Y</span></div><span className="ltr:ml-2 rtl:mr-2 text-xl font-bold text-gray-900">Yarn Uniforms</span></div></div><div className="flex items-center space-x-4 rtl:space-x-reverse"><button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Home</button><button onClick={() => router.push('/admin/login')} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">{t(translations.logout)}</button></div></div></div></nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0 mb-8"><h1 className="text-3xl font-bold text-gray-900">{t(translations.dashboard)}</h1><p className="mt-1 text-sm text-gray-600">{t(translations.manageOrders)}</p></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatsCard title={t(translations.totalOrders)} value={stats.total} icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} color="bg-blue-500" />
                    <StatsCard title={t(translations.pending)} value={stats.pending} icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-yellow-500" />
                    <StatsCard title={t(translations.inProduction)} value={stats.in_production} icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="bg-purple-500" />
                    <StatsCard title={t(translations.delivered)} value={stats.delivered} icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="bg-green-500" />
                </div>

                {/* Orders Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200"><h3 className="text-lg leading-6 font-medium text-gray-900">{t(translations.recentOrders)}</h3></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">{t(translations.orderId)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">{t(translations.customer)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">{t(translations.sector)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">{t(translations.status)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">{t(translations.created)}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-left">{t(translations.actions)}</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">{t(translations.noOrders)}</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-primary-600 hover:text-primary-900">{order.orderId || 'N/A'}</span>
                                                    <button
                                                        onClick={(e) => copyToClipboard(order.orderId, e)}
                                                        className="text-gray-400 hover:text-primary-600 transition-colors p-1 ltr:ml-2 rtl:mr-2"
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
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer?.schoolName || order.customer?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {language === 'ar'
                                                    ? (order.sectorAr || sectorMap[order.sector?.toLowerCase()]?.ar || order.sector || 'N/A')
                                                    : (sectorMap[order.sector?.toLowerCase()]?.en || order.sector || 'N/A')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>{statusMap[order.status?.toLowerCase()]?.[language] || order.status || 'N/A'}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : 'N/A')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium ltr:text-right rtl:text-left"><button onClick={(e) => { e.stopPropagation(); console.log('Order Details:', order); setSelectedOrder(order); setIsModalOpen(true); }} className="text-primary-600 hover:text-primary-900 transition-colors font-semibold">{t(translations.viewDetails)}</button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <OrderDetailsDrawer
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
            />
        </div>
    );
}

function StatsCard({ title, value, icon, color }) {
    return (<div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0"><div className={`rounded-md p-3 ${color}`}>{icon}</div></div><div className="ltr:ml-5 rtl:mr-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">{title}</dt><dd><div className="text-lg font-medium text-gray-900">{value}</div></dd></dl></div></div></div></div>);
}
