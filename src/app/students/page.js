'use client';

import { useLanguage } from '@/hooks/useLanguage';
import Image from 'next/image';
import StudentWizard from '@/components/wizard/StudentWizard';
import CartSummary from '@/components/wizard/CartSummary';

export default function StudentPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                <Image
                    src="/images/student-hero.png"
                    alt={language === 'ar' ? 'زي مدرسي للطلاب' : 'Student School Uniform'}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
                        {language === 'ar' ? 'زي الطلاب وأولياء الأمور' : 'Uniforms for Students'}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl animate-slide-up">
                        {language === 'ar'
                            ? 'اطلب زي ابنك/بنتك المدرسي ويوصلك لحد البيت. مقاسات مظبوطة وخامات تريحهم.'
                            : 'Get your school uniform delivered to your doorstep. Custom fit, premium quality.'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 -mt-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Wizard Section */}
                    <div className="flex-1">
                        <StudentWizard />
                    </div>

                    {/* Sidebar (Cart Summary) - Visible on Desktop */}
                    <div className="hidden lg:block w-96 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <CartSummary />

                            {/* Trust Badges */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-2xl">🚚</span>
                                        <div>
                                            <span className="font-bold block text-gray-900">{language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
                                            {language === 'ar' ? 'توصيل لباب المنزل' : 'Direct to your doorstep'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-2xl">✨</span>
                                        <div>
                                            <span className="font-bold block text-gray-900">{language === 'ar' ? 'جودة مضمونة' : 'Premium Quality'}</span>
                                            {language === 'ar' ? 'خامات عالية الجودة' : 'High quality materials'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
