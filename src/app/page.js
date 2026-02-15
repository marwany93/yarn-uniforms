'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import Sectors from '@/components/Sectors';
import About from '@/components/About';

export default function HomePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            router.push(`/track-order?id=${orderId.trim()}`);
        }
    };

    const translations = {
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
            {/* 1. Hero Section - Cinematic with Animation */}
            <Hero />

            {/* 2. About Us Section */}
            <About />

            {/* 3. Sectors Section - Image Cards */}
            <Sectors />

            {/* 4. Partner Logos - Infinite Marquee */}
            <Partners />

            {/* 5. Track Order Section - Dark Blue Background */}
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
