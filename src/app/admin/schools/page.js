'use client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

import SchoolFormModal from '@/components/admin/SchoolFormModal';
import { deleteDoc, doc } from 'firebase/firestore';

export default function AdminSchools() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);

    // Authentication Check
    useEffect(() => {
        if (!loading && !user) router.push('/admin/login');
    }, [user, loading, router]);

    // Fetch Schools
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'schools'), orderBy('name.en', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const schoolsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSchools(schoolsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching schools:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleEdit = (school) => {
        setSelectedSchool(school);
        setIsModalOpen(true);
    };

    const handleDelete = async (schoolId) => {
        if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'schools', schoolId));
            } catch (error) {
                console.error("Error deleting school:", error);
                alert("Failed to delete school.");
            }
        }
    };

    const handleAdd = () => {
        setSelectedSchool(null);
        setIsModalOpen(true);
    };

    if (loading || (!user && isLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const filteredSchools = schools.filter(school => {
        const search = searchTerm.toLowerCase();
        return (
            (school.name?.en?.toLowerCase() || '').includes(search) ||
            (school.name?.ar?.toLowerCase() || '').includes(search)
        );
    });

    const translations = {
        title: { en: 'Schools Management', ar: 'إدارة المدارس' },
        subtitle: { en: 'Manage school storefronts, products and details', ar: 'إدارة متاجر المدارس والمنتجات والتفاصيل' },
        back: { en: 'Back to Dashboard', ar: 'العودة للوحة الرئيسة' },
        add: { en: 'Add New School', ar: 'إضافة مدرسة جديدة' },
        search: { en: 'Search schools...', ar: 'بحث عن مدرسة...' },
        logo: { en: 'Logo', ar: 'الشعار' },
        name: { en: 'School Name', ar: 'اسم المدرسة' },
        products: { en: 'Products', ar: 'المنتجات' },
        actions: { en: 'Actions', ar: 'إجراءات' },
        noSchools: { en: 'No schools found.', ar: 'لا توجد مدارس.' },
        students: { en: 'Students', ar: 'الطلاب' },
        edit: { en: 'Edit', ar: 'تعديل' },
        delete: { en: 'Delete', ar: 'حذف' }
    };

    return (
        <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Navbar (Reused structure) */}
            <nav className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/admin')}>
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">Y</span>
                                </div>
                                <span className="ltr:ml-2 rtl:mr-2 text-xl font-bold text-gray-900">Yarn Admin</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <button onClick={() => router.push('/admin/schools')} className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md text-sm font-medium">
                                {language === 'ar' ? 'المدارس' : 'Schools'}
                            </button>
                            <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                {t(translations.back)}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="px-4 sm:px-0 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t(translations.title)}</h1>
                        <p className="mt-1 text-sm text-gray-600">{t(translations.subtitle)}</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t(translations.add)}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 sm:px-0 mb-6">
                    <div className="relative rounded-md shadow-sm max-w-md">
                        <div className="absolute inset-y-0 left-0 padding-l-3 flex items-center pointer-events-none pl-3 rtl:pr-3 rtl:pl-0">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 rtl:pl-3 rtl:pr-10 sm:text-sm border-gray-300 rounded-md py-2"
                            placeholder={t(translations.search)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Schools Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t(translations.logo)}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t(translations.name)}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t(translations.products)}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t(translations.actions)}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchools.length > 0 ? (
                                    filteredSchools.map((school) => (
                                        <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="relative h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                                                    {school.logo ? (
                                                        <Image
                                                            src={school.logo}
                                                            alt={school.name?.en || 'School'}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {language === 'ar' ? school.name?.ar : school.name?.en}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {language === 'ar' ? school.name?.en : school.name?.ar}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {school.assignedProducts?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(school)}
                                                    className="text-primary-600 hover:text-primary-900 mx-2 transition-colors"
                                                >
                                                    {t(translations.edit)}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(school.id)}
                                                    className="text-red-600 hover:text-red-900 mx-2 transition-colors"
                                                >
                                                    {t(translations.delete)}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            {t(translations.noSchools)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <SchoolFormModal
                school={selectedSchool}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
