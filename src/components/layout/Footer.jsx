'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
    const { t } = useLanguage();

    const translations = {
        companyName: { en: 'Yarn Uniforms', ar: 'يارن للزي الموحد' },
        tagline: {
            en: 'Your trusted partner for quality uniforms across all sectors',
            ar: 'شريكك الموثوق للأزياء الموحدة عالية الجودة في جميع القطاعات'
        },
        quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
        sectors: { en: 'Sectors', ar: 'القطاعات' },
        support: { en: 'Support', ar: 'الدعم' },
        home: { en: 'Home', ar: 'الرئيسية' },
        schools: { en: 'Schools', ar: 'المدارس' },
        factories: { en: 'Factories', ar: 'المصانع' },
        companies: { en: 'Companies', ar: 'الشركات' },
        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
        trackOrder: { en: 'Track Order', ar: 'تتبع الطلب' },
        contactUs: { en: 'Contact Us', ar: 'اتصل بنا' },
        faq: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
        privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
        terms: { en: 'Terms of Service', ar: 'شروط الخدمة' },
        copyright: {
            en: '© 2026 Yarn Uniforms. All rights reserved.',
            ar: '© ٢٠٢٦ يارن للزي الموحد. جميع الحقوق محفوظة.'
        },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        phone: { en: 'Phone', ar: 'الهاتف' }
    };

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Y</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                {t(translations.companyName)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            {t(translations.tagline)}
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@yarnuniforms.com.sa</span>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span dir="ltr">+966 50 000 0000</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {t(translations.quickLinks)}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-primary-400 transition-colors">
                                    {t(translations.home)}
                                </Link>
                            </li>
                            <li>
                                <Link href="/track" className="hover:text-primary-400 transition-colors">
                                    {t(translations.trackOrder)}
                                </Link>
                            </li>
                            <li>
                                <Link href="#contact" className="hover:text-primary-400 transition-colors">
                                    {t(translations.contactUs)}
                                </Link>
                            </li>
                            <li>
                                <Link href="#faq" className="hover:text-primary-400 transition-colors">
                                    {t(translations.faq)}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Sectors */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {t(translations.sectors)}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/order/schools" className="hover:text-primary-400 transition-colors">
                                    {t(translations.schools)}
                                </Link>
                            </li>
                            <li>
                                <Link href="/order/factories" className="hover:text-primary-400 transition-colors">
                                    {t(translations.factories)}
                                </Link>
                            </li>
                            <li>
                                <Link href="/order/companies" className="hover:text-primary-400 transition-colors">
                                    {t(translations.companies)}
                                </Link>
                            </li>
                            <li>
                                <Link href="/order/hospitals" className="hover:text-primary-400 transition-colors">
                                    {t(translations.hospitals)}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {t(translations.support)}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#privacy" className="hover:text-primary-400 transition-colors">
                                    {t(translations.privacy)}
                                </Link>
                            </li>
                            <li>
                                <Link href="#terms" className="hover:text-primary-400 transition-colors">
                                    {t(translations.terms)}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <p className="text-center text-sm text-gray-400">
                        {t(translations.copyright)}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
