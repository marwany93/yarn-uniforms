'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';

export default function Hero() {
    const { t, language } = useLanguage();

    const translations = {
        heroTitle: { en: 'Professional Uniforms', ar: 'زي موحد احترافي' },
        heroSubtitle: { en: 'High-quality uniforms for the Educational, Medical, Industrial & Corporate, Hospitality, Transportation & Aviation, and Domestic Labor sectors.', ar: 'زي موحد عالي الجودة للقطاع التعليمي، القطاع الطبي، القطاع الصناعي والشركات، قطاع المطاعم والمقاهي، قطاع النقل والطيران، وقطاع العمالة المنزلية.' },
        slogan: { en: 'IDENTITY WOVEN', ar: 'هوية تُنسَجُ' }
    };

    return (
        <section className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {/* Mobile Image */}
                <Image
                    src="/images/hero-mobile.png"
                    alt="Hero Background Mobile"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover block md:hidden"
                />
                {/* Desktop Image */}
                <Image
                    src="/images/hero-desktop.png"
                    alt="Hero Background Desktop"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover hidden md:block"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content using Framer Motion */}
            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Dynamic Slogan */}
                    <p
                        className="text-3xl md:text-5xl tracking-wider font-bold text-white mb-4"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                        {language === 'ar' ? translations.slogan.ar : translations.slogan.en}
                    </p>

                    <h1 className="text-xl md:text-3xl font-display font-semibold mb-6 leading-snug text-gray-200">
                        {t(translations.heroTitle)}
                    </h1>

                    <p className="text-base md:text-lg px-4 md:px-0 mb-10 text-white/90 leading-relaxed max-w-3xl mx-auto">
                        {t(translations.heroSubtitle)}
                    </p>


                </motion.div>
            </div>
        </section>
    );
}
