'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { sectors, getSectorTitle, getSectorDescription } from '@/data/sectors';
import Partners from '@/components/Partners';

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

        // Partners
        trustedBy: { en: 'Trusted by Industry Leaders', ar: 'موثوق به من قادة الصناعة' },

        // Sectors
        chooseSector: { en: 'Choose Your Sector', ar: 'اختر قطاعك' },
        sectorSubtitle: { en: 'Specialized uniform solutions for every industry', ar: 'حلول زي موحد متخصصة لكل صناعة' },
        exploreSector: { en: 'Explore', ar: 'استكشف' },

        // Track Section
        trackOrder: { en: 'Track Your Order', ar: 'تتبع طلبك' },
        trackDesc: { en: 'Enter your order ID to check the status', ar: 'أدخل رقم الطلب للتحقق من الحالة' },
        orderIdPlaceholder: { en: 'Enter Order ID', ar: 'أدخل رقم الطلب' },
        track: { en: 'Track', ar: 'تتبع' },
    };

    return (
        <div className="min-h-screen">
            {/* 1. Hero Section - Yarn 2025 Brand Design */}
            <section className="relative bg-primary text-white py-24 md:py-32 lg:py-40 overflow-hidden">
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
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Centered Text Content */}
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-3 leading-tight text-white">
                                {t(translations.heroTitle)}
                            </h1>


                            {/* Dynamic Slogan */}
                            <p
                                className="text-lg md:text-xl tracking-wide font-light text-gray-200 mb-6"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                            >
                                {language === 'ar' ? 'هوية تُنسَجُ' : 'IDENTITY WOVEN'}
                            </p>

                            <p className="text-base md:text-lg px-4 md:px-0 mb-10 text-white/90 leading-relaxed max-w-3xl mx-auto">
                                {t(translations.heroSubtitle)}
                            </p>

                            {/* CTA Buttons - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 md:px-0">
                                <a
                                    href="#sectors"
                                    className="w-full sm:w-auto px-8 py-4 bg-secondary text-primary rounded-lg font-semibold hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {t(translations.orderNow)}
                                </a>
                                <a
                                    href="#track"
                                    className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {t(translations.trackYourOrder)}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Partner Logos - Infinite Marquee */}
            <Partners />

            {/* 3. Sector Selection Grid - THE CORE */}
            <section id="sectors" className="py-20 bg-background">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">
                            {t(translations.chooseSector)}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {t(translations.sectorSubtitle)}
                        </p>
                    </div>

                    {/* Responsive Sector Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {sectors.map((sector) => (
                            <Link
                                key={sector.id}
                                href={`/sectors/${sector.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-b-4 hover:-translate-y-2"
                                style={{ borderBottomColor: sector.color }}
                            >
                                {/* Icon/Image Section */}
                                <div
                                    className="relative h-48 flex items-center justify-center text-white overflow-hidden"
                                    style={{ backgroundColor: sector.color }}
                                >
                                    {/* Subtle Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                            backgroundSize: '20px 20px'
                                        }}></div>
                                    </div>

                                    <span className="relative z-10 text-7xl group-hover:scale-110 transition-transform duration-300">
                                        {sector.icon}
                                    </span>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-display font-bold text-dark mb-3">
                                        {getSectorTitle(sector, language)}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[3rem]">
                                        {getSectorDescription(sector, language)}
                                    </p>

                                    {/* Hover Action */}
                                    <div className="flex items-center justify-center gap-2 font-semibold group-hover:gap-3 transition-all" style={{ color: sector.color }}>
                                        <span>{t(translations.exploreSector)}</span>
                                        <svg
                                            className="w-5 h-5 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Track Order Section - Dark Blue Background */}
            <section id="track" className="py-20 bg-primary text-white">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm text-5xl mb-6">
                            📦
                        </div>

                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            {t(translations.trackOrder)}
                        </h2>
                        <p className="text-white/80 text-lg mb-10">
                            {t(translations.trackDesc)}
                        </p>

                        {/* Track Form */}
                        <form onSubmit={handleTrack} className="space-y-4">
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder={t(translations.orderIdPlaceholder)}
                                className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-center text-lg font-mono"
                            />
                            <button
                                type="submit"
                                className="w-full bg-secondary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
