'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Navigation } from 'swiper/modules';
import { useLanguage } from '@/hooks/useLanguage';

// Swiper styles
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';

export default function Partners() {
    const { language } = useLanguage();

    // Generate paths for 27 logos (excluding #11)
    const allLogos = Array.from({ length: 28 }, (_, i) => i + 1)
        .filter(num => num !== 11)
        .map(num => ({
            src: `/partners/Logo ${num.toString().padStart(2, '0')}.png`,
            alt: `Partner ${num}`,
            id: num
        }));

    const translations = {
        title: { en: 'Trusted by Industry Leaders', ar: 'شركاء النجاح' }
    };

    return (
        <section className="py-12 md:py-16 bg-white overflow-hidden">
            {/* Section Title */}
            <div className="container mx-auto px-4 mb-8 md:mb-10 text-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                    {language === 'ar' ? translations.title.ar : translations.title.en}
                </h2>
            </div>

            {/* Swiper Grid Slider */}
            <div className="container mx-auto px-4 relative">
                <Swiper
                    modules={[Grid, Navigation]}
                    navigation={true}
                    grid={{
                        rows: 2,
                        fill: 'row'
                    }}
                    slidesPerView={3}
                    slidesPerGroup={3}      // Mobile: Flips entire page (3 columns x 2 rows = 6 items)
                    spaceBetween={10}
                    breakpoints={{
                        1024: {
                            slidesPerView: 6,
                            slidesPerGroup: 3,  // Desktop: Scrolls 3 columns (6 logos) for continuity
                            spaceBetween: 30,
                            grid: {
                                rows: 2,
                                fill: 'row'
                            }
                        }
                    }}
                    className="partners-swiper"
                >
                    {allLogos.map((logo) => (
                        <SwiperSlide key={logo.id}>
                            <div className="flex items-center justify-center h-16 md:h-20 p-2">
                                <Image
                                    src={logo.src}
                                    alt={logo.alt}
                                    width={140}
                                    height={80}
                                    loading="lazy"
                                    className="h-full w-auto object-contain transition-all duration-300"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Custom Swiper Navigation Styles */}
            <style jsx global>{`
                .partners-swiper {
                    padding: 0 50px;
                }

                .partners-swiper .swiper-button-prev,
                .partners-swiper .swiper-button-next {
                    width: 40px;
                    height: 40px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 50%;
                    color: #6b7280;
                    transition: all 0.3s ease;
                }

                .partners-swiper .swiper-button-prev:hover,
                .partners-swiper .swiper-button-next:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                    color: #374151;
                }

                .partners-swiper .swiper-button-prev::after,
                .partners-swiper .swiper-button-next::after {
                    font-size: 16px;
                    font-weight: bold;
                }

                .partners-swiper .swiper-button-disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                /* Mobile Optimizations */
                @media (max-width: 1023px) {
                    .partners-swiper {
                        padding: 0 25px; /* Reduced padding for better arrow visibility */
                    }

                    .partners-swiper .swiper-button-prev,
                    .partners-swiper .swiper-button-next {
                        width: 32px;
                        height: 32px;
                    }

                    .partners-swiper .swiper-button-prev::after,
                    .partners-swiper .swiper-button-next::after {
                        font-size: 14px;
                    }

                    /* Position arrows closer to edges on mobile */
                    .partners-swiper .swiper-button-prev {
                        left: 0;
                    }

                    .partners-swiper .swiper-button-next {
                        right: 0;
                    }
                }
            `}</style>
        </section>
    );
}