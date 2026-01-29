'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { getCartItemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const translations = {
        home: { en: 'Home', ar: 'الرئيسية' },
        schools: { en: 'Schools', ar: 'المدارس' },
        medicalSector: { en: 'Medical Sector', ar: 'القطاع الطبي' },
        corporateFactories: { en: 'Corporate & Factories', ar: 'الشركات والمصانع' },
        hotelsRestaurant: { en: 'Hotels & Restaurant', ar: 'الفنادق والمطاعم' },
        trackOrder: { en: 'Track Order', ar: 'تتبع الطلب' },
        admin: { en: 'Admin', ar: 'الإدارة' }
    };

    const navigation = [
        { name: t(translations.schools), href: '/sectors/schools', sector: 'schools' },
        { name: t(translations.medicalSector), href: '/sectors/medical', sector: 'medical' },
        { name: t(translations.corporateFactories), href: '/sectors/corporate', sector: 'corporate' },
        { name: t(translations.hotelsRestaurant), href: '/sectors/hospitality', sector: 'hospitality' },
        { name: t(translations.trackOrder), href: '/track-order', sector: 'track' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    {/* Logo - Larger Navy Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/assets/logo-navy-bilingual.png"
                                alt="Yarn Uniforms"
                                width={200}
                                height={70}
                                className="h-16 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-6 rtl:space-x-reverse">
                        <Link
                            href="/"
                            className="text-[#192E4F] font-medium hover:text-[#e5d7ca] transition-colors duration-200"
                        >
                            {t(translations.home)}
                        </Link>

                        {navigation.map((item) => (
                            <Link
                                key={item.sector}
                                href={item.href}
                                className="text-[#192E4F] font-medium hover:text-[#e5d7ca] transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <Link
                            href="/track"
                            className="text-[#192E4F] font-medium hover:text-[#e5d7ca] transition-colors duration-200"
                        >
                            {t(translations.trackOrder)}
                        </Link>

                        <Link
                            href="/admin"
                            className="text-gray-500 hover:text-[#192E4F] transition-colors duration-200 text-sm"
                        >
                            {t(translations.admin)}
                        </Link>

                        {/* Shopping Cart Icon */}
                        <Link
                            href="/cart"
                            className="relative p-2 text-[#192E4F] hover:text-[#e5d7ca] transition-colors duration-200"
                            aria-label="Shopping Cart"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {/* Badge */}
                            {getCartItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </Link>

                        {/* Language Switcher - White Background Theme */}
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-4 rtl:border-r rtl:pr-4 rtl:pl-0 rtl:ml-0 rtl:mr-4 rtl:border-l-0">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={language === 'en'
                                    ? 'px-3 py-1.5 rounded-md bg-[#192E4F] text-white font-bold shadow-sm transition-all'
                                    : 'px-3 py-1.5 rounded-md text-[#192E4F] hover:bg-gray-100 transition-all'}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('ar')}
                                className={language === 'ar'
                                    ? 'px-3 py-1.5 rounded-md bg-[#192E4F] text-white font-bold shadow-sm transition-all'
                                    : 'px-3 py-1.5 rounded-md text-[#192E4F] hover:bg-gray-100 transition-all'}
                            >
                                عربي
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse lg:hidden">
                        {/* Mobile Cart Icon */}
                        <Link
                            href="/cart"
                            className="relative p-2 text-[#192E4F] hover:text-[#e5d7ca] transition-colors duration-200"
                            aria-label="Shopping Cart"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {getCartItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Language Switcher */}
                        <button
                            onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-[#192E4F] hover:bg-gray-200 transition-colors"
                        >
                            {language === 'en' ? 'عربي' : 'EN'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-[#192E4F] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#192E4F]"
                        >
                            <span className="sr-only">Open menu</span>
                            {!mobileMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden pb-4 animate-fade-in">
                        <div className="space-y-1">
                            <Link
                                href="/"
                                className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.home)}
                            </Link>

                            {navigation.map((item) => (
                                <Link
                                    key={item.sector}
                                    href={item.href}
                                    className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <Link
                                href="/track"
                                className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.trackOrder)}
                            </Link>

                            <Link
                                href="/admin"
                                className="block px-3 py-2 rounded-md text-gray-500 hover:bg-gray-50 text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.admin)}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
