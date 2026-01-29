'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import {
    schoolProducts,
    productCategories,
    getProductsByCategory
} from '@/data/schoolProducts';

export default function SchoolWizard() {
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        gender: null,
        stage: null
    });
    const [selection, setSelection] = useState({
        category: null,
        product: null
    });

    const translations = {
        // View 1: Configuration
        whoShopping: { en: 'Who are we shopping for?', ar: 'لمن نتسوق؟' },
        boys: { en: 'Boys', ar: 'بنين' },
        girls: { en: 'Girls', ar: 'بنات' },
        schoolStage: { en: 'School Stage?', ar: 'المرحلة الدراسية؟' },
        kgPrimary: { en: 'KG & Primary', ar: 'روضة وابتدائي' },
        prepSecondary: { en: 'Prep & Secondary', ar: 'إعدادي وثانوي' },

        // View 2: Categories
        selectCategory: { en: 'Select Category', ar: 'اختر الفئة' },

        // View 3: Styles
        selectStyle: { en: 'Select Style', ar: 'اختر التصميم' },

        // Navigation
        back: { en: 'Back', ar: 'رجوع' },
        next: { en: 'Next', ar: 'التالي' },
        continue: { en: 'Continue', ar: 'متابعة' },
    };

    // Filter categories based on gender
    const getAvailableCategories = () => {
        if (!config.gender) return productCategories;

        return productCategories.filter(category => {
            const categoryProducts = getProductsByCategory(category.id);
            // Check if category has products matching the selected gender
            return categoryProducts.some(product =>
                product.type === config.gender || product.type === 'unisex'
            );
        });
    };

    // Get products for selected category filtered by gender
    const getFilteredProducts = () => {
        if (!selection.category) return [];

        const categoryProducts = getProductsByCategory(selection.category);

        if (!config.gender) return categoryProducts;

        return categoryProducts.filter(product =>
            product.type === config.gender || product.type === 'unisex'
        );
    };

    const handleGenderSelect = (gender) => {
        setConfig({ ...config, gender });
    };

    const handleStageSelect = (stage) => {
        setConfig({ ...config, stage });
        // Auto-advance to next step when both are selected
        if (config.gender) {
            setStep(2);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setSelection({ ...selection, category: categoryId, product: null });
        setStep(3);
    };

    const handleProductSelect = (productId) => {
        setSelection({ ...selection, product: productId });
    };

    const handleNext = () => {
        // Placeholder for next step (Details view)
        console.log('Proceed to Details with selection:', { config, selection });
        alert('Next step: Product Details & Customization (Coming Soon)');
    };

    // View 1: Configuration
    const renderConfigView = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Gender Selection */}
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                    {t(translations.whoShopping)}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleGenderSelect('boys')}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${config.gender === 'boys'
                                ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                : 'border-gray-300 hover:border-primary hover:shadow-md'
                            }`}
                    >
                        <div className="text-5xl mb-3">👦</div>
                        <div className="text-xl font-bold text-gray-900">
                            {t(translations.boys)}
                        </div>
                    </button>
                    <button
                        onClick={() => handleGenderSelect('girls')}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${config.gender === 'girls'
                                ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                : 'border-gray-300 hover:border-primary hover:shadow-md'
                            }`}
                    >
                        <div className="text-5xl mb-3">👧</div>
                        <div className="text-xl font-bold text-gray-900">
                            {t(translations.girls)}
                        </div>
                    </button>
                </div>
            </div>

            {/* Stage Selection - Only show if gender is selected */}
            {config.gender && (
                <div className="animate-slide-up">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                        {t(translations.schoolStage)}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleStageSelect('kg_primary')}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 ${config.stage === 'kg_primary'
                                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                    : 'border-gray-300 hover:border-primary hover:shadow-md'
                                }`}
                        >
                            <div className="text-5xl mb-3">🎒</div>
                            <div className="text-xl font-bold text-gray-900">
                                {t(translations.kgPrimary)}
                            </div>
                        </button>
                        <button
                            onClick={() => handleStageSelect('prep_secondary')}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 ${config.stage === 'prep_secondary'
                                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                    : 'border-gray-300 hover:border-primary hover:shadow-md'
                                }`}
                        >
                            <div className="text-5xl mb-3">🎓</div>
                            <div className="text-xl font-bold text-gray-900">
                                {t(translations.prepSecondary)}
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // View 2: Category Selection
    const renderCategoryView = () => {
        const availableCategories = getAvailableCategories();

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-primary hover:text-primary-700 font-semibold"
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t(translations.back)}
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t(translations.selectCategory)}
                    </h2>
                    <div className="w-20"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className="p-6 rounded-xl border-2 border-gray-300 hover:border-primary hover:shadow-lg transition-all duration-300 bg-white"
                        >
                            <div className="text-xl font-bold text-gray-900">
                                {language === 'ar' ? category.nameAr : category.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // View 3: Style Selection
    const renderStyleView = () => {
        const products = getFilteredProducts();
        const selectedCategory = productCategories.find(c => c.id === selection.category);

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 text-primary hover:text-primary-700 font-semibold"
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t(translations.back)}
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCategory && (language === 'ar' ? selectedCategory.nameAr : selectedCategory.name)}
                    </h2>
                    <div className="w-20"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleProductSelect(product.id)}
                            className={`group relative rounded-xl overflow-hidden border-4 transition-all duration-300 ${selection.product === product.id
                                    ? 'border-primary shadow-2xl scale-105'
                                    : 'border-gray-200 hover:border-gray-400 hover:shadow-lg'
                                }`}
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-gray-100">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="p-3 bg-white">
                                <div className="font-bold text-primary text-lg">{product.code}</div>
                                <div className="text-sm text-gray-600">{product.name}</div>
                            </div>

                            {/* Selected Checkmark */}
                            {selection.product === product.id && (
                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-2 shadow-lg">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                {selection.product && (
                    <div className="flex justify-center pt-6">
                        <button
                            onClick={handleNext}
                            className="px-10 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {t(translations.next)}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-12 bg-primary' : s < step ? 'w-8 bg-primary/50' : 'w-8 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Views */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                {step === 1 && renderConfigView()}
                {step === 2 && renderCategoryView()}
                {step === 3 && renderStyleView()}
            </div>
        </div>
    );
}
