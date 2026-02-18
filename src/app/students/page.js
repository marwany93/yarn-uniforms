'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Removed static schools import
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CartSummary from '@/components/wizard/CartSummary';
import { Search, MapPin } from 'lucide-react';

export default function StudentPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // New State for Firestore Data
    const [schoolsList, setSchoolsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Schools from Firebase
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'schools'));
                const schoolsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by name (optional) - Robust handling
                schoolsData.sort((a, b) => {
                    const nameA = a.nameEn || a.name?.en || '';
                    const nameB = b.nameEn || b.name?.en || '';
                    return nameA.localeCompare(nameB);
                });
                setSchoolsList(schoolsData);
            } catch (error) {
                console.error("Error fetching schools:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchools();
    }, []);

    // Filter schools based on live data - Robust handling
    const filteredSchools = schoolsList.filter(school => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        // Safely extract names handling both flat and nested structures
        const arName = school.nameAr || school.name?.ar || '';
        const enName = school.nameEn || school.name?.en || '';

        return arName.toLowerCase().includes(query) || enName.toLowerCase().includes(query);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSchoolSelect = (schoolId) => {
        router.push(`/students/${schoolId}`);
        setIsDropdownOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[350px] md:h-[400px] w-full flex flex-col items-center justify-center">

                {/* Background Image Container (Clipped) */}
                <div className="absolute inset-0 overflow-hidden z-0">
                    <Image
                        src="/images/student-hero.png"
                        alt={language === 'ar' ? 'البوابة المدرسية' : 'School Portal'}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Content Container (Visible Overflow) */}
                <div className="relative z-50 w-full px-4 text-center mt-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
                        {language === 'ar' ? 'اختر مدرستك' : 'Find Your School'}
                    </h1>

                    {/* Search Component (Hero Replacement) */}
                    <div className="w-full max-w-xl relative mx-auto" ref={dropdownRef}>
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder={language === 'ar' ? 'اكتب اسم المدرسة هنا...' : 'Type school name here...'}
                                className="w-full px-6 py-4 md:py-5 pr-12 md:pr-14 text-lg md:text-xl rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-primary/30 outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                            />

                            {/* Loading Indicator inside Input */}
                            {isLoading && (
                                <div className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-14' : 'right-14'}`}>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                </div>
                            )}

                            <div className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-6' : 'right-6'} text-gray-400`}>
                                <Search className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && searchQuery.length > 0 && (
                            <div className="absolute left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[60vh] overflow-y-auto animate-fade-in-up" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {isLoading ? (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading schools...'}</span>
                                    </div>
                                ) : filteredSchools.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {filteredSchools.map((school) => (
                                            <li key={school.id}>
                                                <button
                                                    onClick={() => handleSchoolSelect(school.id)}
                                                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left rtl:text-right group"
                                                >
                                                    {/* Logo/Avatar Container */}
                                                    <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-2xl overflow-hidden border border-gray-200">
                                                        {school.logo ? (
                                                            <div className="relative w-full h-full p-2">
                                                                <Image
                                                                    src={school.logo}
                                                                    alt={(language === 'ar'
                                                                        ? (school.nameAr || school.name?.ar)
                                                                        : (school.nameEn || school.name?.en)) || 'School Logo'}
                                                                    fill
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-xl text-gray-400">🏫</span>
                                                        )}
                                                    </div>

                                                    {/* Text Container */}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="font-bold text-gray-900 block text-base md:text-lg truncate group-hover:text-primary transition-colors">
                                                            {language === 'ar'
                                                                ? (school.nameAr || school.name?.ar || 'بدون اسم')
                                                                : (school.nameEn || school.name?.en || 'Unnamed School')}
                                                        </span>

                                                        <span className="text-xs md:text-sm text-gray-500 truncate mt-0.5">
                                                            {language === 'ar' ? 'انتقل لمتجر المدرسة' : 'Go to school store'}
                                                        </span>
                                                    </div>

                                                    {/* Arrow Icon */}
                                                    <div className="shrink-0 text-gray-400 rtl:rotate-180 group-hover:text-primary transition-colors">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-6 py-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                                        <span className="text-3xl">🔍</span>
                                        <span>{language === 'ar' ? 'لا توجد مدرسة بهذا الاسم' : 'No school found'}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 mt-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Directory Info / fallback content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100 min-h-[300px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {language === 'ar' ? 'ابحث عن مدرستك في الأعلى' : 'Search for your school above'}
                            </h2>
                            <p className="text-gray-500 max-w-md">
                                {language === 'ar'
                                    ? 'ابدأ بكتابة اسم مدرستك في مربع البحث للوصول السريع إلى المنتجات المعتمدة.'
                                    : 'Start typing your school name in the search box for quick access to approved products.'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar (Cart Summary) - Visible on Desktop */}
                    <div className="hidden lg:block w-96 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <CartSummary />

                            {/* Trust Badges */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-2xl">🚚</span>
                                        <div>
                                            <span className="font-bold block text-gray-900">{language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
                                            {language === 'ar' ? 'توصيل لباب المنزل' : 'Direct to your doorstep'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-2xl">✨</span>
                                        <div>
                                            <span className="font-bold block text-gray-900">{language === 'ar' ? 'جودة مضمونة' : 'Premium Quality'}</span>
                                            {language === 'ar' ? 'خامات عالية الجودة' : 'High quality materials'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
