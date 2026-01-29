'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { sectors, getSectorTitle, getSectorDescription } from '@/data/sectors';

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

            {/* 2. Success Partners Strip - NEW */}
            <section className="py-12 bg-gray-100 border-y border-gray-200">
                <div className="container-custom">
                    <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
                        {t(translations.trustedBy)}
                    </p>

                    {/* Partner Logos Grid */}
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {/* Placeholder Logo 1 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🏢</span>
                            </div>
                        </div>

                        {/* Placeholder Logo 2 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🏥</span>
                            </div>
                        </div>

                        {/* Placeholder Logo 3 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🎓</span>
                            </div>
                        </div>

                        {/* Placeholder Logo 4 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🏭</span>
                            </div>
                        </div>

                        {/* Placeholder Logo 5 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🍽️</span>
                            </div>
                        </div>

                        {/* Placeholder Logo 6 */}
                        <div className="flex items-center justify-center opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">💼</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
