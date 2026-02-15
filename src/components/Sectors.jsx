'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
        <section id="sectors" className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        {language === 'ar' ? translations.title.ar : translations.title.en}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        {language === 'ar' ? translations.subtitle.ar : translations.subtitle.en}
                    </motion.p>
                </div>

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">

                    {/* 1. SCHOOLS: Large Feature (2x2) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative group rounded-3xl overflow-hidden md:col-span-2 md:row-span-2 h-[300px] md:h-full shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Link href={`/sectors/${sectors[0].id}`} className="block w-full h-full">
                            <Image
                                src={sectors[0].img}
                                alt={language === 'ar' ? sectors[0].title.ar : sectors[0].title.en}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {language === 'ar' ? sectors[0].title.ar : sectors[0].title.en}
                                </h3>
                                <div className="h-1 bg-white w-12 group-hover:w-24 transition-all duration-300" />
                            </div>
                        </Link>
                    </motion.div>

                    {/* 2. MEDICAL: Tall Portrait (1x2) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative group rounded-3xl overflow-hidden md:col-span-1 md:row-span-2 h-[300px] md:h-full shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Link href={`/sectors/${sectors[1].id}`} className="block w-full h-full">
                            <Image
                                src={sectors[1].img}
                                alt={language === 'ar' ? sectors[1].title.ar : sectors[1].title.en}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {language === 'ar' ? sectors[1].title.ar : sectors[1].title.en}
                                </h3>
                                <div className="h-1 bg-white w-8 group-hover:w-16 transition-all duration-300" />
                            </div>
                        </Link>
                    </motion.div>

                    {/* 3. CORPORATE: Square (1x1) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative group rounded-3xl overflow-hidden md:col-span-1 md:row-span-1 h-[250px] md:h-full shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Link href={`/sectors/${sectors[2].id}`} className="block w-full h-full">
                            <Image
                                src={sectors[2].img}
                                alt={language === 'ar' ? sectors[2].title.ar : sectors[2].title.en}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                    {language === 'ar' ? sectors[2].title.ar : sectors[2].title.en}
                                </h3>
                                <div className="h-1 bg-white w-8 group-hover:w-16 transition-all duration-300" />
                            </div>
                        </Link>
                    </motion.div>

                    {/* 4. HOSPITALITY: Square (1x1) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="relative group rounded-3xl overflow-hidden md:col-span-1 md:row-span-1 h-[250px] md:h-full shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Link href={`/sectors/${sectors[3].id}`} className="block w-full h-full">
                            <Image
                                src={sectors[3].img}
                                alt={language === 'ar' ? sectors[3].title.ar : sectors[3].title.en}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                    {language === 'ar' ? sectors[3].title.ar : sectors[3].title.en}
                                </h3>
                                <div className="h-1 bg-white w-8 group-hover:w-16 transition-all duration-300" />
                            </div>
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
