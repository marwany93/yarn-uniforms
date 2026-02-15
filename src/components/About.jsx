'use client';

import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Eye, Target, Fingerprint, ShieldCheck, Settings, Briefcase, Handshake } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';

export default function About() {
    const { language } = useLanguage();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const content = {
        about: {
            title: { en: 'About Us', ar: 'من نحن' },
            text: {
                en: 'At YARN, we provide integrated uniform solutions tailored to multiple sectors. We design uniforms that reflect each organization’s identity while meeting the practical demands of daily work environments. We believe a uniform is more than appearance. It is an identity—woven through details, from fabric selection to fit, from function to first impression.',
                ar: 'في يارن نقدّم حلولًا متكاملة للزي الموحد تخدم قطاعات متعددة. نصمّم أزياء تعكس هوية الجهة وتواكب متطلبات بيئة العمل اليومية. نؤمن أن الزي الموحد ليس مجرد مظهر، بل هوية تُنسَجُ في التفاصيل، من الخامة إلى القصّة، ومن الاستخدام إلى الانطباع.'
            }
        },
        cards: [
            {
                key: 'vision',
                title: { en: 'Our Vision', ar: 'رؤيتنا' },
                text: {
                    en: 'To be a trusted leader in uniform solutions, weaving sector identities through quality-driven, practical designs.',
                    ar: 'أن نكون علامة موثوقة في الزي الموحد، ننسج هوية القطاعات من خلال تصاميم عملية وجودة معتمدة.'
                },
                icon: Eye
            },
            {
                key: 'mission',
                title: { en: 'Our Mission', ar: 'رسالتنا' },
                text: {
                    en: 'To design and supply uniforms that align with the nature of each sector, serving large corporations and official entities with solutions that combine comfort, durability, and a clearly defined identity.',
                    ar: 'نصمّم ونورّد أزياء موحدة تناسب طبيعة كل قطاع، وتلبي احتياجات الشركات الكبرى والجهات الرسمية، بمنتجات تجمع بين الراحة، المتانة، وهوية واضحة تُرى وتُشعر.'
                },
                icon: Target
            }
        ],
        valuesTitle: { en: 'Our Values', ar: 'قيمنا' },
        values: [
            {
                icon: Fingerprint,
                title: { en: 'Identity', ar: 'الهوية' },
                desc: { en: 'We weave each organization’s identity into every uniform we create.', ar: 'ننسج هوية كل جهة في زي يعكس حضورها.' }
            },
            {
                icon: ShieldCheck,
                title: { en: 'Quality', ar: 'الجودة' },
                desc: { en: 'We commit to high standards in materials, construction, and finishing.', ar: 'نختار خامات وتصاميم تتحمل العمل اليومي وتحافظ على مظهرها.' }
            },
            {
                icon: Settings,
                title: { en: 'Functionality', ar: 'العملية' },
                desc: { en: 'Designs made to perform efficiently in real working environments.', ar: 'زي مصمم ليعمل بكفاءة في كل بيئة.' }
            },
            {
                icon: Briefcase,
                title: { en: 'Professionalism', ar: 'الاحتراف' },
                desc: { en: 'Thoughtful details that reflect a strong corporate image.', ar: 'تفاصيل مدروسة تعكس صورة مؤسسية متكاملة.' }
            },
            {
                icon: Handshake,
                title: { en: 'Partnership', ar: 'الشراكة' },
                desc: { en: 'Long-term relationships built on trust and reliability.', ar: 'علاقات طويلة المدى تُبنى على الثقة والالتزام.' }
            }
        ],
        tagline: { en: 'YARN — Identity, Woven', ar: 'يارن… هوية تُنسَجُ' }
    };

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* MOBILE BACKGROUND: Immersive Parallax Effect */}
            <div className="md:hidden absolute inset-0 z-0">
                <Image
                    src="/images/about-mobile.png"
                    alt="Fabric Background Mobile"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover block md:hidden opacity-30"
                />
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-black/70" />
            </div>

            <div className="flex flex-col md:flex-row relative z-10">

                {/* 1. Left Column (Content) - Scrollable */}
                <div className="w-full md:w-1/2 md:py-24 md:px-12 px-4 py-16 order-2 md:order-1">
                    <div className="max-w-xl mx-auto space-y-16 md:space-y-32">

                        {/* Intro Block */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeUp}
                            className="text-center md:text-start"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display leading-tight text-white md:text-gray-900 drop-shadow-md md:drop-shadow-none">
                                {language === 'ar' ? content.about.title.ar : content.about.title.en}
                            </h2>
                            <p className="text-lg md:text-xl leading-relaxed text-gray-200 md:text-gray-600">
                                {language === 'ar' ? content.about.text.ar : content.about.text.en}
                            </p>
                        </motion.div>

                        {/* Vision & Mission Block - Glassmorphism Cards on Mobile */}
                        <div className="grid grid-cols-1 gap-6">
                            {content.cards.map((card, idx) => {
                                const Icon = card.icon;
                                return (
                                    <motion.div
                                        key={card.key}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={fadeUp}
                                        transition={{ delay: idx * 0.2 }}
                                        className="p-8 rounded-2xl transition-all duration-300 group
                                            bg-white/95 backdrop-blur-md shadow-xl border border-white/20
                                            md:bg-gray-50 md:backdrop-blur-none md:shadow-none md:border-gray-100 md:hover:shadow-lg md:hover:bg-white"
                                    >
                                        <div className="mb-4 text-primary group-hover:text-secondary transition-colors">
                                            <Icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {language === 'ar' ? card.title.ar : card.title.en}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {language === 'ar' ? card.text.ar : card.text.en}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Values Block */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeUp}
                        >
                            <h3 className="text-2xl md:text-4xl font-bold mb-8 md:mb-10 text-center md:text-start text-white md:text-gray-900 drop-shadow-md md:drop-shadow-none">
                                {language === 'ar' ? content.valuesTitle.ar : content.valuesTitle.en}
                            </h3>

                            {/* Desktop: Vertical List */}
                            <div className="hidden md:grid grid-cols-1 gap-6">
                                {content.values.map((val, idx) => {
                                    const Icon = val.icon;
                                    return (
                                        <div key={idx} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                            <div className="p-3 bg-white rounded-lg shadow-sm text-primary shrink-0">
                                                <Icon size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">
                                                    {language === 'ar' ? val.title.ar : val.title.en}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {language === 'ar' ? val.desc.ar : val.desc.en}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile: Swiper Slider (Preserved Logic - Premium Style) */}
                            <div className="md:hidden">
                                <Swiper
                                    modules={[Pagination]}
                                    spaceBetween={15}
                                    slidesPerView={1.3}
                                    centeredSlides={false}
                                    loop={false}
                                    pagination={{
                                        clickable: true,
                                        dynamicBullets: true
                                    }}
                                    breakpoints={{
                                        640: {
                                            slidesPerView: 2.5,
                                            spaceBetween: 20
                                        }
                                    }}
                                    className="w-full pb-12 about-swiper"
                                >
                                    {content.values.map((val, idx) => {
                                        const Icon = val.icon;
                                        return (
                                            <SwiperSlide key={idx} className="h-auto">
                                                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-lg border border-white/20 h-[220px] mx-1 backdrop-blur-sm">
                                                    <div className="mb-4 text-secondary">
                                                        <Icon size={32} strokeWidth={1.5} />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                                                        {language === 'ar' ? val.title.ar : val.title.en}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 leading-snug">
                                                        {language === 'ar' ? val.desc.ar : val.desc.en}
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                                <style jsx global>{`
                                    .about-swiper .swiper-pagination-bullet {
                                        background-color: rgba(255, 255, 255, 0.5);
                                    }
                                    .about-swiper .swiper-pagination-bullet-active {
                                        background-color: #ffffff;
                                    }
                                `}</style>
                            </div>
                        </motion.div>

                        {/* Tagline */}
                        <div className="text-center md:text-start pt-8 border-t border-white/20 md:border-gray-100">
                            <p className="text-lg md:text-2xl font-serif italic text-white/60 md:text-gray-400">
                                {language === 'ar' ? content.tagline.ar : content.tagline.en}
                            </p>
                        </div>

                    </div>
                </div>

                {/* 2. Right Column (Visual) - Sticky on Desktop */}
                <div className="hidden md:block w-1/2 sticky top-0 h-screen order-1 md:order-2">
                    <div className="relative w-full h-full bg-gray-100">
                        <Image
                            src="/images/about-desktop.png"
                            alt="Fabric Texture Desktop"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover hidden md:block"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                        {/* Optional Floating Text/Logo */}
                        <div className="absolute bottom-12 left-12 right-12 text-white">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-4xl font-display font-bold leading-tight drop-shadow-lg"
                            >
                                {language === 'ar'
                                    ? "تفاصيل تُروى في كل خيط"
                                    : "Details bold within every thread."}
                            </motion.p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
