'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Eye, Target, Fingerprint, ShieldCheck, Settings, Briefcase, Handshake } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function About() {
    const { language } = useLanguage();

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

    return (
        <section className="py-12 md:py-24 bg-white relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Background Pattern - Subtle */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* 1. Intro (About Us) */}
                <div className="max-w-4xl mx-auto text-center mb-8 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
                        {language === 'ar' ? content.about.title.ar : content.about.title.en}
                    </h2>
                    <p className="text-base md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        {language === 'ar' ? content.about.text.ar : content.about.text.en}
                    </p>
                </div>

                {/* 2. Vision & Mission Cards */}
                {/* Mobile: Grid 2 Columns | Desktop: Grid 2 Columns (Larger Gap) */}
                <div className="grid grid-cols-2 gap-3 md:gap-12 mb-12 md:mb-20">
                    {content.cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className="group p-4 md:p-10 bg-gray-50 rounded-xl md:rounded-2xl transition-all duration-300 hover:shadow-lg hover:bg-white border border-transparent hover:border-gray-100 flex flex-col items-center text-center md:items-start md:text-start"
                            >
                                <div className="mb-3 md:mb-6 flex justify-center md:justify-start w-full">
                                    <div className="p-2 md:p-3 bg-white rounded-lg shadow-sm text-primary group-hover:text-secondary transition-colors duration-300 animate-fade-in">
                                        <Icon size={language === 'ar' ? 24 : 24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2 md:mb-4">
                                    {language === 'ar' ? card.title.ar : card.title.en}
                                </h3>
                                <p className="text-xs md:text-lg text-gray-600 leading-snug md:leading-relaxed">
                                    {language === 'ar' ? card.text.ar : card.text.en}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* 3. Values Grid / Slider */}
                <div className="mb-12 md:mb-20">
                    <h3 className="text-xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
                        {language === 'ar' ? content.valuesTitle.ar : content.valuesTitle.en}
                    </h3>

                    {/* Mobile: Swiper Slider with Peeking Effect */}
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
                            className="w-full pb-10 about-swiper"
                        >
                            {content.values.map((val, idx) => {
                                const Icon = val.icon;
                                return (
                                    <SwiperSlide key={idx} className="h-auto">
                                        <div className="flex flex-col items-center text-center p-5 rounded-xl bg-white border border-gray-100 shadow-sm h-[200px] hover:border-secondary/30 transition-colors duration-300">
                                            <div className="mb-3 text-secondary">
                                                <Icon size={28} strokeWidth={1.5} />
                                            </div>
                                            <h4 className="font-bold text-base text-gray-800 mb-2">
                                                {language === 'ar' ? val.title.ar : val.title.en}
                                            </h4>
                                            <p className="text-xs text-gray-500 leading-snug">
                                                {language === 'ar' ? val.desc.ar : val.desc.en}
                                            </p>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        <style jsx global>{`
                            .about-swiper .swiper-pagination-bullet-active {
                                background-color: var(--color-primary, #0f172a);
                            }
                        `}</style>
                    </div>

                    {/* Desktop: Grid 5 Columns */}
                    <div className="hidden md:grid grid-cols-5 gap-6">
                        {content.values.map((val, idx) => {
                            const Icon = val.icon;
                            return (
                                <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
                                    <div className="mb-4 text-gray-400 group-hover:text-secondary transition-colors">
                                        <Icon size={36} strokeWidth={1.25} />
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-800 mb-2">
                                        {language === 'ar' ? val.title.ar : val.title.en}
                                    </h4>
                                    <p className="text-sm text-gray-500 leading-snug">
                                        {language === 'ar' ? val.desc.ar : val.desc.en}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tagline */}
                <div className="text-center pt-8 border-t border-gray-100">
                    <p className="text-lg md:text-2xl font-serif italic text-gray-400">
                        {language === 'ar' ? content.tagline.ar : content.tagline.en}
                    </p>
                </div>
            </div>
        </section>
    );
}
