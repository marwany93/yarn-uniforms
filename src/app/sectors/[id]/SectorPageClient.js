'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { getSectorTitle, getSectorDescription } from '@/data/sectors';
import SchoolWizard from '@/components/wizard/SchoolWizard';
import CartSummary from '@/components/wizard/CartSummary';

// Bilingual content mapping for each sector
const sectorContent = {
    schools: {
        heroTitle: { en: 'Educational Sector Uniforms', ar: 'الزي الموحد للقطاع التعليمي' },
        heroDesc: {
            en: 'From the morning assembly to the last class. We design comfortable, practical uniforms built to last through movement and activity. Because the school day deserves a uniform that keeps up, step by step.',
            ar: 'من أول طابور الصباح إلى آخر حصة. نصمم زيًا مريحًا، عمليًا، ويعيش طويلًا مع الحركة والنشاط. لأن يوم الدراسة يستحق زيًا يواكبه خطوة بخطوة.'
        }
    },
    medical: {
        heroTitle: { en: 'Medical Uniforms', ar: 'الزي الطبي' },
        heroDesc: {
            en: 'We design uniforms that match the precision of the profession and the pace of the day. Comfortable, easy-care fabrics offering freedom of movement. Because those who care for others... deserve to be cared for.',
            ar: 'نصمم زيًا يواكب دقة المهنة وسرعة اليوم. خامات مريحة، سهلة العناية، وتصاميم تمنح حرية الحركة. لأن من يعتني بالآخرين… يستحق من يعتني به.'
        }
    },
    corporate: {
        heroTitle: { en: 'Industrial & Corporate Uniforms', ar: 'زي القطاع الصناعي والشركات' },
        heroDesc: {
            en: 'From the factory floor to the executive offices. We unify appearance while elevating comfort and quality. Practical, elegant uniforms designed to work as hard as you do.',
            ar: 'من أرض المصنع إلى مكاتب الإدارة. نوحّد المظهر، ونرفع مستوى الراحة والجودة. زي عملي، أنيق، ومصمم ليعمل بجد مثلك.'
        }
    },
    hospitality: {
        heroTitle: { en: 'Restaurants & Cafes Uniforms', ar: 'زي المطاعم والمقاهي' },
        heroDesc: {
            en: 'Uniforms that reflect the venue\'s identity before the first order. We design practical, comfortable attire that withstands long shifts, maintaining an elegant appearance worthy of your hospitality.',
            ar: 'زي يعكس هوية المكان قبل أول طلب. نصمم أزياء عملية ومريحة تتحمل ساعات العمل الطويلة، يحافظ على مظهر أنيق يليق بتجربة الضيافة وجودة الخدمة.'
        }
    },
    transportation: {
        heroTitle: { en: 'Transportation & Aviation Uniforms', ar: 'زي قطاع النقل والطيران' },
        heroDesc: {
            en: 'Uniforms reflecting discipline and reliability, designed for work environments that demand a consistent presence and high performance.',
            ar: 'زي موحد يعكس الانضباط والموثوقية، ومصمم لبيئات عمل تتطلب حضورًا ثابتًا وأداءً عاليًا.'
        }
    },
    domestic: {
        heroTitle: { en: 'Domestic Labor Uniforms', ar: 'زي العمالة المنزلية' },
        heroDesc: {
            en: 'Practical and comfortable uniforms for daily use. We prioritize lightness, ease of movement, and endurance for long working hours. Yarn offers uniforms that respect the wearer above all else.',
            ar: 'زي عملي ومريح للاستخدام اليومي. نراعي الخفة، سهولة الحركة، وتحمل ساعات العمل الطويلة. يارن تقدّم زيًا يحترم من يرتديه قبل كل شيء.'
        }
    }
};

export default function SectorPageClient({ sector }) {
    const { t, language } = useLanguage();

    const content = sectorContent[sector.id] || sectorContent.schools;

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
        comingSoon: { en: 'Coming Soon', ar: 'قريباً' },
        wizardInDevelopment: {
            en: 'Our custom uniform designer for this sector is currently in development. Contact us directly for inquiries.',
            ar: 'مصمم الزي الموحد المخصص لهذا القطاع قيد التطوير حالياً. اتصل بنا مباشرة للاستفسارات.'
        }
    };

    /// If this is the schools sector, render with hero + wizard + sidebar
    if (sector.id === 'schools') {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* 1. Hero Section */}
                <section className="relative h-[35vh] max-h-[350px] flex items-center justify-center overflow-hidden">
                    <Image
                        src={sector.image}
                        alt={language === 'ar' ? content.heroTitle.ar : content.heroTitle.en}
                        fill
                        className="object-cover object-[center_30%]"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="container-custom relative z-10 text-center px-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white drop-shadow-lg">
                            {language === 'ar' ? content.heroTitle.ar : content.heroTitle.en}
                        </h1>
                    </div>
                </section>

                {/* 2. Wizard Section - التوسعة "العملاقة" هنا */}
                <div className="w-full max-w-[1900px] mx-auto px-2 md:px-6 lg:px-10 py-12"> {/* كبرنا لـ 1900 بكسل */}
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 md:gap-10"> {/* قسمنا لـ 6 أعمدة لدقة أكبر */}

                        {/* الـ Wizard أخد 5 أعمدة من 6 (يعني 83% من مساحة الشاشة) */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 w-full">
                                <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading Wizard...</div>}>
                                    <SchoolWizard />
                                </Suspense>
                            </div>
                        </div>

                        {/* السلة الجانبية أخدت عمود واحد فقط (17%) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <CartSummary />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For other sectors, render the generic page with hero + "Coming Soon"
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
            {/* Hero Section with Image Background */}
            <section className="relative h-[50vh] md:h-[45vh] lg:h-[40vh] max-h-[480px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <Image
                    src={sector.image}
                    alt={language === 'ar' ? content.heroTitle.ar : content.heroTitle.en}
                    fill
                    className="object-cover object-[center_30%]"
                    priority
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Content */}
                <div className="container-custom relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight text-white drop-shadow-lg">
                        {language === 'ar' ? content.heroTitle.ar : content.heroTitle.en}
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed text-white/95 drop-shadow-md">
                        {language === 'ar' ? content.heroDesc.ar : content.heroDesc.en}
                    </p>

                    {/* Coming Soon Badge */}
                    <div className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-2xl font-bold">{t(translations.comingSoon)}</span>
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
                                ? 'اتصل بنا للحصول على عرض أسعار مخصص'
                                : 'Contact us for a custom quote'}
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-secondary text-primary rounded-lg font-bold text-lg hover:bg-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                        >
                            <span>{language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</span>
                            <svg className="w-6 h-6 ltr:block rtl:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <svg className="w-6 h-6 ltr:hidden rtl:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
