'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { sectors, getSectorTitle } from '@/data/sectors';

export default function Sectors() {
    const { language } = useLanguage();

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

                {/* RESPONSIVE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {sectors.map((sector, index) => (
                        <motion.div
                            key={sector.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group rounded-3xl overflow-hidden h-[300px] md:h-[350px] shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <Link href={`/sectors/${sector.id}`} className="block w-full h-full">
                                <Image
                                    src={sector.image}
                                    alt={getSectorTitle(sector, language)}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />



                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                        {getSectorTitle(sector, language)}
                                    </h3>
                                    <div className="h-1 bg-white w-12 group-hover:w-24 transition-all duration-300 rounded-full" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
