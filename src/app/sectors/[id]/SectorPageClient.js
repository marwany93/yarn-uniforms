'use client';

import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { getSectorTitle, getSectorDescription } from '@/data/sectors';

export default function SectorPageClient({ sector }) {
    const { t, language } = useLanguage();

    const translations = {
        startDesigning: { en: 'Start Designing Your Order', ar: 'ابدأ تصميم طلبك' },
        whyChooseUs: { en: 'Why Choose Yarn Uniforms?', ar: 'لماذا تختار يارن للزي الموحد؟' },
        qualityCommitment: {
            en: 'We are committed to delivering exceptional quality uniforms tailored specifically for your industry. With years of experience and a deep understanding of sector-specific requirements, we ensure every piece meets the highest standards of comfort, durability, and professional appearance.',
            ar: 'نحن ملتزمون بتقديم زي موحد عالي الجودة مصمم خصيصًا لصناعتك. مع سنوات من الخبرة والفهم العميق للمتطلبات الخاصة بكل قطاع، نضمن أن كل قطعة تلبي أعلى معايير الراحة والمتانة والمظهر المهني.'
        },
        customSolutions: { en: 'Custom Solutions', ar: 'حلول مخصصة' },
        customDesc: {
            en: 'Every organization is unique. We work closely with you to create uniforms that perfectly match your brand identity and operational needs.',
            ar: 'كل منظمة فريدة من نوعها. نعمل معك عن كثب لإنشاء زي موحد يتناسب تمامًا مع هوية علامتك التجارية واحتياجاتك التشغيلية.'
        },
        premiumMaterials: { en: 'Premium Materials', ar: 'مواد فاخرة' },
        materialsDesc: {
            en: 'We use only the finest fabrics and materials to ensure long-lasting comfort and durability in every uniform we create.',
            ar: 'نستخدم فقط أجود الأقمشة والمواد لضمان الراحة والمتانة طويلة الأمد في كل زي موحد نصنعه.'
        },
        fastDelivery: { en: 'Fast Delivery', ar: 'توصيل سريع' },
        deliveryDesc: {
            en: 'Our streamlined production process ensures your uniforms are delivered on time, every time, without compromising on quality.',
            ar: 'تضمن عملية الإنتاج المبسطة لدينا تسليم زيك الموحد في الوقت المحدد، في كل مرة، دون المساس بالجودة.'
        },
    };

    const handleStartDesigning = () => {
        console.log('Navigate to Wizard');
    };

    const benefits = [
        {
            title: t(translations.customSolutions),
            description: t(translations.customDesc),
            icon: '🎨',
        },
        {
            title: t(translations.premiumMaterials),
            description: t(translations.materialsDesc),
            icon: '✨',
        },
        {
            title: t(translations.fastDelivery),
            description: t(translations.deliveryDesc),
            icon: '⚡',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative bg-primary text-white py-24 lg:py-32 overflow-hidden"
                style={{ backgroundColor: sector.color }}
            >
                {/* Background Image or Pattern */}
                <div className="absolute inset-0 opacity-20">
                    {sector.image ? (
                        <Image
                            src={sector.image}
                            alt={getSectorTitle(sector, language)}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}></div>
                    )}
                </div>

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Sector Icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm text-6xl mb-8">
                            {sector.icon}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                            {getSectorTitle(sector, language)}
                        </h1>

                        {/* Description */}
                        <p className="text-xl md:text-2xl mb-10 leading-relaxed text-white/90">
                            {getSectorDescription(sector, language)}
                        </p>

                        {/* Primary CTA */}
                        <button
                            onClick={handleStartDesigning}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-lg font-bold text-lg hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                            style={{ color: sector.color }}
                        >
                            <span>{t(translations.startDesigning)}</span>
                            <svg className="w-6 h-6 ltr:block rtl:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <svg className="w-6 h-6 ltr:hidden rtl:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-6">
                            {t(translations.whyChooseUs)}
                        </h2>
                        <p className="text-lg text-gray-600 text-center mb-16 leading-relaxed">
                            {t(translations.qualityCommitment)}
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md text-4xl mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-dark mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h3 className="text-3xl font-display font-bold mb-6">
                            {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
                        </h3>
                        <p className="text-xl mb-8 text-white/90">
                            {language === 'ar'
                                ? 'دعنا نساعدك في إنشاء زي موحد مثالي لمؤسستك'
                                : "Let's help you create the perfect uniforms for your organization"
                            }
                        </p>
                        <button
                            onClick={handleStartDesigning}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-secondary text-primary rounded-lg font-bold text-lg hover:bg-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                        >
                            <span>{t(translations.startDesigning)}</span>
                            <svg className="w-6 h-6 ltr:block rtl:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <svg className="w-6 h-6 ltr:hidden rtl:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
