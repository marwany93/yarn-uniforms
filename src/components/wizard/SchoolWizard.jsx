'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/context/CartContext';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    schoolProducts,
    productCategories,
    getProductsByCategory,
    getProductById
} from '@/data/schoolProducts';

export default function SchoolWizard() {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();

    // Contact information (collected once at start)
    const [contactInfo, setContactInfo] = useState({
        schoolName: '',
        contactPerson: '',
        email: '',
        phone: ''
    });
    const [contactInfoSubmitted, setContactInfoSubmitted] = useState(false);

    // Wizard Phase: 'SELECTION' or 'CUSTOMIZATION'
    const [wizardPhase, setWizardPhase] = useState('SELECTION');

    // Multi-Category Selection State
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    // Current item being customized
    const [currentProduct, setCurrentProduct] = useState(null);

    // Product details for current item
    const [details, setDetails] = useState({
        color: null,                  // Selected color ID (1-7 or 'custom')
        customColorName: '',          // For custom color option
        customColorUrl: null,         // Custom color sample upload URL
        customColorFileName: null,    // Custom color sample filename
        fabric: '',                   // Selected fabric type
        logoUrl: null,                // Logo download URL from Firebase Storage
        logoName: null,               // Logo filename for display
        referenceUrl: null,           // Additional reference upload URL
        referenceFileName: null,      // Reference filename
        notes: '',
        stage: 'kg_primary'
    });
    const [sizeQuantities, setSizeQuantities] = useState({});
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCustomColor, setIsUploadingCustomColor] = useState(false);
    const [isUploadingReference, setIsUploadingReference] = useState(false);

    // Success modal
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const translations = {
        // Contact Info
        contactInfo: { en: 'Contact Information', ar: 'معلومات الاتصال' },
        schoolName: { en: 'School Name', ar: 'اسم المدرسة' },
        schoolNamePlaceholder: { en: 'Enter school name', ar: 'أدخل اسم المدرسة' },
        contactPerson: { en: 'Contact Person', ar: 'شخص الاتصال' },
        contactPersonPlaceholder: { en: 'Enter your name', ar: 'أدخل اسمك' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        emailPlaceholder: { en: 'your.email@school.sa', ar: 'your.email@school.sa' },
        phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
        phonePlaceholder: { en: '+966 5X XXX XXXX', ar: '+966 5X XXX XXXX' },
        continue: { en: 'Continue to Catalog', ar: 'متابعة إلى الكتالوج' },
        fillAllFields: { en: 'Please fill all required fields', ar: 'يرجى ملء جميع الحقول المطلوبة' },

        // Selection Phase
        selectCategories: { en: 'Select Product Categories', ar: 'اختر فئات المنتجات' },
        selectMultipleHint: { en: 'Click to add/remove categories from your order', ar: 'انقر لإضافة/إزالة الفئات من طلبك' },
        selected: { en: 'Selected', ar: 'محدد' },
        startCustomizing: { en: 'Start Customizing', ar: 'بدء التخصيص' },
        items: { en: 'items', ar: 'منتج' },
        selectAtLeastOne: { en: 'Please select at least one category', ar: 'يرجى اختيار فئة واحدة على الأقل' },

        // Customization Phase
        customizingItem: { en: 'Customizing Item', ar: 'تخصيص المنتج' },
        of: { en: 'of', ar: 'من' },
        selectStyle: { en: 'Select Style', ar: 'اختر التصميم' },
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
        saveAndNext: { en: 'Save & Next Item ➡️', ar: '➡️ حفظ والتالي' },
        atLeastOne: { en: 'Please add at least one item', ar: 'يرجى إضافة قطعة واحدة على الأقل' },
        selectProduct: { en: 'Please select a product style', ar: 'يرجى اختيار نمط المنتج' },

        // Completion
        orderComplete: { en: 'Order Complete!', ar: 'اكتمل الطلب!' },
        allItemsAdded: { en: 'All items have been added to your cart', ar: 'تمت إضافة جميع العناصر إلى سلتك' },
        viewCart: { en: 'View Cart & Checkout', ar: 'عرض السلة والدفع' },
        startNewOrder: { en: 'Start New Order', ar: 'بدء طلب جديد' },

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

    // Color Options
    const colorOptions = [
        { id: 1, label: 'White', hex: '#FFFFFF', border: 'gray-300' },
        { id: 2, label: 'Green', hex: '#166534', border: 'transparent' },
        { id: 3, label: 'Orange', hex: '#F97316', border: 'transparent' },
        { id: 4, label: 'Yellow', hex: '#EAB308', border: 'transparent' },
        { id: 5, label: 'Blue', hex: '#2563EB', border: 'transparent' },
        { id: 6, label: 'Navy', hex: '#1E3A8A', border: 'transparent' },
        { id: 7, label: 'Red', hex: '#DC2626', border: 'transparent' },
        { id: 'custom', label: 'Custom Color', hex: 'rainbow', isCustom: true }
    ];

    // Fabric Options by Product Type
    const fabricOptions = {
        shirts: ['Poplin', 'Oxford', 'Dacron', 'Sundus'],
        blouses: ['Poplin', 'Oxford', 'Dacron', 'Sundus'],
        dresses: ['Gabardine (Mixed 65/35)', 'Gabardine (Wool Blend)'],
        skirts: ['Gabardine (Mixed 65/35)', 'Gabardine (Wool Blend)'],
        pants: ['Gabardine (Mixed 65/35)', 'Gabardine (Wool Blend)'],
        trousers: ['Gabardine (Mixed 65/35)', 'Gabardine (Wool Blend)'],
        polo: ['Pika (Lacoste)', 'Summer Milton'],
        sportswear: ['Scuba', 'Interlock', 'Summer Milton'],
        default: ['Cotton', 'Polyester', 'Cotton Blend']
    };

    // Get fabric options based on product type
    const getFabricOptions = () => {
        if (!currentProduct) return fabricOptions.default;

        const product = getProductById(currentProduct);
        if (!product) return fabricOptions.default;

        const productName = product.name.toLowerCase();

        if (productName.includes('shirt')) return fabricOptions.shirts;
        if (productName.includes('blouse')) return fabricOptions.blouses;
        if (productName.includes('dress')) return fabricOptions.dresses;
        if (productName.includes('skirt')) return fabricOptions.skirts;
        if (productName.includes('pant') || productName.includes('trouser')) return fabricOptions.pants;
        if (productName.includes('polo')) return fabricOptions.polo;
        if (productName.includes('sport')) return fabricOptions.sportswear;

        return fabricOptions.default;
    };

    // Size charts based on stage
    const sizeCharts = {
        kg_primary: ['4', '6', '8', '10', '12', '14'],
        prep_secondary: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    };

    // Calculate total items
    const totalItems = useMemo(() => {
        return Object.values(sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
    }, [sizeQuantities]);

    // Get current category being customized
    const getCurrentCategory = () => {
        if (wizardPhase !== 'CUSTOMIZATION' || selectedCategoryIds.length === 0) return null;
        return productCategories.find(cat => cat.id === selectedCategoryIds[currentCategoryIndex]);
    };

    // Check if contact form is valid
    const isContactFormValid = () => {
        return contactInfo.schoolName.trim() !== '' &&
            contactInfo.contactPerson.trim() !== '' &&
            contactInfo.email.trim() !== '' &&
            contactInfo.phone.trim() !== '';
    };

    const handleContinueToCatalog = () => {
        if (isContactFormValid()) {
            setContactInfoSubmitted(true);
        } else {
            alert(t(translations.fillAllFields));
        }
    };

    // Toggle category selection
    const handleCategoryToggle = (categoryId) => {
        setSelectedCategoryIds(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // Start customization phase
    const handleStartCustomizing = () => {
        if (selectedCategoryIds.length === 0) {
            alert(t(translations.selectAtLeastOne));
            return;
        }
        setWizardPhase('CUSTOMIZATION');
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setSizeQuantities({});
    };

    // Select product style
    const handleProductSelect = (productId) => {
        setCurrentProduct(productId);
    };

    const handleSizeQuantityChange = (size, value) => {
        const numValue = parseInt(value) || 0;
        setSizeQuantities(prev => ({
            ...prev,
            [size]: numValue > 0 ? numValue : 0
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setIsUploadingLogo(true);

        try {
            // Upload to Firebase Storage immediately
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);

            console.log('📤 Uploading logo to Firebase Storage...');
            await uploadBytes(storageRef, file);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);
            console.log('✅ Logo uploaded successfully:', downloadUrl);

            // Store URL and name (NOT the File object)
            setDetails({
                ...details,
                logoUrl: downloadUrl,
                logoName: file.name
            });
        } catch (error) {
            console.error('❌ Logo upload failed:', error);
            alert('Failed to upload logo. Please try again.');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleCustomColorUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setIsUploadingCustomColor(true);

        try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);

            console.log('📤 Uploading custom color sample...');
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            console.log('✅ Custom color uploaded:', downloadUrl);

            setDetails({
                ...details,
                customColorUrl: downloadUrl,
                customColorFileName: file.name
            });
        } catch (error) {
            console.error('❌ Custom color upload failed:', error);
            alert('Failed to upload color sample. Please try again.');
        } finally {
            setIsUploadingCustomColor(false);
        }
    };

    const handleReferenceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setIsUploadingReference(true);

        try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);

            console.log('📤 Uploading reference file...');
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            console.log('✅ Reference uploaded:', downloadUrl);

            setDetails({
                ...details,
                referenceUrl: downloadUrl,
                referenceFileName: file.name
            });
        } catch (error) {
            console.error('❌ Reference upload failed:', error);
            alert('Failed to upload reference. Please try again.');
        } finally {
            setIsUploadingReference(false);
        }
    };

    // Save current item and move to next
    const handleSaveAndNext = () => {
        console.log('🔵 handleSaveAndNext: Function called');
        console.log('🔍 Current product:', currentProduct);
        console.log('🔍 Total items:', totalItems);

        // Validation
        if (!currentProduct) {
            console.log('❌ Validation failed: No product selected');
            alert(t(translations.selectProduct));
            return;
        }

        // Color validation
        if (!details.color) {
            alert('Please select a color');
            return;
        }

        // Custom color validation
        if (details.color === 'custom' && !details.customColorName.trim()) {
            alert('Please specify the custom color name');
            return;
        }

        // Fabric validation
        if (!details.fabric) {
            alert('Please select a fabric type');
            return;
        }

        if (totalItems === 0) {
            console.log('❌ Validation failed: No items in size matrix');
            alert(t(translations.atLeastOne));
            return;
        }

        console.log('✅ Validation passed');

        const product = getProductById(currentProduct);
        console.log('📦 Product details:', product);

        // Create cart item
        const cartItem = {
            id: `${currentProduct}-${Date.now()}`,
            productId: currentProduct,
            productName: product.name,
            code: product.code,
            image: product.image,

            // --- ROOT-LEVEL FIELDS for Admin Dashboard Display ---
            fabric: details.fabric,
            selectedColor: details.color,
            customColorName: details.customColorName || null,
            customColorUrl: details.customColorUrl || null,
            referenceFileUrl: details.referenceUrl || null,
            // -----------------------------------------------------

            details: {
                color: details.color,
                customColorName: details.customColorName || null,
                customColorUrl: details.customColorUrl || null,
                customColorFileName: details.customColorFileName || null,
                fabric: details.fabric,
                stage: details.stage,
                sizes: Object.fromEntries(
                    Object.entries(sizeQuantities).filter(([_, qty]) => qty > 0)
                ),
                uploadedLogoUrl: details.logoUrl || null,
                logoName: details.logoName || null,
                referenceUrl: details.referenceUrl || null,
                referenceFileName: details.referenceFileName || null,
                notes: details.notes,
                contactInfo: contactInfo
            },
            quantity: totalItems,
            price: 0
        };

        console.log('🛒 Cart item constructed:', cartItem);
        console.log('🚀 Calling addToCart...');

        // Add to cart
        addToCart(cartItem);

        console.log('✅ addToCart called successfully');
        console.log('📊 Current category index:', currentCategoryIndex);
        console.log('📊 Total categories:', selectedCategoryIds.length);

        // Check if more items to customize
        if (currentCategoryIndex < selectedCategoryIds.length - 1) {
            console.log('➡️ Moving to next category');

            // Move to next category
            setCurrentCategoryIndex(prev => prev + 1);
            setCurrentProduct(null);
            setDetails({
                color: null,
                customColorName: '',
                customColorUrl: null,
                customColorFileName: null,
                fabric: '',
                logoUrl: null,
                logoName: null,
                referenceUrl: null,
                referenceFileName: null,
                notes: '',
                stage: 'kg_primary'
            });
            setSizeQuantities({});
        } else {
            console.log('🎉 All categories complete - showing completion modal');

            // All done - show completion modal
            setShowCompleteModal(true);
        }
    };

    // Back to selection from customization
    const handleBackToSelection = () => {
        setWizardPhase('SELECTION');
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setSizeQuantities({});
    };

    // Start new order
    const handleStartNewOrder = () => {
        setShowCompleteModal(false);
        setWizardPhase('SELECTION');
        setSelectedCategoryIds([]);
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setDetails({
            material: '100% Cotton',
            logo: null,
            notes: '',
            stage: 'kg_primary'
        });
        setSizeQuantities({});
    };

    // Contact Info Form
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

    // Phase 1: Multi-Category Selection Grid
    const renderSelectionPhase = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {t(translations.selectCategories)}
                </h2>
                <p className="text-gray-600">
                    {t(translations.selectMultipleHint)}
                </p>
                {selectedCategoryIds.length > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                        <span className="font-semibold text-primary">
                            {selectedCategoryIds.length} {t(translations.selected)}
                        </span>
                    </div>
                )}
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    const productsInCategory = getProductsByCategory(category.id);
                    const productCount = productsInCategory.length;

                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`group relative p-6 rounded-xl border-4 transition-all duration-300 ${isSelected
                                ? 'border-green-500 bg-green-50 shadow-xl scale-105'
                                : 'border-gray-300 hover:border-primary hover:shadow-lg bg-white'
                                }`}
                        >
                            {/* Selected Badge */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

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

            {/* Start Customizing Button */}
            <div className="flex justify-center pt-6">
                <button
                    onClick={handleStartCustomizing}
                    disabled={selectedCategoryIds.length === 0}
                    className={`px-10 py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${selectedCategoryIds.length > 0
                        ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {t(translations.startCustomizing)} ({selectedCategoryIds.length} {t(translations.items)})
                </button>
            </div>
        </div>
    );

    // Phase 2: Sequential Customization
    const renderCustomizationPhase = () => {
        const currentCategory = getCurrentCategory();
        if (!currentCategory) return null;

        const products = getProductsByCategory(currentCategory.id);
        const sizes = sizeCharts[details.stage] || [];

        // Determine if we're in style selection or details view
        const showStyleSelection = !currentProduct;

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={handleBackToSelection}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t(translations.back)}
                        </button>
                        <div className="text-sm opacity-90">
                            {t(translations.customizingItem)} {currentCategoryIndex + 1} {t(translations.of)} {selectedCategoryIds.length}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">
                        {language === 'ar' ? currentCategory.nameAr : currentCategory.name}
                    </h2>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${((currentCategoryIndex + 1) / selectedCategoryIds.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Style Selection */}
                {showStyleSelection && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {t(translations.selectStyle)}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductSelect(product.id)}
                                    className="group relative rounded-xl overflow-hidden border-4 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-4"
                                        />
                                    </div>
                                    <div className="p-3 bg-white">
                                        <div className="font-bold text-primary text-lg">{product.code}</div>
                                        <div className="text-sm text-gray-600">{product.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Details & Size Matrix */}
                {!showStyleSelection && (
                    <div className="space-y-6">
                        {/* Product Header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                    src={getProductById(currentProduct).image}
                                    alt={getProductById(currentProduct).name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <div className="font-bold text-2xl text-primary">{getProductById(currentProduct).code}</div>
                                <div className="text-gray-600">{getProductById(currentProduct).name}</div>
                            </div>
                            <button
                                onClick={() => setCurrentProduct(null)}
                                className="ml-auto text-sm text-primary hover:text-primary-700 font-semibold"
                            >
                                Change Style
                            </button>
                        </div>

                        {/* School Stage */}
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

                        {/* Color Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Color <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setDetails({
                                            ...details,
                                            color: color.id,
                                            // Reset custom fields if switching away from custom
                                            customColorName: color.id !== 'custom' ? '' : details.customColorName,
                                            customColorUrl: color.id !== 'custom' ? null : details.customColorUrl,
                                            customColorFileName: color.id !== 'custom' ? null : details.customColorFileName
                                        })}
                                        className={`relative p-4 rounded-lg border-2 transition-all ${details.color === color.id
                                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                                            : 'border-gray-300 hover:border-primary'
                                            }`}
                                    >
                                        {color.isCustom ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 mb-2"></div>
                                                <span className="text-xs font-medium">Custom</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-12 h-12 rounded-full border-2 border-${color.border} shadow-inner mb-2`}
                                                    style={{ backgroundColor: color.hex }}
                                                ></div>
                                                <span className="text-xs font-medium">{color.label}</span>
                                            </div>
                                        )}
                                        {details.color === color.id && (
                                            <div className="absolute top-2 right-2 text-primary">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Color Inputs - Conditional */}
                        {details.color === 'custom' && (
                            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg space-y-4">
                                <p className="text-sm font-semibold text-yellow-900">
                                    📝 Custom Color Details
                                </p>

                                {/* Color Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color Name/Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={details.customColorName}
                                        onChange={(e) => setDetails({ ...details, customColorName: e.target.value })}
                                        placeholder="e.g., Burgundy, Pantone 19-1764, #8B0000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Color Sample Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Color Sample/Image (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCustomColorUpload}
                                        disabled={isUploadingCustomColor}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    {isUploadingCustomColor && (
                                        <p className="mt-2 text-sm text-blue-600">⏳ Uploading color sample...</p>
                                    )}
                                    {details.customColorFileName && !isUploadingCustomColor && (
                                        <p className="mt-2 text-sm text-green-600">✓ {details.customColorFileName}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Fabric Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Fabric Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={details.fabric}
                                onChange={(e) => setDetails({ ...details, fabric: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select fabric...</option>
                                {getFabricOptions().map(fabric => (
                                    <option key={fabric} value={fabric}>{fabric}</option>
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
                                disabled={isUploadingLogo}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {isUploadingLogo && (
                                <p className="mt-2 text-sm text-blue-600">⏳ Uploading logo...</p>
                            )}
                            {details.logoName && !isUploadingLogo && (
                                <p className="mt-2 text-sm text-green-600">✓ {details.logoName}</p>
                            )}
                        </div>

                        {/* Additional Reference Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Reference <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-2">
                                Upload any extra design ideas, specifications, or reference images
                            </p>
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleReferenceUpload}
                                disabled={isUploadingReference}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {isUploadingReference && (
                                <p className="mt-2 text-sm text-blue-600">⏳ Uploading reference...</p>
                            )}
                            {details.referenceFileName && !isUploadingReference && (
                                <p className="mt-2 text-sm text-green-600">✓ {details.referenceFileName}</p>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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

                        {/* Save & Next Button */}
                        <button
                            onClick={handleSaveAndNext}
                            disabled={totalItems === 0}
                            className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${totalItems > 0
                                ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {t(translations.saveAndNext)}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Order Complete Modal
    const renderCompleteModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {t(translations.orderComplete)}
                </h3>
                <p className="text-gray-600 mb-6">
                    {t(translations.allItemsAdded)}
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            setShowCompleteModal(false);
                            window.location.href = '/cart';
                        }}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                    >
                        {t(translations.viewCart)}
                    </button>
                    <button
                        onClick={handleStartNewOrder}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                        {t(translations.startNewOrder)}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                {/* Contact Info Step */}
                {!contactInfoSubmitted && renderContactInfoStep()}

                {/* Selection Phase */}
                {contactInfoSubmitted && wizardPhase === 'SELECTION' && renderSelectionPhase()}

                {/* Customization Phase */}
                {contactInfoSubmitted && wizardPhase === 'CUSTOMIZATION' && renderCustomizationPhase()}
            </div>

            {/* Complete Modal */}
            {showCompleteModal && renderCompleteModal()}
        </div>
    );
}
