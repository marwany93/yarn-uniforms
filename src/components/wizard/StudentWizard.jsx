'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
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
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Ruler } from 'lucide-react';
import SizingWizard from './SizingWizard';

export default function StudentWizard() {
    const { t, language } = useLanguage();
    const { addToCart, cart, updateCartItem } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('editId');

    // Contact information (collected once at start)
    const [contactInfo, setContactInfo] = useState({
        studentName: '',
        schoolName: '',
        parentName: '',
        email: '',
        phone: ''
    });
    const [contactInfoSubmitted, setContactInfoSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [missingFields, setMissingFields] = useState([]);

    const clearMissingField = (field) => {
        setMissingFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : prev);
    };

    // Wizard Phase: 'SELECTION' or 'CUSTOMIZATION'
    const [wizardPhase, setWizardPhase] = useState('SELECTION');

    // Multi-Category Selection State
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    // Current item being customized
    const [currentProduct, setCurrentProduct] = useState(null);
    const [showSizingWizard, setShowSizingWizard] = useState(false);

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
        stage: 'kg_primary',
        logoType: null,
        logoPlacement: null
    });
    const [sizeQuantities, setSizeQuantities] = useState({});
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCustomColor, setIsUploadingCustomColor] = useState(false);
    const [isUploadingReference, setIsUploadingReference] = useState(false);

    // Scroll to top ref for auto-scroll on step change
    const wizardTopRef = useRef(null);

    // Success modal heading ref for focus-shift scroll fix
    const successHeadingRef = useRef(null);

    const fabricTranslations = {
        'Poplin': { en: 'Poplin', ar: 'بوبلين' },
        'Oxford': { en: 'Oxford', ar: 'أكسفورد' },
        'Dacron': { en: 'Dacron', ar: 'داكرون' },
        'Sundus': { en: 'Sundus', ar: 'سندس' },
        'Gabardine (Mixed 65/35)': { en: 'Gabardine (Mixed 65/35)', ar: 'جاباردين (مخلوط 65/35)' },
        'Gabardine (Wool Blend)': { en: 'Gabardine (Wool Blend)', ar: 'جاباردين (صوف مخلوط)' },
        'Pika (Lacoste)': { en: 'Pika (Lacoste)', ar: 'بيكا (لاكوست)' },
        'Summer Milton': { en: 'Summer Milton', ar: 'ميلتون صيفي' },
        'Scuba': { en: 'Scuba', ar: 'سكوبا' },
        'Interlock': { en: 'Interlock', ar: 'انترلوك' },
        'Cotton': { en: 'Cotton', ar: 'قطن' },
        'Polyester': { en: 'Polyester', ar: 'بوليستر' },
        'Cotton Blend': { en: 'Cotton Blend', ar: 'قطن مخلوط' },
        'Heavy Duty Gabardine': { en: 'Heavy Duty Gabardine', ar: 'جاباردين خدمة شاقة' },
        '100% Cotton': { en: '100% Cotton', ar: 'قطن 100%' },
        'Polyester Blend': { en: 'Polyester Blend', ar: 'بوليستر مخلوط' }
    };

    const translations = {
        // Contact Info
        contactInfo: { en: 'Student Information', ar: 'بيانات الطالب' },
        studentName: { en: 'Student Name', ar: 'اسم الطالب' },
        studentNamePlaceholder: { en: 'Enter student name', ar: 'أدخل اسم الطالب' },
        schoolName: { en: 'School Name', ar: 'اسم المدرسة' },
        schoolNamePlaceholder: { en: "Enter student's school name", ar: 'أدخل اسم مدرسة الطالب' },
        parentName: { en: 'Parent/Guardian Name', ar: 'اسم ولي الأمر' },
        parentNamePlaceholder: { en: 'Enter your name', ar: 'أدخل اسمك' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        emailPlaceholder: { en: 'your.email@example.com', ar: 'your.email@example.com' },
        phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
        phonePlaceholder: { en: '+966 5X XXX XXXX', ar: '+966 5X XXX XXXX' },
        continue: { en: 'Start Designing', ar: 'ابدأ التصميم' },

        // Selection Phase
        selectCategories: { en: 'What do you need?', ar: 'ماذا تحتاج؟' },
        selectMultipleHint: { en: 'Select the items you want to order for your child', ar: 'اختر القطع التي تريد طلبها لابنك/ابنتك' },
        selected: { en: 'Selected', ar: 'محدد' },
        startCustomizing: { en: 'Customize Uniform', ar: 'تخصيص الزي' },
        items: { en: 'items', ar: 'منتج' },
        selectAtLeastOne: { en: 'Please select at least one item', ar: 'يرجى اختيار قطعة واحدة على الأقل' },

        // Customization Phase
        customizingItem: { en: 'Designing Item', ar: 'تصميم القطعة' },
        of: { en: 'of', ar: 'من' },
        selectStyle: { en: 'Select Style', ar: 'اختر التصميم' },
        productDetails: { en: 'Make it Yours', ar: 'اجعله مميزاً' },
        material: { en: 'Fabric', ar: 'الخامة' },
        uploadLogo: { en: 'School Logo (Optional)', ar: 'شعار المدرسة (اختياري)' },
        optionalLogo: { en: 'If you have it', ar: 'إن وجد' },
        specialInstructions: { en: 'Special Notes', ar: 'ملاحظات خاصة' },
        notesPlaceholder: { en: 'e.g., Make it slightly looser...', ar: 'مثال: اجعله واسعاً قليلاً...' },
        schoolStage: { en: 'School Stage', ar: 'المرحلة الدراسية' },
        middleSchool: { en: 'Middle School', ar: 'متوسط' },
        highSchool: { en: 'High School', ar: 'ثانوي' },
        sizeMatrix: { en: 'Select Sizes', ar: 'اختر المقاسات' },
        totalItems: { en: 'Total Pieces', ar: 'إجمالي القطع' },
        saveAndNext: { en: 'Add & Next ➡️', ar: '➡️ إضافة والتالي' },
        atLeastOne: { en: 'Please add at least one item', ar: 'يرجى إضافة قطعة واحدة على الأقل' },
        selectProduct: { en: 'Please select a style', ar: 'يرجى اختيار تصميم' },

        // Completion
        orderComplete: { en: 'Awesome!', ar: 'رائع!' },
        allItemsAdded: { en: 'Your items are ready in the cart', ar: 'تمت إضافة القطع إلى السلة' },
        viewCart: { en: 'View Cart & Checkout', ar: 'عرض السلة والدفع' },
        startNewOrder: { en: 'Design Another Uniform', ar: 'تصميم زي آخر' },

        // Navigation
        back: { en: 'Back', ar: 'رجوع' },
        changeStyle: { en: 'Change Style', ar: 'تغيير التصميم' },
        next: { en: 'Next', ar: 'التالي' },
        selectColor: { en: 'Select Color', ar: 'اختر اللون' },
        fabricType: { en: 'Fabric Type', ar: 'نوع القماش' },
        selectFabricPlaceholder: { en: 'Select fabric...', ar: 'اختر الخامة...' },
        additionalRef: { en: 'Additional Reference', ar: 'مرجع إضافي' },
        uploadRefDesc: { en: 'Upload any extra design ideas or images', ar: 'ارفع أي أفكار أو صور إضافية' },
        custom: { en: 'Custom', ar: 'مخصص' },
        logoType: { en: 'Logo Type', ar: 'نوع الشعار' },
        logoPlacement: { en: 'Logo Placement', ar: 'مكان الشعار' },
        embroidery: { en: 'Embroidery', ar: 'تطريز' },
        printing: { en: 'Printing', ar: 'طباعة' },
        wovenPatch: { en: 'Woven Patch', ar: 'حياكة' },
        chest: { en: 'Chest', ar: 'الصدر' },
        shoulder: { en: 'Shoulder', ar: 'الكتف' },
        logoBack: { en: 'Back', ar: 'الظهر' },
    };

    useEffect(() => {
        // 1. Load Contact Info from Session Storage
        const savedContact = sessionStorage.getItem('studentContactInfo');
        if (savedContact) {
            try {
                setContactInfo(JSON.parse(savedContact));

                if (cart.length > 0) {
                    setContactInfoSubmitted(true);
                }
            } catch (e) {
                console.error('Error parsing session contact info', e);
            }
        }

        // 2. Load Selected Categories
        const savedCategories = sessionStorage.getItem('studentSelectedCategoryIds');
        if (savedCategories) {
            try {
                setSelectedCategoryIds(JSON.parse(savedCategories));
            } catch (e) {
                console.error('Error parsing session categories', e);
            }
        }

        // 3. Load Item for Editing if editId exists
        if (editId) {
            const itemToEdit = cart.find(item => item.id === editId);
            if (itemToEdit) {
                setWizardPhase('CUSTOMIZATION');

                // Set Categories (find category of product)
                const product = getProductById(itemToEdit.productId);
                if (product) {
                    setSelectedCategoryIds([product.category]);
                    setCurrentProduct(itemToEdit.productId);
                }

                // Restore Details
                setDetails(itemToEdit.details);
                setSizeQuantities(itemToEdit.details.sizes || {});
            }
        }
    }, [editId, cart]);

    // Persist Selected Categories whenever they change
    useEffect(() => {
        if (selectedCategoryIds.length > 0) {
            sessionStorage.setItem('studentSelectedCategoryIds', JSON.stringify(selectedCategoryIds));
        }
    }, [selectedCategoryIds]);

    // Auto-scroll logic with "Scroller Hunter"
    useEffect(() => {
        const timer = setTimeout(() => {
            if (wizardPhase === 'COMPLETED') {
                window.scrollTo({ top: 0, behavior: 'auto' });
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;

                setTimeout(() => {
                    if (successHeadingRef.current) {
                        successHeadingRef.current.focus({ preventScroll: true });
                    }
                }, 100);

            } else if (wizardTopRef.current && wizardPhase === 'CUSTOMIZATION') {
                wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentCategoryIndex, wizardPhase]);

    // Material options - (Same as SchoolWizard)
    const materialOptions = [
        '100% Cotton',
        'Polyester Blend',
        'Heavy Duty Gabardine'
    ];

    // Color Options - (Same as SchoolWizard)
    const colorOptions = [
        { id: 1, label: { en: 'White', ar: 'أبيض' }, hex: '#FFFFFF', border: 'gray-300' },
        { id: 2, label: { en: 'Green', ar: 'أخضر' }, hex: '#166534', border: 'transparent' },
        { id: 3, label: { en: 'Orange', ar: 'برتقالي' }, hex: '#F97316', border: 'transparent' },
        { id: 4, label: { en: 'Yellow', ar: 'أصفر' }, hex: '#EAB308', border: 'transparent' },
        { id: 5, label: { en: 'Blue', ar: 'أزرق' }, hex: '#2563EB', border: 'transparent' },
        { id: 6, label: { en: 'Navy', ar: 'كحلي' }, hex: '#1E3A8A', border: 'transparent' },
        { id: 7, label: { en: 'Red', ar: 'أحمر' }, hex: '#DC2626', border: 'transparent' },
        { id: 'custom', label: { en: 'Custom Color', ar: 'لون مخصص' }, hex: 'rainbow', isCustom: true }
    ];

    // Fabric Options by Product Type - (Same as SchoolWizard)
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
        prep_secondary: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        high_school: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    };

    const totalItems = useMemo(() => {
        return Object.values(sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
    }, [sizeQuantities]);

    const getCurrentCategory = () => {
        if (wizardPhase !== 'CUSTOMIZATION' || selectedCategoryIds.length === 0) return null;
        return productCategories.find(cat => cat.id === selectedCategoryIds[currentCategoryIndex]);
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!contactInfo.studentName.trim()) errors.studentName = t({ en: 'Student Name is required', ar: 'اسم الطالب مطلوب' });
        if (!contactInfo.schoolName.trim()) errors.schoolName = t({ en: 'School Name is required', ar: 'اسم المدرسة مطلوب' });
        if (!contactInfo.parentName.trim()) errors.parentName = t({ en: 'Parent Name is required', ar: 'اسم ولي الأمر مطلوب' });

        if (!contactInfo.email) {
            errors.email = t({ en: 'Email is required', ar: 'البريد الإلكتروني مطلوب' });
        } else if (!emailRegex.test(contactInfo.email)) {
            errors.email = t({ en: 'Invalid email format', ar: 'صيغة البريد الإلكتروني غير صحيحة' });
        }

        if (!contactInfo.phone) {
            errors.phone = t({ en: 'Phone number is required', ar: 'رقم الهاتف مطلوب' });
        } else if (contactInfo.phone.length < 10) {
            errors.phone = t({ en: 'Invalid phone number', ar: 'رقم الهاتف غير صحيح' });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToCatalog = () => {
        if (validateForm()) {
            sessionStorage.setItem('studentContactInfo', JSON.stringify(contactInfo));
            setContactInfoSubmitted(true);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategoryIds(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleStartCustomizing = () => {
        if (selectedCategoryIds.length === 0) {
            setAlertMessage(t(translations.selectAtLeastOne));
            return;
        }
        setWizardPhase('CUSTOMIZATION');
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setSizeQuantities({});
    };

    const handleProductSelect = (productId) => {
        setCurrentProduct(productId);
    };

    const updateQuantity = (size, newValue) => {
        let val = parseInt(newValue);
        if (isNaN(val) || val < 0) val = 0;
        if (val > 999) val = 999;
        setSizeQuantities(prev => ({ ...prev, [size]: val }));
        clearMissingField('sizes'); // Clear error highlight dynamically
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setAlertMessage(language === 'ar' ? 'يجب أن يكون حجم الملف أقل من 10 ميجابايت' : 'File size must be less than 10MB');
            return;
        }
        setIsUploadingLogo(true);
        try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            setDetails({ ...details, logoUrl: downloadUrl, logoName: file.name });
        } catch (error) {
            console.error('❌ Logo upload failed:', error);
            setAlertMessage(language === 'ar' ? 'فشل رفع الشعار. يرجى المحاولة مرة أخرى.' : 'Failed to upload logo. Please try again.');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleCustomColorUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return;
        setIsUploadingCustomColor(true);
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            setDetails({ ...details, customColorUrl: downloadUrl, customColorFileName: file.name });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploadingCustomColor(false);
        }
    };

    const handleReferenceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return;
        setIsUploadingReference(true);
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `temp_uploads/${fileName}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            setDetails({ ...details, referenceUrl: downloadUrl, referenceFileName: file.name });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploadingReference(false);
        }
    };

    const handleSaveAndNext = () => {
        const errors = [];
        const missing = [];

        if (!currentProduct) {
            errors.push(t(translations.selectProduct));
            missing.push('product');
        }
        if (!details.color) {
            errors.push(t({ en: 'Please select a color', ar: 'يرجى اختيار لون' }));
            missing.push('color');
        } else if (details.color === 'custom' && !details.customColorName.trim()) {
            errors.push(t({ en: 'Please specify the custom color name', ar: 'يرجى تحديد اسم اللون المخصص' }));
            missing.push('customColorName');
        }
        if (!details.logoType) {
            errors.push(t({ en: 'Please select logo type', ar: 'يرجى اختيار نوع الشعار' }));
            missing.push('logoType');
        }
        if (!details.logoPlacement) {
            errors.push(t({ en: 'Please select logo placement', ar: 'يرجى اختيار مكان الشعار' }));
            missing.push('logoPlacement');
        }
        if (!details.fabric) {
            errors.push(t({ en: 'Please select a fabric type', ar: 'يرجى اختيار نوع القماش' }));
            missing.push('fabric');
        }
        if (totalItems === 0) {
            errors.push(t(translations.atLeastOne));
            missing.push('sizes');
        }

        if (errors.length > 0) {
            setAlertMessage(errors);
            setMissingFields(missing);
            return;
        }

        setMissingFields([]); // Clear highlights on success

        const product = getProductById(currentProduct);

        const cartItem = {
            id: `${currentProduct}-${Date.now()}`,
            productId: currentProduct,
            productName: product.name,
            productNameAr: product.nameAr,
            code: product.code,
            image: product.image,
            // Critical Sector Tagging for B2C Logic
            sector: 'students',
            sectorAr: 'أفراد (طلاب)',
            fabric: details.fabric,
            fabricAr: fabricTranslations[details.fabric]?.ar || details.fabric,
            selectedColor: details.color,
            customColorName: details.customColorName || null,
            customColorUrl: details.customColorUrl || null,
            referenceFileUrl: details.referenceUrl || null,
            logoType: details.logoType,
            logoPlacement: details.logoPlacement,
            details: {
                color: details.color,
                nameAr: product.nameAr,
                customColorName: details.customColorName || null,
                customColorUrl: details.customColorUrl || null,
                customColorFileName: details.customColorFileName || null,
                fabric: details.fabric,
                fabricAr: fabricTranslations[details.fabric]?.ar || details.fabric,
                stage: details.stage,
                logoType: details.logoType,
                logoPlacement: details.logoPlacement,
                sizes: Object.fromEntries(
                    Object.entries(sizeQuantities).filter(([_, qty]) => qty > 0)
                ),
                uploadedLogoUrl: details.logoUrl || null,
                logoName: details.logoName || null,
                referenceUrl: details.referenceUrl || null,
                referenceFileName: details.referenceFileName || null,
                notes: details.notes,
                contactInfo: contactInfo,
                isStudentOrder: true // Mark as student order
            },
            quantity: totalItems,
            price: 0
        };

        if (editId) {
            updateCartItem(editId, cartItem);
            router.push('/cart');
            return;
        }

        addToCart(cartItem);

        if (currentCategoryIndex < selectedCategoryIds.length - 1) {
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
                stage: 'kg_primary',
                logoType: null,
                logoPlacement: null
            });
            setSizeQuantities({});
        } else {
            setWizardPhase('COMPLETED');
        }
    };

    const handleBackToSelection = () => {
        if (currentProduct) {
            setCurrentProduct(null);
            return;
        }
        if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(prev => prev - 1);
            setCurrentProduct(null);
            return;
        }
        setWizardPhase('SELECTION');
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setSizeQuantities({});
    };

    const handleStartNewOrder = () => {
        sessionStorage.removeItem('studentSelectedCategoryIds');
        setWizardPhase('SELECTION');
        setSelectedCategoryIds([]);
        setCurrentCategoryIndex(0);
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
            stage: 'kg_primary',
            logoType: null,
            logoPlacement: null
        });
        setSizeQuantities({});
    };

    // Render Methods
    const renderContactInfoStep = () => (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-4xl mb-4">
                    👋
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {t(translations.contactInfo)}
                </h2>
                <p className="text-gray-600">
                    {language === 'ar'
                        ? 'أهلاً بك! لنبدأ بتسجيل بيانات الطالب والمدرسة'
                        : 'Welcome! Let\'s start with the student and school details'
                    }
                </p>
            </div>

            {/* Student Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.studentName)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.studentName}
                    onChange={(e) => {
                        setContactInfo({ ...contactInfo, studentName: e.target.value });
                        if (formErrors.studentName) setFormErrors({ ...formErrors, studentName: null });
                    }}
                    placeholder={t(translations.studentNamePlaceholder)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${formErrors.studentName
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-primary'
                        }`}
                />
                {formErrors.studentName && <p className="text-red-500 text-sm mt-1">{formErrors.studentName}</p>}
            </div>

            {/* School Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.schoolName)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.schoolName}
                    onChange={(e) => {
                        setContactInfo({ ...contactInfo, schoolName: e.target.value });
                        if (formErrors.schoolName) setFormErrors({ ...formErrors, schoolName: null });
                    }}
                    placeholder={t(translations.schoolNamePlaceholder)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${formErrors.schoolName
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-primary'
                        }`}
                />
                {formErrors.schoolName && <p className="text-red-500 text-sm mt-1">{formErrors.schoolName}</p>}
            </div>

            {/* Parent Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.parentName)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.parentName}
                    onChange={(e) => {
                        setContactInfo({ ...contactInfo, parentName: e.target.value });
                        if (formErrors.parentName) setFormErrors({ ...formErrors, parentName: null });
                    }}
                    placeholder={t(translations.parentNamePlaceholder)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${formErrors.parentName
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-primary'
                        }`}
                />
                {formErrors.parentName && <p className="text-red-500 text-sm mt-1">{formErrors.parentName}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.email)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => {
                        setContactInfo({ ...contactInfo, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                    }}
                    placeholder={t(translations.emailPlaceholder)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${formErrors.email
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-primary'
                        }`}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.phone)} <span className="text-red-500">*</span>
                </label>
                <div className="flex direction-ltr" style={{ direction: 'ltr' }}>
                    <div className={`phone-input-wrapper w-full px-4 py-3 border rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all ${formErrors.phone ? 'border-red-500 focus-within:ring-red-200' : 'border-gray-300'}`} style={{ direction: 'ltr' }}>
                        <PhoneInput
                            international
                            defaultCountry="SA"
                            countryCallingCodeEditable={false}
                            value={contactInfo.phone}
                            onChange={(val) => {
                                setContactInfo({ ...contactInfo, phone: val });
                                if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                            }}
                            className="flex items-center gap-3"
                            numberInputProps={{
                                className: "w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 focus:ring-0 border-none p-0"
                            }}
                        />
                    </div>
                    {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1 text-right" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                            {formErrors.phone}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={handleContinueToCatalog}
                className="w-full py-4 mt-6 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 bg-primary text-white hover:bg-primary-700 hover:shadow-xl"
            >
                {t(translations.continue)}
            </button>
        </div>
    );

    // Reuse Phase 1 (Selection) and Phase 2 (Customization) from SchoolWizard logic but with StudentWizard state
    // ... (Code mirrors SchoolWizard renderSelectionPhase and renderCustomizationPhase but uses StudentWizard state/context)

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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    const productsInCategory = getProductsByCategory(category.id);
                    const productCount = productsInCategory.length;

                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`group relative rounded-2xl overflow-hidden border-4 transition-all duration-300 h-96 ${isSelected
                                ? 'border-green-500 shadow-xl scale-105'
                                : 'border-gray-200 hover:border-primary hover:shadow-lg'
                                }`}
                        >
                            <div className="absolute inset-0 w-full h-full">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-left">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {language === 'ar' ? category.nameAr : category.name}
                                </div>
                                <div className="text-sm text-gray-200 font-medium">
                                    {productCount} {language === 'ar' ? 'منتج' : 'items'}
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg z-10">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

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

    const renderCustomizationPhase = () => {
        const currentCategory = getCurrentCategory();
        if (!currentCategory) return null;

        const products = getProductsByCategory(currentCategory.id);
        const sizes = sizeCharts[details.stage] || [];
        const showStyleSelection = !currentProduct;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={handleBackToSelection} className="flex items-center gap-2 hover:opacity-80 transition-opacity text-white">
                            <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t(translations.back)}
                        </button>
                        <div className="text-sm opacity-90 text-white">
                            {t(translations.customizingItem)} {currentCategoryIndex + 1} {t(translations.of)} {selectedCategoryIds.length}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {language === 'ar' ? currentCategory.nameAr : currentCategory.name}
                    </h2>
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                        <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${((currentCategoryIndex + 1) / selectedCategoryIds.length) * 100}%` }} />
                    </div>
                </div>

                {showStyleSelection && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t(translations.selectStyle)}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductSelect(product.id)}
                                    className="group relative rounded-xl overflow-hidden border-4 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        <Image src={product.image} alt={product.name} fill className="object-contain mix-blend-multiply p-2 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3 bg-white">
                                        <div className="font-bold text-primary text-lg">{product.code}</div>
                                        <div className="text-sm text-gray-600">{language === 'ar' ? (product.nameAr || product.name) : product.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!showStyleSelection && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <Image src={getProductById(currentProduct).image} alt={getProductById(currentProduct).name} fill className="object-contain" />
                            </div>
                            <div>
                                <div className="font-bold text-2xl text-primary">{getProductById(currentProduct).code}</div>
                                <div className="text-gray-600">{language === 'ar' ? (getProductById(currentProduct).nameAr || getProductById(currentProduct).name) : getProductById(currentProduct).name}</div>
                            </div>
                            <button onClick={() => setCurrentProduct(null)} className="ml-auto text-sm text-primary hover:text-primary-700 font-semibold">{t(translations.changeStyle)}</button>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(translations.schoolStage)}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setDetails({ ...details, stage: 'prep_secondary' })} className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'prep_secondary' ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}>
                                    <div className="text-2xl mb-2">🎒</div>
                                    <div className="font-semibold">{t(translations.middleSchool)}</div>
                                </button>
                                <button onClick={() => setDetails({ ...details, stage: 'high_school' })} className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'high_school' ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}>
                                    <div className="text-2xl mb-2">🎓</div>
                                    <div className="font-semibold">{t(translations.highSchool)}</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">{t(translations.selectColor)} <span className="text-red-500">*</span></label>
                            <div className={`grid grid-cols-4 gap-3 ${missingFields.includes('color') ? 'p-2 border border-red-500 rounded-lg bg-red-50' : ''}`}>
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => {
                                            setDetails({ ...details, color: color.id, customColorName: color.id !== 'custom' ? '' : details.customColorName });
                                            clearMissingField('color');
                                        }}
                                        className={`relative p-4 rounded-lg border-2 transition-all ${details.color === color.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300 hover:border-primary'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            {color.isCustom ? (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 mb-2"></div>
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full border-2 border-${color.border} shadow-inner mb-2`} style={{ backgroundColor: color.hex }}></div>
                                            )}
                                            <span className="text-xs font-medium">{language === 'ar' ? color.label.ar : color.label.en}</span>
                                        </div>
                                        {details.color === color.id && (<div className="absolute top-2 right-2 text-primary">✓</div>)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logo Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {t(translations.logoType)} <span className="text-red-500">*</span>
                            </label>
                            <div className={`grid grid-cols-3 gap-4 ${missingFields.includes('logoType') ? 'p-2 border border-red-500 rounded-lg bg-red-50' : ''}`}>
                                {['embroidery', 'printing', 'wovenPatch'].map((type) => {
                                    const imgMap = { embroidery: '/images/customization/logo-embroidery.png', printing: '/images/customization/logo-printing.png', wovenPatch: '/images/customization/logo-woven.png' };
                                    return (
                                        <button key={type} onClick={() => { setDetails({ ...details, logoType: type }); clearMissingField('logoType'); }} className={`relative group flex flex-col items-center p-0 rounded-xl border-2 overflow-hidden transition-all duration-300 ${details.logoType === type ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'border-gray-200 hover:border-primary hover:shadow-lg opacity-90 hover:opacity-100'}`}>
                                            <div className="relative w-full aspect-square bg-gray-50"><Image src={imgMap[type]} alt={t(translations[type])} fill className="object-cover" /></div>
                                            <div className={`w-full py-3 text-center border-t transition-colors ${details.logoType === type ? 'bg-primary/10 border-primary/20' : 'bg-white border-gray-100'}`}><span className={`text-sm font-semibold ${details.logoType === type ? 'text-primary' : 'text-gray-700'}`}>{t(translations[type])}</span></div>
                                            {details.logoType === type && (<div className="absolute top-2 right-2 text-primary bg-white rounded-full p-0.5 shadow-sm">✓</div>)}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Logo Placement */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {t(translations.logoPlacement)} <span className="text-red-500">*</span>
                            </label>
                            <div className={`grid grid-cols-3 gap-4 ${missingFields.includes('logoPlacement') ? 'p-2 border border-red-500 rounded-lg bg-red-50' : ''}`}>
                                {['chest', 'shoulder', 'back'].map((placement) => {
                                    const imgMap = { chest: '/images/customization/placement-chest.png', shoulder: '/images/customization/placement-shoulder.png', back: '/images/customization/placement-back.png' };
                                    return (
                                        <button key={placement} onClick={() => { setDetails({ ...details, logoPlacement: placement }); clearMissingField('logoPlacement'); }} className={`relative group flex flex-col items-center p-0 rounded-xl border-2 overflow-hidden transition-all duration-300 ${details.logoPlacement === placement ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'border-gray-200 hover:border-primary hover:shadow-lg opacity-90 hover:opacity-100'}`}>
                                            <div className="relative w-full aspect-square bg-gray-50"><Image src={imgMap[placement]} alt={t(translations[placement === 'back' ? 'logoBack' : placement])} fill className="object-cover" /></div>
                                            <div className={`w-full py-3 text-center border-t transition-colors ${details.logoPlacement === placement ? 'bg-primary/10 border-primary/20' : 'bg-white border-gray-100'}`}><span className={`text-sm font-semibold ${details.logoPlacement === placement ? 'text-primary' : 'text-gray-700'}`}>{t(translations[placement === 'back' ? 'logoBack' : placement])}</span></div>
                                            {details.logoPlacement === placement && (<div className="absolute top-2 right-2 text-primary bg-white rounded-full p-0.5 shadow-sm">✓</div>)}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {details.color === 'custom' && (
                            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg space-y-4">
                                <p className="text-sm font-semibold text-yellow-900">📝 {language === 'ar' ? 'تفاصيل اللون المخصص' : 'Custom Color Details'}</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'اسم / كود اللون' : 'Color Name/Code'} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={details.customColorName}
                                        onChange={(e) => {
                                            setDetails({ ...details, customColorName: e.target.value });
                                            clearMissingField('customColorName');
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${missingFields.includes('customColorName') ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
                                    />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'رفع عينة (اختياري)' : 'Upload Sample (Optional)'}</label><input type="file" accept="image/*" onChange={handleCustomColorUpload} disabled={isUploadingCustomColor} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(translations.fabricType)} <span className="text-red-500">*</span></label>
                            <select
                                value={details.fabric}
                                onChange={(e) => {
                                    setDetails({ ...details, fabric: e.target.value });
                                    clearMissingField('fabric');
                                }}
                                className={`w-full py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all ${language === 'ar' ? '!bg-[position:left_1rem_center] !pl-12 !pr-4' : '!bg-[position:right_1rem_center] !pr-12 !pl-4'} ${missingFields.includes('fabric') ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : 'border-gray-300'}`}>
                                <option value="">{t(translations.selectFabricPlaceholder)}</option>
                                {getFabricOptions().map(fabric => (<option key={fabric} value={fabric}>{fabricTranslations[fabric] ? (language === 'ar' ? fabricTranslations[fabric].ar : fabricTranslations[fabric].en) : fabric}</option>))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(translations.uploadLogo)} <span className="text-gray-400 font-normal">({t(translations.optionalLogo)})</span></label>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            {details.logoName && <p className="mt-2 text-sm text-green-600">✓ {details.logoName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(translations.specialInstructions)}</label>
                            <textarea value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} placeholder={t(translations.notesPlaceholder)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{t(translations.sizeMatrix)}</h3>
                                <button onClick={() => setShowSizingWizard(true)} className="flex items-center gap-2 text-primary hover:text-primary-700 font-semibold text-sm bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                    <Ruler className="w-4 h-4" /> {language === 'ar' ? 'اعرف مقاسك' : 'Know Your Size'}
                                </button>
                            </div>
                            <div className={`space-y-4 ${missingFields.includes('sizes') ? 'p-3 border border-red-500 rounded-xl bg-red-50' : ''}`}>
                                {sizes.map((size) => (
                                    <div key={size} className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-primary transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">{language === 'ar' ? 'مقاس' : 'Size'}</span>
                                            <span className="font-bold text-gray-900 text-xl w-8 text-center">{size}</span>
                                        </div>
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden" dir="ltr">
                                            <button onClick={() => updateQuantity(size, (sizeQuantities[size] || 0) - 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600">-</button>
                                            <input type="tel" value={sizeQuantities[size] || 0} onChange={(e) => updateQuantity(size, e.target.value.replace(/\D/g, ''))} className="w-12 h-10 text-center font-bold text-lg bg-white border-x border-gray-200 p-0 text-primary" />
                                            <button onClick={() => updateQuantity(size, (sizeQuantities[size] || 0) + 1)} className="w-10 h-10 flex items-center justify-center bg-primary text-white hover:bg-primary-600">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
                            <span className="text-lg font-bold text-gray-900">{t(translations.totalItems)}</span>
                            <span className="text-2xl font-bold text-primary">{totalItems}</span>
                        </div>

                        <button onClick={handleSaveAndNext} disabled={totalItems === 0} className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${totalItems > 0 ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                            {t(translations.saveAndNext)}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderSuccessView = () => (
        <div className="text-center animate-fade-in py-12">
            <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 ref={successHeadingRef} tabIndex="-1" className="text-3xl font-bold text-gray-900 mb-2 outline-none">{t(translations.orderComplete)}</h3>
                <p className="text-gray-600 mb-6">{t(translations.allItemsAdded)}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => window.location.href = '/cart'} className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-all">{t(translations.viewCart)}</button>
                    <button onClick={handleStartNewOrder} className="w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all">{t(translations.startNewOrder)}</button>
                </div>
            </div>
        </div>
    );

    const renderMobileCartBar = () => {
        if (cart.length === 0) return null;
        const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 lg:hidden animate-slide-up">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="text-white">
                        <div className="text-sm opacity-90 mb-0.5">{language === 'ar' ? 'لديك في السلة' : 'In your cart'}</div>
                        <div className="font-bold text-lg">{totalCartItems} {language === 'ar' ? 'منتجات' : 'items'}</div>
                    </div>
                    <button onClick={() => router.push('/cart')} className="px-6 py-2.5 bg-white text-primary rounded-lg font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all">{language === 'ar' ? 'مراجعة الطلب 🛒' : 'Review Order 🛒'}</button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div ref={wizardTopRef} className="max-w-6xl mx-auto px-4 py-8 pb-32 lg:pb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                    {!contactInfoSubmitted && renderContactInfoStep()}
                    {contactInfoSubmitted && wizardPhase === 'SELECTION' && renderSelectionPhase()}
                    {contactInfoSubmitted && wizardPhase === 'CUSTOMIZATION' && renderCustomizationPhase()}
                    {contactInfoSubmitted && wizardPhase === 'COMPLETED' && renderSuccessView()}
                </div>
            </div>
            {/* Custom Alert Modal */}
            {alertMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up border border-gray-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ar' ? 'تنبيه' : 'Attention'}
                            </h3>
                            <div className={`text-gray-600 mb-6 text-sm md:text-base leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {Array.isArray(alertMessage) ? (
                                    <ul className="list-disc list-inside space-y-2">
                                        {alertMessage.map((msg, idx) => (
                                            <li key={idx} className="text-red-600 font-medium">{msg}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{alertMessage}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setAlertMessage(null)}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                {language === 'ar' ? 'حسناً' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {renderMobileCartBar()}
            {showSizingWizard && <SizingWizard onClose={() => setShowSizingWizard(false)} sector="schools" />}
        </>
    );
}
