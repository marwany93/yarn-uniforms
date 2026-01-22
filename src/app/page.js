'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

export default function HomePage() {
    const { t } = useLanguage();
    const [trackingId, setTrackingId] = useState('');

    const translations = {
        heroTitle: {
            en: 'Professional Uniforms for Every Sector',
            ar: 'أزياء موحدة احترافية لكل القطاعات'
        },
        heroSubtitle: {
            en: 'Custom uniform solutions for schools, factories, companies, and hospitals',
            ar: 'حلول الزي الموحد المخصصة للمدارس والمصانع والشركات والمستشفيات'
        },
        orderNow: { en: 'Order Now', ar: 'اطلب الآن' },
        trackYourOrder: { en: 'Track Your Order', ar: 'تتبع طلبك' },

        // Sectors
        chooseSector: { en: 'Choose Your Sector', ar: 'اختر القطاع الخاص بك' },
        sectorSubtitle: {
            en: 'Select the sector that best matches your needs',
            ar: 'اختر القطاع الذي يناسب احتياجاتك'
        },

        schools: { en: 'Schools', ar: 'المدارس' },
        schoolsDesc: {
            en: 'Quality uniforms for students and educational institutions',
            ar: 'أزياء موحدة عالية الجودة للطلاب والمؤسسات التعليمية'
        },

        factories: { en: 'Factories', ar: 'المصانع' },
        factoriesDesc: {
            en: 'Durable workwear with safety features for industrial workers',
            ar: 'ملابس عمل متينة بمميزات سلامة لعمال المصانع'
        },

        companies: { en: 'Companies', ar: 'الشركات' },
        companiesDesc: {
            en: 'Professional corporate uniforms for all business sectors',
            ar: 'أزياء موحدة احترافية لجميع قطاعات الأعمال'
        },

        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
        hospitalsDesc: {
            en: 'Medical scrubs and healthcare uniforms for professionals',
            ar: 'الزي الطبي للمهنيين الصحيين'
        },

        // Tracking
        trackOrder: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        trackOrderDesc: {
            en: 'Enter your order ID to check the status',
            ar: 'أدخل رقم الطلب للتحقق من الحالة'
        },
        orderIdPlaceholder: { en: 'Enter Order ID', ar: 'أدخل رقم الطلب' },
        track: { en: 'Track', ar: 'تتبع' },

        // Features
        whyChooseUs: { en: 'Why Choose Yarn Uniforms?', ar: 'لماذا تختار يارن للزي الموحد؟' },
        qualityTitle: { en: 'Premium Quality', ar: 'جودة عالية' },
        qualityDesc: {
            en: 'High-quality fabrics and professional craftsmanship',
            ar: 'أقمشة عالية الجودة وحرفية احترافية'
        },
        customTitle: { en: 'Fully Customizable', ar: 'قابل للتخصيص بالكامل' },
        customDesc: {
            en: 'Tailor-made designs to match your brand identity',
            ar: 'تصاميم مخصصة لتتناسب مع هوية علامتك التجارية'
        },
        fastTitle: { en: 'Fast Delivery', ar: 'تسليم سريع' },
        fastDesc: {
            en: 'Timely production and delivery to meet your deadlines',
            ar: 'إنتاج وتسليم في الوقت المحدد'
        },
    };

    const sectors = [
        {
            id: 'schools',
            name: t(translations.schools),
            description: t(translations.schoolsDesc),
            icon: '🎓',
            color: 'from-blue-500 to-cyan-500',
            href: '/order/schools'
        },
        {
            id: 'factories',
            name: t(translations.factories),
            description: t(translations.factoriesDesc),
            icon: '🏭',
            color: 'from-orange-500 to-red-500',
            href: '/order/factories'
        },
        {
            id: 'companies',
            name: t(translations.companies),
            description: t(translations.companiesDesc),
            icon: '🏢',
            color: 'from-purple-500 to-pink-500',
            href: '/order/companies'
        },
        {
            id: 'hospitals',
            name: t(translations.hospitals),
            description: t(translations.hospitalsDesc),
            icon: '🏥',
            color: 'from-green-500 to-emerald-500',
            href: '/order/hospitals'
        }
    ];

    const features = [
        {
            title: t(translations.qualityTitle),
            description: t(translations.qualityDesc),
            icon: '✨'
        },
        {
            title: t(translations.customTitle),
            description: t(translations.customDesc),
            icon: '🎨'
        },
        {
            title: t(translations.fastTitle),
            description: t(translations.fastDesc),
            icon: '⚡'
        }
    ];

    const handleTrack = (e) => {
        e.preventDefault();
        if (trackingId.trim()) {
            window.location.href = `/track?id=${encodeURIComponent(trackingId.trim())}`;
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white py-20 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-down">
                            {t(translations.heroTitle)}
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-slide-up">
                            {t(translations.heroSubtitle)}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                            <a
                                href="#sectors"
                                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                {t(translations.orderNow)}
                            </a>
                            <a
                                href="#track"
                                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                {t(translations.trackYourOrder)}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sectors Section */}
            <section id="sectors" className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {t(translations.chooseSector)}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {t(translations.sectorSubtitle)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sectors.map((sector) => (
                            <Link
                                key={sector.id}
                                href={sector.href}
                                className="sector-card group bg-white border border-gray-200 p-6"
                            >
                                <div className="text-center">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${sector.color} mb-4 text-4xl transform group-hover:scale-110 transition-transform duration-300`}>
                                        {sector.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {sector.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {sector.description}
                                    </p>
                                    <span className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                                        {t(translations.orderNow)}
                                        <svg className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Order Tracking Section */}
            <section id="track" className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 text-3xl">
                                    📦
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {t(translations.trackOrder)}
                                </h2>
                                <p className="text-gray-600">
                                    {t(translations.trackOrderDesc)}
                                </p>
                            </div>

                            <form onSubmit={handleTrack} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder={t(translations.orderIdPlaceholder)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {t(translations.track)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {t(translations.whyChooseUs)}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                            >
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
