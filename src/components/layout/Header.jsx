'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { getCartItemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const translations = {
        home: { en: 'Home', ar: 'الرئيسية' },
        sectors: { en: 'Sectors', ar: 'القطاعات' },
        trackOrder: { en: 'Track Order', ar: 'تتبع طلبك' },
        contactUs: { en: 'Contact Us', ar: 'اتصل بنا' },
        educational: { en: 'Educational', ar: 'القطاع التعليمي' },
        medical: { en: 'Medical', ar: 'القطاع الطبي' },
        corporate: { en: 'Industrial & Corporate', ar: 'القطاع الصناعي والشركات' },
        hospitality: { en: 'Restaurants & Cafes', ar: 'قطاع المطاعم والمقاهي' },
        transport: { en: 'Transport & Aviation', ar: 'قطاع النقل والطيران' },
        domestic: { en: 'Domestic Workers', ar: 'قطاع العمالة المنزلية' },
        admin: { en: 'Admin', ar: 'الإدارة' }
    };

    const sectorLinks = [
        { name: t(translations.educational), href: '/sectors/schools', sector: 'schools' },
        { name: t(translations.medical), href: '/sectors/medical', sector: 'medical' },
        { name: t(translations.corporate), href: '/sectors/corporate', sector: 'corporate' },
        { name: t(translations.hospitality), href: '/sectors/hospitality', sector: 'hospitality' },
        { name: t(translations.transport), href: '/sectors/transportation', sector: 'transportation' },
        { name: t(translations.domestic), href: '/sectors/domestic', sector: 'domestic' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Announcement Bar - Removed */}

            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    {/* SECTION 1: Logo + Nav Links */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/assets/logo-navy-bilingual.png"
                                alt="Yarn Uniforms"
                                width={400}
                                height={140}
                                className="w-[110px] md:w-[150px] h-auto object-contain flex-shrink-0"
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex lg:items-center lg:space-x-8 rtl:space-x-reverse">
                            {/* Home */}
                            <Link
                                href="/"
                                className="text-[#192E4F] font-bold hover:text-[#e5d7ca] transition-colors duration-200"
                            >
                                {t(translations.home)}
                            </Link>

                            {/* Sectors Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-[#192E4F] font-bold group-hover:text-[#e5d7ca] transition-colors duration-200 focus:outline-none">
                                    <span>{t(translations.sectors)}</span>
                                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute top-full ltr:left-0 rtl:right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white shadow-xl rounded-xl border border-gray-100 min-w-[260px] overflow-hidden py-1">
                                        {sectorLinks.map((item) => (
                                            <Link
                                                key={item.sector}
                                                href={item.href}
                                                className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#192E4F]/5 hover:text-[#192E4F] transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Track Order */}
                            <Link
                                href="/track-order"
                                className="text-[#192E4F] font-bold hover:text-[#e5d7ca] transition-colors duration-200"
                            >
                                {t(translations.trackOrder)}
                            </Link>

                            {/* Contact Us */}
                            <Link
                                href="/contact"
                                className="text-[#192E4F] font-bold hover:text-[#e5d7ca] transition-colors duration-200"
                            >
                                {t(translations.contactUs)}
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 2: Utilities (Cart, Lang, Mobile Btn) */}
                    <div className="flex items-center gap-4">
                        {/* Shopping Cart Icon (Visible on all screens) */}
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

                        {/* Desktop Language Switcher */}
                        <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 pl-4 ml-4 rtl:border-r rtl:pr-4 rtl:pl-0 rtl:ml-0 rtl:mr-4 rtl:border-l-0">
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

                        {/* Mobile Language Switcher */}
                        <button
                            onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                            className="lg:hidden px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-[#192E4F] hover:bg-gray-200 transition-colors"
                        >
                            {language === 'en' ? 'عربي' : 'EN'}
                        </button>

                        {/* Mobile menu button */}
                        <div className="lg:hidden flex items-center">
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

                            {/* Sectors Section */}
                            <div className="pt-2 pb-1">
                                <span className="block px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {t(translations.sectors)}
                                </span>
                                <div className="space-y-1 ltr:pl-4 rtl:pr-4">
                                    {sectorLinks.map((item) => (
                                        <Link
                                            key={item.sector}
                                            href={item.href}
                                            className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50 text-sm"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/track-order"
                                className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.trackOrder)}
                            </Link>

                            <Link
                                href="/contact"
                                className="block px-3 py-2 rounded-md text-[#192E4F] font-medium hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t(translations.contactUs)}
                            </Link>




                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
