'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';

export default function HomePage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [orderId, setOrderId] = useState('');

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            router.push(`/track?id=${orderId.trim()}`);
        }
    };

    const translations = {
        // Hero
        heroTitle: { en: 'Professional Uniforms', ar: 'زي موحد احترافي' },
        heroSubtitle: { en: 'Quality uniforms for schools, factories, companies & hospitals', ar: 'زي موحد عالي الجودة للمدارس والمصانع والشركات والمستشفيات' },
        orderNow: { en: 'Order Now', ar: 'اطلب الآن' },
        trackYourOrder: { en: 'Track Order', ar: 'تتبع طلبك' },

        // Sectors
        chooseSector: { en: 'Choose Your Sector', ar: 'اختر قطاعك' },
        sectorSubtitle: { en: 'Specialized uniform solutions for every industry', ar: 'حلول زي موحد متخصصة لكل صناعة' },
        schools: { en: 'Schools', ar: 'المدارس' },
        schoolsDesc: { en: 'Comfortable & durable uniforms for students', ar: 'زي موحد مريح ومتين للطلاب' },
        factories: { en: 'Factories', ar: 'المصانع' },
        factoriesDesc: { en: 'Safety-compliant workwear for industrial settings', ar: 'ملابس عمل متوافقة مع معايير السلامة' },
        companies: { en: 'Companies', ar: 'الشركات' },
        companiesDesc: { en: 'Professional corporate uniforms', ar: 'زي موحد احترافي للشركات' },
        hospitals: { en: 'Hospitals', ar: 'المستشفيات' },
        hospitalsDesc: { en: 'Hygienic medical scrubs & uniforms', ar: 'سكراب طبي وزي موحد صحي' },

        // Quality Section
        detailsMatter: { en: 'Details Matter', ar: 'التفاصيل مهمة' },
        qualityDesc: { en: 'Every stitch, every fabric, every design is crafted with precision and care', ar: 'كل غرزة، كل قماش، كل تصميم مصنوع بدقة وعناية' },

        // Track Section
        trackOrder: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        trackDesc: { en: 'Enter your order ID to check the status', ar: 'أدخل رقم الطلب للتحقق من الحالة' },
        orderIdPlaceholder: { en: 'Enter Order ID', ar: 'أدخل رقم الطلب' },
        track: { en: 'Track', ar: 'تتبع' },
    };

    const sectors = [
        {
            id: 'schools',
            name: t(translations.schools),
            description: t(translations.schoolsDesc),
            icon: '🎓',
            image: '/assets/sector-schools.png',
            href: '/order/schools'
        },
        {
            id: 'factories',
            name: t(translations.factories),
            description: t(translations.factoriesDesc),
            icon: '🏭',
            image: null,
            href: '/order/factories'
        },
        {
            id: 'companies',
            name: t(translations.companies),
            description: t(translations.companiesDesc),
            icon: '💼',
            image: '/assets/hero-group-overhead.png',
            href: '/order/companies'
        },
        {
            id: 'hospitals',
            name: t(translations.hospitals),
            description: t(translations.hospitalsDesc),
            icon: '🏥',
            image: null,
            href: '/order/hospitals'
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section - Yarn 2025 Brand Design */}
            <section className="relative bg-primary text-white py-20 lg:py-32 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/assets/pattern-wavy-lines.png"
                        alt=""
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Text Content */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight text-white">
                                {t(translations.heroTitle)}
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed">
                                {t(translations.heroSubtitle)}
                            </p>

                            {/* CTA Buttons - Brand Compliant */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <a
                                    href="#sectors"
                                    className="px-8 py-4 bg-secondary text-primary rounded-lg font-semibold hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {t(translations.orderNow)}
                                </a>
                                <a
                                    href="#track"
                                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {t(translations.trackYourOrder)}
                                </a>
                            </div>
                        </div>

                        {/* Right Column - Hero Image */}
                        <div className="hidden lg:flex items-center justify-center">
                            <div className="relative w-full h-96">
                                <Image
                                    src="/assets/hero-main-group.png"
                                    alt="Professional Uniforms"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sectors Section */}
            <section id="sectors" className="py-16 bg-background">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">
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
                                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-b-4 border-secondary hover:border-primary transform hover:-translate-y-1"
                            >
                                {sector.image && (
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={sector.image}
                                            alt={sector.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6 text-center">
                                    {!sector.image && (
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 text-4xl">
                                            {sector.icon}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-display font-bold text-dark mb-2">
                                        {sector.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {sector.description}
                                    </p>
                                    <span className="inline-flex items-center text-primary font-semibold group-hover:text-primary-600">
                                        {t(translations.orderNow)}
                                        <svg className="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quality Section - NEW */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative h-96 lg:h-[500px]">
                            <Image
                                src="/assets/feature-quality-mockup.png"
                                alt="Quality Details"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark mb-6">
                                {t(translations.detailsMatter)}
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                {t(translations.qualityDesc)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Track Order Section */}
            <section id="track" className="py-16 bg-background">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-3xl mb-6">
                            📦
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">
                            {t(translations.trackOrder)}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {t(translations.trackDesc)}
                        </p>

                        <form onSubmit={handleTrack} className="space-y-4">
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder={t(translations.orderIdPlaceholder)}
                                className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center text-lg font-mono"
                            />
                            <button
                                type="submit"
                                className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                {t(translations.track)}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
