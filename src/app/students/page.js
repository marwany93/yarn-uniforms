'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import CartSummary from '@/components/wizard/CartSummary';
import { Search, ArrowRight, ArrowLeft, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';

export default function StudentPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { verifyStudent } = useStudent();

    // --- Step A: School Selection ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null); // { id, nameEn, nameAr, logo }
    const dropdownRef = useRef(null);

    // --- Step B: ID Verification ---
    const [nationalId, setNationalId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    // --- Data ---
    const [schoolsList, setSchoolsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Current step: 'school' | 'id'
    const [step, setStep] = useState('school');

    const normalizeArabic = (text) => {
        if (!text) return '';
        return text
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[\u064B-\u065F]/g, '')
            .replace(/ـ/g, '')
            .toLowerCase()
            .trim();
    };

    // Fetch Schools from Firebase
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'schools'));
                const schoolsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
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

    // Filter schools based on live data - Robust handling with Arabic Normalization
    const filteredSchools = schoolsList.filter(school => {
        const query = normalizeArabic(searchQuery);
        if (!query) return true;
        const arName = normalizeArabic(school.nameAr || school.name?.ar || '');
        const enName = normalizeArabic(school.nameEn || school.name?.en || '');
        return arName.includes(query) || enName.includes(query);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Step A: school selected → move to Step B
    const handleSchoolSelect = (school) => {
        setSelectedSchool({
            id: school.id,
            nameEn: school.nameEn || school.name?.en || '',
            nameAr: school.nameAr || school.name?.ar || '',
            logo: school.logo || null,
        });
        setSearchQuery('');
        setIsDropdownOpen(false);
        setNationalId('');
        setVerifyError('');
        setStep('id');
    };

    // Reset to Step A
    const handleChangeSchool = () => {
        setSelectedSchool(null);
        setStep('school');
        setNationalId('');
        setVerifyError('');
    };

    // Step B: verify National ID
    const handleVerifyId = async (e) => {
        e.preventDefault();
        const trimmedId = nationalId.trim();
        if (!trimmedId || !selectedSchool) return;

        setIsVerifying(true);
        setVerifyError('');

        try {
            const studentsRef = collection(db, 'students');
            const q = query(
                studentsRef,
                where('nationalId', '==', trimmedId),
                where('schoolId', '==', selectedSchool.id),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const studentData = snapshot.docs[0].data();
                // Store verified student in context + sessionStorage
                verifyStudent({
                    name: studentData.name || '',
                    nationalId: trimmedId,
                    schoolId: selectedSchool.id,
                    schoolName: selectedSchool.nameEn,
                    schoolNameAr: selectedSchool.nameAr,
                });
                router.push(`/students/${selectedSchool.id}`);
            } else {
                setVerifyError(
                    language === 'ar'
                        ? 'لم يتم العثور على هذا الرقم لهذه المدرسة. يرجى التواصل مع إدارة المدرسة.'
                        : 'ID not found for this school. Please contact your school administration.'
                );
            }
        } catch (err) {
            console.error('Error verifying student:', err);
            setVerifyError(
                language === 'ar'
                    ? 'حدث خطأ أثناء التحقق. حاول مرة أخرى.'
                    : 'An error occurred during verification. Please try again.'
            );
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[380px] md:h-[420px] w-full flex flex-col items-center justify-center">
                <div className="absolute inset-0 overflow-hidden z-0">
                    <Image
                        src="/images/student-hero.png"
                        alt={language === 'ar' ? 'البوابة المدرسية' : 'School Portal'}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/40" />
                </div>

                <div className="relative z-50 w-full px-4 text-center">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {/* Step 1 bubble */}
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${step === 'school' ? 'bg-white text-gray-900' : 'bg-white/20 text-white'}`}>
                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">1</span>
                            {language === 'ar' ? 'اختر المدرسة' : 'Select School'}
                        </div>
                        <div className="w-6 h-px bg-white/40" />
                        {/* Step 2 bubble */}
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${step === 'id' ? 'bg-white text-gray-900' : 'bg-white/20 text-white'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'id' ? 'bg-primary text-white' : 'bg-white/30 text-white'}`}>2</span>
                            {language === 'ar' ? 'تحقق من الهوية' : 'Verify ID'}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 transition-all duration-300">
                        {step === 'school'
                            ? (language === 'ar' ? 'اختر مدرستك' : 'Find Your School')
                            : (language === 'ar' ? 'أدخل رقم هويتك' : 'Enter Your ID Number')}
                    </h1>
                    <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                        {step === 'school'
                            ? (language === 'ar' ? 'ابحث عن مدرستك للمتابعة' : 'Search for your school to continue')
                            : (language === 'ar' ? 'أدخل رقم الهوية الوطنية / الإقامة للتحقق' : 'Enter your National ID / Residency Number to verify access')}
                    </p>

                    {/* ═══ STEP A: School Search ═══ */}
                    {step === 'school' && (
                        <div className="w-full max-w-xl relative mx-auto" ref={dropdownRef}>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder={language === 'ar' ? 'اكتب اسم المدرسة هنا...' : 'Type school name here...'}
                                    className="w-full px-6 py-4 md:py-5 pr-14 text-lg md:text-xl rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-primary/30 outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                                    autoComplete="off"
                                />
                                {isLoading ? (
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-5' : 'right-5'} text-primary`}>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-6' : 'right-6'} text-gray-400`}>
                                        <Search className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                )}
                            </div>

                            {/* Dropdown */}
                            {isDropdownOpen && searchQuery.length > 0 && (
                                <div className="absolute left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[55vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                    {filteredSchools.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {filteredSchools.map((school) => (
                                                <li key={school.id}>
                                                    <button
                                                        onClick={() => handleSchoolSelect(school)}
                                                        className="w-full px-4 py-3 hover:bg-primary/5 transition-colors flex items-center gap-4 text-left rtl:text-right group"
                                                    >
                                                        <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                                            {school.logo ? (
                                                                <div className="relative w-full h-full p-1.5">
                                                                    <Image src={school.logo} alt="" fill className="object-contain" />
                                                                </div>
                                                            ) : (
                                                                <span className="text-xl text-gray-400">🏫</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="font-bold text-gray-900 block text-base truncate group-hover:text-primary transition-colors">
                                                                {language === 'ar'
                                                                    ? (school.nameAr || school.name?.ar || 'بدون اسم')
                                                                    : (school.nameEn || school.name?.en || 'Unnamed School')}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-0.5">
                                                                {language === 'ar' ? 'انتقل لمتجر المدرسة' : 'Go to school store'}
                                                            </span>
                                                        </div>
                                                        <div className="shrink-0 text-gray-400 rtl:rotate-180 group-hover:text-primary transition-colors">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-6 py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                            <span className="text-3xl">🔍</span>
                                            <span>{language === 'ar' ? 'لا توجد مدرسة بهذا الاسم' : 'No school found'}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ STEP B: National ID Verification ═══ */}
                    {step === 'id' && selectedSchool && (
                        <div className="w-full max-w-md mx-auto">
                            {/* Selected School Pill */}
                            <div className="flex items-center justify-center gap-3 mb-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 max-w-xs mx-auto">
                                {selectedSchool.logo && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white shrink-0 relative">
                                        <Image src={selectedSchool.logo} alt="" fill className="object-contain p-0.5" />
                                    </div>
                                )}
                                <span className="text-white font-semibold text-sm truncate">
                                    {language === 'ar' ? selectedSchool.nameAr : selectedSchool.nameEn}
                                </span>
                                <button
                                    onClick={handleChangeSchool}
                                    className="shrink-0 text-white/60 hover:text-white transition-colors ml-1"
                                    title={language === 'ar' ? 'تغيير المدرسة' : 'Change school'}
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ID Input Form */}
                            <form onSubmit={handleVerifyId} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={nationalId}
                                        onChange={(e) => { setNationalId(e.target.value); setVerifyError(''); }}
                                        placeholder={language === 'ar' ? 'رقم الهوية الوطنية / الإقامة' : 'National ID / Residency Number'}
                                        className="w-full px-6 py-4 rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-primary/30 outline-none text-lg text-gray-800 placeholder:text-gray-400"
                                        dir="ltr"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        required
                                    />
                                </div>

                                {/* Error Message */}
                                {verifyError && (
                                    <div className="bg-red-500/90 backdrop-blur-sm text-white text-sm font-medium px-4 py-3 rounded-xl text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                        {verifyError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isVerifying || !nationalId.trim()}
                                    className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" />{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</>
                                    ) : (
                                        <><ShieldCheck className="w-5 h-5" />{language === 'ar' ? 'تحقق والدخول للمتجر' : 'Verify & Enter Store'}</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleChangeSchool}
                                    className="w-full py-3 text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                >
                                    {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                    {language === 'ar' ? 'تغيير المدرسة' : 'Change school'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content (Step A fallback info) */}
            {step === 'school' && (
                <div className="max-w-[1400px] mx-auto px-4 mt-8 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100 min-h-[280px] flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    {language === 'ar' ? 'متجر حصري للطلاب المسجلين' : 'Exclusive Store for Enrolled Students'}
                                </h2>
                                <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                                    {language === 'ar'
                                        ? 'هذه البوابة متاحة فقط للطلاب المسجلين في المدارس المتعاقدة. ابحث عن مدرستك للمتابعة.'
                                        : 'This portal is exclusively for enrolled students of partner schools. Search for your school to continue.'}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="hidden lg:block w-96 shrink-0">
                            <div className="sticky top-24 space-y-6">
                                <CartSummary />
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
            )}
        </div>
    );
}
