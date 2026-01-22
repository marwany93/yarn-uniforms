'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const translations = {
        home: { en: 'Home', ar: 'الرئيسية' },
        schools: { en: 'Schools', ar: 'المدارس' },
        factories: { en: 'Factories', ar: 'المصانع' },
        companies: { en: 'Companies', ar: 'الشركات' },
        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
        trackOrder: { en: 'Track Order', ar: 'تتبع الطلب' },
        admin: { en: 'Admin', ar: 'الإدارة' }
    };

    const navigation = [
        { name: t(translations.schools), href: '/order/schools', sector: 'schools' },
        { name: t(translations.factories), href: '/order/factories', sector: 'factories' },
        { name: t(translations.companies), href: '/order/companies', sector: 'companies' },
        { name: t(translations.hospitals), href: '/order/hospitals', sector: 'hospitals' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Y</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Yarn Uniforms
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-6 rtl:space-x-reverse">
                        <Link
                            href="/"
                            className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                        >
                            {t(translations.home)}
                        </Link>

                        {navigation.map((item) => (
                            <Link
                                key={item.sector}
                                href={item.href}
                                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <Link
                            href="/track"
                            className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                        >
                            {t(translations.trackOrder)}
                        </Link>

                        <Link
                            href="/admin"
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-sm"
                        >
                            {t(translations.admin)}
                        </Link>

                        {/* Language Switcher */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border-l border-gray-300 pl-6 rtl:border-r rtl:pr-6 rtl:pl-0 rtl:border-l-0">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${language === 'en'
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('ar')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${language === 'ar'
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                عربي
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse lg:hidden">
                        {/* Mobile Language Switcher */}
                        <button
                            onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            {language === 'en' ? 'عربي' : 'EN'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.home)}
                            </Link>

                            {navigation.map((item) => (
                                <Link
                                    key={item.sector}
                                    href={item.href}
                                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <Link
                                href="/track"
                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.trackOrder)}
                            </Link>

                            <Link
                                href="/admin"
                                className="block px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100 text-sm"
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
