'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export default function Sectors() {
    const { language } = useLanguage();

    const sectors = [
        {
            id: 'schools',
            img: '/sectors/sector-schools.png',
            title: { en: 'Schools', ar: 'المدارس' }
        },
        {
            id: 'medical',
            img: '/sectors/sector-medical.png',
            title: { en: 'Medical Sector', ar: 'القطاع الطبي' }
        },
        {
            id: 'corporate',
            img: '/sectors/sector-corporate.png',
            title: { en: 'Corporate & Factories', ar: 'الشركات والمصانع' }
        },
        {
            id: 'hospitality',
            img: '/sectors/sector-hospitality.png',
            title: { en: 'Hotels & Restaurants', ar: 'الفنادق والمطاعم' }
        },
    ];

    const translations = {
        title: { en: 'Choose Your Sector', ar: 'اختر قطاعك' },
        subtitle: { en: 'Specialized uniform solutions for every industry', ar: 'حلول زي موحد متخصصة لكل صناعة' }
    };

    return (
        <section id="sectors" className="py-16 md:py-24 bg-gray-50">
            {/* Section Header */}
            <div className="container mx-auto px-4 mb-12 md:mb-16 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                    {language === 'ar' ? translations.title.ar : translations.title.en}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {language === 'ar' ? translations.subtitle.ar : translations.subtitle.en}
                </p>
            </div>

            {/* Sectors Grid */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {sectors.map((sector) => (
                        <Link
                            key={sector.id}
                            href={`/sectors/${sector.id}`}
                            className="group relative overflow-hidden rounded-2xl h-[300px] md:h-[400px] shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Sector Image */}
                            <Image
                                src={sector.img}
                                alt={language === 'ar' ? sector.title.ar : sector.title.en}
                                fill
                                className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Sector Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {language === 'ar' ? sector.title.ar : sector.title.en}
                                </h3>
                                <div className="w-16 h-1 bg-white/60 group-hover:w-24 group-hover:bg-white transition-all duration-300" />
                            </div>

                            {/* Hover Indicator */}
                            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
