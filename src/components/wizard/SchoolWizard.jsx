'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/context/CartContext';
import {
    schoolProducts,
    productCategories,
    getProductsByCategory,
    getProductById
} from '@/data/schoolProducts';

export default function SchoolWizard() {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();

    // Step 0: Contact Info, Step 1: Category Grid, Step 2: Styles, Step 3: Details
    const [step, setStep] = useState(0);

    // Contact information (Step 0)
    const [contactInfo, setContactInfo] = useState({
        schoolName: '',
        contactPerson: '',
        email: '',
        phone: ''
    });

    // Product selection state
    const [selection, setSelection] = useState({
        category: null,
        product: null
    });

    // Product details state (Step 3)
    const [details, setDetails] = useState({
        material: '100% Cotton',
        logo: null,
        notes: '',
        stage: 'kg_primary' // Default stage for size matrix
    });
    const [sizeQuantities, setSizeQuantities] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const translations = {
        // Step 0: Contact Info
        contactInfo: { en: 'Contact Information', ar: 'معلومات الاتصال' },
        schoolName: { en: 'School Name', ar: 'اسم المدرسة' },
        schoolNamePlaceholder: { en: 'Enter school name', ar: 'أدخل اسم المدرسة' },
        contactPerson: { en: 'Contact Person', ar: 'شخص الاتصال' },
        contactPersonPlaceholder: { en: 'Enter your name', ar: 'أدخل اسمك' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        emailPlaceholder: { en: 'your.email@school.sa', ar: 'your.email@school.sa' },
        phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
        phonePlaceholder: { en: '+966 5X XXX XXXX', ar: '+966 5X XXX XXXX' },
        required: { en: 'Required', ar: 'مطلوب' },
        continue: { en: 'Continue to Catalog', ar: 'متابعة إلى الكتالوج' },
        fillAllFields: { en: 'Please fill all required fields', ar: 'يرجى ملء جميع الحقول المطلوبة' },

        // Step 1: Category Grid
        selectCategory: { en: 'Select Product Category', ar: 'اختر فئة المنتج' },
        catalogMenu: { en: 'Product Catalog', ar: 'كتالوج المنتجات' },

        // Step 2: Styles
        selectStyle: { en: 'Select Style', ar: 'اختر التصميم' },

        // Step 3: Details
        productDetails: { en: 'Product Details', ar: 'تفاصيل المنتج' },
        material: { en: 'Material', ar: 'الخامة' },
        uploadLogo: { en: 'Upload School Logo', ar: 'رفع شعار المدرسة' },
        optionalLogo: { en: 'Optional', ar: 'اختياري' },
        specialInstructions: { en: 'Special Instructions', ar: 'تعليمات خاصة' },
        notesPlaceholder: { en: 'e.g., embroidery placement, special requirements...', ar: 'مثال: موضع التطريز، متطلبات خاصة...' },
        schoolStage: { en: 'School Stage', ar: 'المرحلة الدراسية' },
        kgPrimary: { en: 'KG & Primary', ar: 'روضة وابتدائي' },
        prepSecondary: { en: 'Prep & Secondary', ar: 'إعدادي وثانوي' },
        sizeMatrix: { en: 'Size & Quantity', ar: 'المقاسات والكميات' },
        totalItems: { en: 'Total Items', ar: 'إجمالي القطع' },
        addToCart: { en: 'Add to Cart 🛒', ar: 'إضافة للسلة 🛒' },
        atLeastOne: { en: 'Please add at least one item', ar: 'يرجى إضافة قطعة واحدة على الأقل' },
        addedToCart: { en: 'Added to Cart!', ar: 'تمت الإضافة للسلة!' },
        addAnother: { en: 'Add another item?', ar: 'إضافة منتج آخر؟' },
        yes: { en: 'Yes, Add More', ar: 'نعم، إضافة المزيد' },
        viewCart: { en: 'View Cart', ar: 'عرض السلة' },

        // Navigation
        back: { en: 'Back', ar: 'رجوع' },
        next: { en: 'Next', ar: 'التالي' },
    };

    // Material options
    const materialOptions = [
        '100% Cotton',
        'Polyester Blend',
        'Heavy Duty Gabardine'
    ];

    // Size charts based on stage
    const sizeCharts = {
        kg_primary: ['4', '6', '8', '10', '12', '14'],
        prep_secondary: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    };

    // Calculate total items
    const totalItems = useMemo(() => {
        return Object.values(sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
    }, [sizeQuantities]);

    // Check if contact form is valid
    const isContactFormValid = () => {
        return contactInfo.schoolName.trim() !== '' &&
            contactInfo.contactPerson.trim() !== '' &&
            contactInfo.email.trim() !== '' &&
            contactInfo.phone.trim() !== '';
    };

    const handleContinueToCatalog = () => {
        if (isContactFormValid()) {
            setStep(1);
        } else {
            alert(t(translations.fillAllFields));
        }
    };

    const handleCategorySelect = (categoryId) => {
        setSelection({ category: categoryId, product: null });
        setStep(2);
    };

    const handleProductSelect = (productId) => {
        setSelection({ ...selection, product: productId });
    };

    const handleNext = () => {
        setStep(3);
        setSizeQuantities({});
    };

    const handleSizeQuantityChange = (size, value) => {
        const numValue = parseInt(value) || 0;
        setSizeQuantities(prev => ({
            ...prev,
            [size]: numValue > 0 ? numValue : 0
        }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDetails({ ...details, logo: file });
        }
    };

    const handleAddToCart = () => {
        if (totalItems === 0) {
            alert(t(translations.atLeastOne));
            return;
        }

        const product = getProductById(selection.product);

        const cartItem = {
            id: `${selection.product}-${Date.now()}`,
            productId: selection.product,
            productName: product.name,
            code: product.code,
            image: product.image,
            details: {
                material: details.material,
                stage: details.stage,
                sizes: Object.fromEntries(
                    Object.entries(sizeQuantities).filter(([_, qty]) => qty > 0)
                ),
                logo: details.logo?.name || null,
                notes: details.notes,
                // Include contact info in cart item
                contactInfo: contactInfo
            },
            quantity: totalItems,
            price: 0
        };

        addToCart(cartItem);
        setShowSuccess(true);
    };

    const handleAddAnother = () => {
        // Reset to category grid (Step 1)
        setStep(1);
        setSelection({ category: null, product: null });
        setDetails({ material: '100% Cotton', logo: null, notes: '', stage: 'kg_primary' });
        setSizeQuantities({});
        setShowSuccess(false);
    };

    // Step 0: Contact Info Form
    const renderContactInfoStep = () => (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-4xl mb-4">
                    📝
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {t(translations.contactInfo)}
                </h2>
                <p className="text-gray-600">
                    {language === 'ar'
                        ? 'يرجى تقديم معلومات المدرسة الخاصة بك لبدء عملية الطلب'
                        : 'Please provide your school information to begin the ordering process'
                    }
                </p>
            </div>

            {/* School Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.schoolName)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.schoolName}
                    onChange={(e) => setContactInfo({ ...contactInfo, schoolName: e.target.value })}
                    placeholder={t(translations.schoolNamePlaceholder)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {/* Contact Person */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.contactPerson)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.contactPerson}
                    onChange={(e) => setContactInfo({ ...contactInfo, contactPerson: e.target.value })}
                    placeholder={t(translations.contactPersonPlaceholder)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.email)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder={t(translations.emailPlaceholder)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.phone)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder={t(translations.phonePlaceholder)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {/* Continue Button */}
            <button
                onClick={handleContinueToCatalog}
                disabled={!isContactFormValid()}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${isContactFormValid()
                        ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {t(translations.continue)}
            </button>
        </div>
    );

    // Step 1: Category Grid (The Menu)
    const renderCategoryGrid = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {t(translations.catalogMenu)}
                </h2>
                <p className="text-gray-600">
                    {language === 'ar'
                        ? 'اختر فئة المنتج لعرض الأنماط المتاحة'
                        : 'Select a product category to view available styles'
                    }
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => {
                    const productsInCategory = getProductsByCategory(category.id);
                    const productCount = productsInCategory.length;

                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className="group p-6 rounded-xl border-2 border-gray-300 hover:border-primary hover:shadow-xl transition-all duration-300 bg-white"
                        >
                            <div className="text-5xl mb-3">{category.icon}</div>
                            <div className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ar' ? category.nameAr : category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {productCount} {language === 'ar' ? 'منتج' : 'items'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // Step 2: Style Selection
    const renderStyleView = () => {
        const products = getProductsByCategory(selection.category);
        const selectedCategory = productCategories.find(c => c.id === selection.category);

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

    // Step 3: Details & Customization
    const renderDetailsView = () => {
        const product = getProductById(selection.product);
        const sizes = sizeCharts[details.stage] || [];

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
                        {t(translations.productDetails)}
                    </h2>
                    <div className="w-20"></div>
                </div>

                {/* Product Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <div className="font-bold text-2xl text-primary">{product.code}</div>
                        <div className="text-gray-600">{product.name}</div>
                    </div>
                </div>

                {/* School Stage Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t(translations.schoolStage)}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setDetails({ ...details, stage: 'kg_primary' })}
                            className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'kg_primary'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            <div className="text-2xl mb-2">🎒</div>
                            <div className="font-semibold">{t(translations.kgPrimary)}</div>
                        </button>
                        <button
                            onClick={() => setDetails({ ...details, stage: 'prep_secondary' })}
                            className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'prep_secondary'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            <div className="text-2xl mb-2">🎓</div>
                            <div className="font-semibold">{t(translations.prepSecondary)}</div>
                        </button>
                    </div>
                </div>

                {/* Material Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t(translations.material)}
                    </label>
                    <select
                        value={details.material}
                        onChange={(e) => setDetails({ ...details, material: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        {materialOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t(translations.uploadLogo)} <span className="text-gray-400 font-normal">({t(translations.optionalLogo)})</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {details.logo && (
                        <p className="mt-2 text-sm text-green-600">✓ {details.logo.name}</p>
                    )}
                </div>

                {/* Special Instructions */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t(translations.specialInstructions)}
                    </label>
                    <textarea
                        value={details.notes}
                        onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                        placeholder={t(translations.notesPlaceholder)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>

                {/* Size Matrix */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {t(translations.sizeMatrix)}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-h-96 overflow-y-auto">
                        {sizes.map(size => (
                            <div key={size} className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1 text-center">
                                    {size}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={sizeQuantities[size] || ''}
                                    onChange={(e) => handleSizeQuantityChange(size, e.target.value)}
                                    placeholder="0"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Items */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
                    <span className="text-lg font-bold text-gray-900">
                        {t(translations.totalItems)}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                        {totalItems}
                    </span>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={totalItems === 0}
                    className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${totalItems > 0
                            ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {t(translations.addToCart)}
                </button>
            </div>
        );
    };

    // Success Modal
    const renderSuccessModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t(translations.addedToCart)}
                </h3>
                <p className="text-gray-600 mb-6">
                    {t(translations.addAnother)}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleAddAnother}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                    >
                        {t(translations.yes)}
                    </button>
                    <button
                        onClick={() => {
                            setShowSuccess(false);
                            window.location.href = '/cart';
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                        {t(translations.viewCart)}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Progress Indicator */}
            {step > 0 && (
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
            )}

            {/* Views */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                {step === 0 && renderContactInfoStep()}
                {step === 1 && renderCategoryGrid()}
                {step === 2 && renderStyleView()}
                {step === 3 && renderDetailsView()}
            </div>

            {/* Success Modal */}
            {showSuccess && renderSuccessModal()}
        </div>
    );
}
