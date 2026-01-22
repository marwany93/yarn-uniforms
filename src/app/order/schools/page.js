'use client';

import { useLanguage } from '@/hooks/useLanguage';
import questionsConfig from '@/config/questionsConfig';
import DynamicForm from '@/components/forms/DynamicForm';
import Link from 'next/link';

export default function SchoolsOrderPage() {
    const { t } = useLanguage();

    const translations = {
        title: { en: 'School Uniforms Order', ar: 'طلب أزياء المدارس' },
        subtitle: {
            en: 'Fill out the form below to request a quote for school uniforms',
            ar: 'املأ النموذج أدناه لطلب عرض أسعار لأزياء المدارس'
        },
        backToHome: { en: '← Back to Home', ar: '→ العودة للرئيسية' },
        needHelp: { en: 'Need Help?', ar: 'تحتاج مساعدة؟' },
        contactUs: {
            en: 'Contact us if you have any questions',
            ar: 'اتصل بنا إذا كان لديك أي أسئلة'
        },
        phone: { en: 'Phone', ar: 'الهاتف' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
            <div className="container-custom">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t(translations.backToHome)}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                                    <div className="text-5xl">🎓</div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            {t(translations.title)}
                                        </h1>
                                        <p className="text-gray-600 mt-1">
                                            {t(translations.subtitle)}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                            </div>

                            {/* Dynamic Form */}
                            <DynamicForm
                                questions={questionsConfig.schools}
                                sector="schools"
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {t(translations.needHelp)}
                            </h2>
                            <p className="text-gray-600 text-sm mb-6">
                                {t(translations.contactUs)}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {t(translations.phone)}
                                        </p>
                                        <p className="text-sm text-gray-600" dir="ltr">
                                            +966 50 000 0000
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {t(translations.email)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            info@yarnuniforms.com.sa
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    {t({ en: 'What happens next?', ar: 'ماذا يحدث بعد ذلك؟' })}
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                                        <span className="text-primary-500 mt-0.5">✓</span>
                                        <span>{t({ en: 'Receive your order ID', ar: 'استلم رقم طلبك' })}</span>
                                    </li>
                                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                                        <span className="text-primary-500 mt-0.5">✓</span>
                                        <span>{t({ en: 'We review your request', ar: 'نراجع طلبك' })}</span>
                                    </li>
                                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                                        <span className="text-primary-500 mt-0.5">✓</span>
                                        <span>{t({ en: 'Get a custom quote', ar: 'احصل على عرض سعر مخصص' })}</span>
                                    </li>
                                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                                        <span className="text-primary-500 mt-0.5">✓</span>
                                        <span>{t({ en: 'Track your order status', ar: 'تتبع حالة طلبك' })}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
