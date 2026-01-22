'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
    const { t } = useLanguage();

    const translations = {
        // Company
        company: { en: 'Company', ar: 'الشركة' },
        about: { en: 'About Us', ar: 'من نحن' },
        contact: { en: 'Contact', ar: 'اتصل بنا' },

        // Quick Links
        quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
        schools: { en: 'Schools', ar: 'المدارس' },
        factories: { en: 'Factories', ar: 'المصانع' },
        companies: { en: 'Companies', ar: 'الشركات' },
        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
        trackOrder: { en: 'Track Order', ar: 'تتبع الطلب' },

        // Contact
        contactInfo: { en: 'Contact', ar: 'اتصل بنا' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        phone: { en: 'Phone', ar: 'الهاتف' },

        // Legal
        allRightsReserved: { en: '© 2026 Yarn Uniforms. All rights reserved.', ar: '© 2026 يارن للزي الموحد. جميع الحقوق محفوظة.' },
        privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
        terms: { en: 'Terms of Service', ar: 'شروط الخدمة' },
    };

    const quickLinks = [
        { name: t(translations.schools), href: '/order/schools' },
        { name: t(translations.factories), href: '/order/factories' },
        { name: t(translations.companies), href: '/order/companies' },
        { name: t(translations.hospitals), href: '/order/hospitals' },
        { name: t(translations.trackOrder), href: '/track' },
    ];

    return (
        <footer className="relative bg-primary text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <Image
                    src="/assets/pattern-symbol-repeat.png"
                    alt=""
                    fill
                    className="object-cover"
                />
            </div>

            <div className="relative z-10 container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/assets/logo-white-bilingual.png"
                                alt="Yarn Uniforms Logo"
                                width={160}
                                height={60}
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-white/80 mb-4 max-w-md">
                            Professional uniform solutions for schools, factories, companies, and hospitals across Saudi Arabia.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-display font-bold mb-4">{t(translations.quickLinks)}</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/80 hover:text-secondary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-display font-bold mb-4">{t(translations.contactInfo)}</h3>
                        <ul className="space-y-3 text-white/80">
                            <li className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:info@yarnuniforms.com.sa" className="hover:text-secondary transition-colors">
                                    info@yarnuniforms.com.sa
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+966123456789" className="hover:text-secondary transition-colors" dir="ltr">
                                    +966 12 345 6789
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
                        <p>{t(translations.allRightsReserved)}</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-secondary transition-colors">
                                {t(translations.privacy)}
                            </Link>
                            <Link href="/terms" className="hover:text-secondary transition-colors">
                                {t(translations.terms)}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
