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



export default function SchoolWizard() {
    const { t, language } = useLanguage();
    const { addToCart, cart, updateCartItem } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('editId');

    // Contact information (collected once at start)
    const [contactInfo, setContactInfo] = useState({
        schoolName: '',
        contactPerson: '',
        email: '',
        phone: ''
    });
    const [contactInfoSubmitted, setContactInfoSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});

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
        middleSchool: { en: 'Middle School', ar: 'متوسط' },
        highSchool: { en: 'High School', ar: 'ثانوي' },
        sizeMatrix: { en: 'Size & Quantity', ar: 'المقاسات والكميات' },
        totalItems: { en: 'Total Items', ar: 'إجمالي القطع' },
        saveAndNext: { en: 'Save & Next Item ➡️', ar: '➡️ حفظ والتالي' },
        atLeastOne: { en: 'Please add at least one item', ar: 'يرجى إضافة قطعة واحدة على الأقل' },
        selectProduct: { en: 'Please select a product style', ar: 'يرجى اختيار نمط المنتج' },

        // Completion
        orderComplete: { en: 'Order Complete!', ar: 'اكتمل الطلب!' },
        allItemsAdded: { en: 'All items have been added to your cart', ar: 'تمت إضافة جميع العناصر إلى سلتك' },
        viewCart: { en: 'View Cart', ar: 'عرض السلة' },
        startNewOrder: { en: 'Start New Order', ar: 'بدء طلب جديد' },

        // Navigation
        back: { en: 'Back', ar: 'رجوع' },
        changeStyle: { en: 'Change Style', ar: 'تغيير التصميم' },
        next: { en: 'Next', ar: 'التالي' },
        selectColor: { en: 'Select Color', ar: 'اختر اللون' },
        fabricType: { en: 'Fabric Type', ar: 'نوع القماش' },
        selectFabricPlaceholder: { en: 'Select fabric...', ar: 'اختر الخامة...' },
        additionalRef: { en: 'Additional Reference', ar: 'مرجع إضافي' },
        uploadRefDesc: { en: 'Upload any extra design ideas, specifications, or reference images', ar: 'ارفع أي أفكار تصميم إضافية أو مواصفات أو صور' },
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
        const savedContact = sessionStorage.getItem('schoolContactInfo');
        if (savedContact) {
            try {
                setContactInfo(JSON.parse(savedContact));

                // CRITICAL FIX: Only skip the form if the user has items in the cart ("Add More" mode).
                // If cart is empty (New Order), show the form so they can confirm/change details.
                if (cart.length > 0) {
                    setContactInfoSubmitted(true);
                }
            } catch (e) {
                console.error('Error parsing session contact info', e);
            }
        }

        // 2. Load Selected Categories
        const savedCategories = sessionStorage.getItem('selectedCategoryIds');
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
                console.log('✏️ Editing item:', itemToEdit);
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
            sessionStorage.setItem('selectedCategoryIds', JSON.stringify(selectedCategoryIds));
        }
    }, [selectedCategoryIds]);

    // Auto-scroll logic with "Scroller Hunter"
    useEffect(() => {
        const timer = setTimeout(() => {
            if (wizardPhase === 'COMPLETED') {
                // Phase replacement unmounts the form, naturally scrolling to top
                // Standard window reset as backup
                window.scrollTo({ top: 0, behavior: 'auto' });
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;

                // Focus shift for extra insurance
                setTimeout(() => {
                    if (successHeadingRef.current) {
                        successHeadingRef.current.focus({ preventScroll: true });
                    }
                }, 100);

            } else if (wizardTopRef.current && wizardPhase === 'CUSTOMIZATION') {
                // Normal wizard navigation
                wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100); // Delay for render

        return () => clearTimeout(timer);
    }, [currentCategoryIndex, wizardPhase]);

    // Material options
    const materialOptions = [
        '100% Cotton',
        'Polyester Blend',
        'Heavy Duty Gabardine'
    ];

    // Color Options
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
        prep_secondary: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        high_school: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    // Validation Helper
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Allow 7 to 15 digits (standard international lengths)
        const phoneRegex = /^\d{7,15}$/;

        if (!contactInfo.schoolName.trim()) errors.schoolName = t({ en: 'School Name is required', ar: 'اسم المدرسة مطلوب' });
        if (!contactInfo.contactPerson.trim()) errors.contactPerson = t({ en: 'Contact Person is required', ar: 'اسم المسؤول مطلوب' });

        if (!contactInfo.email) {
            errors.email = t({ en: 'Email is required', ar: 'البريد الإلكتروني مطلوب' });
        } else if (!emailRegex.test(contactInfo.email)) {
            errors.email = t({ en: 'Invalid email format', ar: 'صيغة البريد الإلكتروني غير صحيحة' });
        }

        if (!contactInfo.phone) {
            errors.phone = t({ en: 'Phone number is required', ar: 'رقم الهاتف مطلوب' });
        } else if (contactInfo.phone.length < 10) {
            // Basic length check for E.164
            errors.phone = t({ en: 'Invalid phone number', ar: 'رقم الهاتف غير صحيح' });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToCatalog = () => {
        if (validateForm()) {
            sessionStorage.setItem('schoolContactInfo', JSON.stringify(contactInfo));
            setContactInfoSubmitted(true);
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

    const updateQuantity = (size, newValue) => {
        // Ensure strictly non-negative integers
        let val = parseInt(newValue);
        if (isNaN(val) || val < 0) val = 0;

        // Limit max quantity if needed (999 is a reasonable safe limit)
        if (val > 999) val = 999;

        setSizeQuantities(prev => ({
            ...prev,
            [size]: val
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

        // Logo Validation - MANDATORY
        if (!details.logoType) {
            alert(t({ en: 'Please select logo type', ar: 'يرجى اختيار نوع الشعار' }));
            return;
        }

        if (!details.logoPlacement) {
            alert(t({ en: 'Please select logo placement', ar: 'يرجى اختيار مكان الشعار' }));
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
            productNameAr: product.nameAr, // Store Arabic Name
            code: product.code,
            image: product.image,

            // --- ROOT-LEVEL FIELDS for Admin Dashboard Display ---
            fabric: details.fabric,
            fabricAr: fabricTranslations[details.fabric]?.ar || details.fabric, // Store Arabic Fabric
            selectedColor: details.color,
            customColorName: details.customColorName || null,
            customColorUrl: details.customColorUrl || null,
            referenceFileUrl: details.referenceUrl || null,
            logoType: details.logoType,
            logoPlacement: details.logoPlacement,
            // -----------------------------------------------------

            details: {
                color: details.color,
                nameAr: product.nameAr, // Also keep here for consistency
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
                contactInfo: contactInfo
            },
            quantity: totalItems,
            price: 0
        };

        if (editId) {
            console.log('✏️ Updating existing item:', editId);
            updateCartItem(editId, cartItem);
            router.push('/cart');
            return;
        }

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
                referenceFileName: null,
                notes: '',
                stage: 'kg_primary',
                logoType: null,
                logoPlacement: null
            });
            setSizeQuantities({});
        } else {
            console.log('🎉 All categories complete - showing success view');

            // All done - transition to COMPLETED phase
            setWizardPhase('COMPLETED');
        }
    };

    // Back to selection from customization
    const handleBackToSelection = () => {
        // 1. If currently viewing product details (Fabric, Color, etc.), go back to Style Selection
        if (currentProduct) {
            setCurrentProduct(null);
            return;
        }

        // 2. If viewing Style Selection for > 0 category index, go back to previous category
        if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(prev => prev - 1);
            // Ensure we start at style selection for the previous category
            setCurrentProduct(null);
            return;
        }

        // 3. If at the first category style selection, go back to Category Grid (Selection Phase)
        setWizardPhase('SELECTION');
        setCurrentCategoryIndex(0);
        setCurrentProduct(null);
        setSizeQuantities({});
    };

    // Start new order
    const handleStartNewOrder = () => {
        // Clear persisted categories so we start fresh
        sessionStorage.removeItem('selectedCategoryIds');

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
            referenceFileName: null,
            notes: '',
            stage: 'kg_primary',
            logoType: null,
            logoPlacement: null
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

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t(translations.contactPerson)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={contactInfo.contactPerson}
                    onChange={(e) => {
                        setContactInfo({ ...contactInfo, contactPerson: e.target.value });
                        if (formErrors.contactPerson) setFormErrors({ ...formErrors, contactPerson: null });
                    }}
                    placeholder={t(translations.contactPersonPlaceholder)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${formErrors.contactPerson
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-primary'
                        }`}
                />
                {formErrors.contactPerson && <p className="text-red-500 text-sm mt-1">{formErrors.contactPerson}</p>}
            </div>

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
        </div> // This wrapper div was missing
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
                            className={`group relative rounded-2xl overflow-hidden border-4 transition-all duration-300 h-96 ${isSelected
                                ? 'border-green-500 shadow-xl scale-105'
                                : 'border-gray-200 hover:border-primary hover:shadow-lg'
                                }`}
                        >
                            {/* Full-Size Image Background */}
                            <div className="absolute inset-0 w-full h-full">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Text Overlay with Gradient */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-left">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {language === 'ar' ? category.nameAr : category.name}
                                </div>
                                <div className="text-sm text-gray-200 font-medium">
                                    {productCount} {language === 'ar' ? 'منتج' : 'items'}
                                </div>
                            </div>

                            {/* Selected Badge (Top-Right) */}
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
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-white"
                        >
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
                                            className="object-contain mix-blend-multiply p-2 group-hover:scale-110 transition-transform duration-500"
                                        />
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
                                <div className="text-gray-600">{language === 'ar' ? (getProductById(currentProduct).nameAr || getProductById(currentProduct).name) : getProductById(currentProduct).name}</div>
                            </div>
                            <button
                                onClick={() => setCurrentProduct(null)}
                                className="ml-auto text-sm text-primary hover:text-primary-700 font-semibold"
                            >
                                {t(translations.changeStyle)}
                            </button>
                        </div>

                        {/* School Stage */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t(translations.schoolStage)}
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDetails({ ...details, stage: 'prep_secondary' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'prep_secondary'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300 hover:border-primary'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🎒</div>
                                    <div className="font-semibold">{t(translations.middleSchool)}</div>
                                </button>
                                <button
                                    onClick={() => setDetails({ ...details, stage: 'high_school' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${details.stage === 'high_school'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300 hover:border-primary'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🎓</div>
                                    <div className="font-semibold">{t(translations.highSchool)}</div>
                                </button>
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {t(translations.selectColor)} <span className="text-red-500">*</span>
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
                                                <span className="text-xs font-medium">{language === 'ar' ? color.label.ar : color.label.en}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-12 h-12 rounded-full border-2 border-${color.border} shadow-inner mb-2`}
                                                    style={{ backgroundColor: color.hex }}
                                                ></div>
                                                <span className="text-xs font-medium">{language === 'ar' ? color.label.ar : color.label.en}</span>
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

                        {/* Logo Type Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {t(translations.logoType)} <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['embroidery', 'printing', 'wovenPatch'].map((type) => {
                                    // Map type IDs to image paths
                                    const imgMap = {
                                        embroidery: '/images/customization/logo-embroidery.png',
                                        printing: '/images/customization/logo-printing.png',
                                        wovenPatch: '/images/customization/logo-woven.png'
                                    };

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setDetails({ ...details, logoType: type })}
                                            className={`relative group flex flex-col items-center p-0 rounded-xl border-2 overflow-hidden transition-all duration-300 ${details.logoType === type
                                                ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md'
                                                : 'border-gray-200 hover:border-primary hover:shadow-lg opacity-90 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="relative w-full aspect-square bg-gray-50">
                                                <Image
                                                    src={imgMap[type]}
                                                    alt={t(translations[type])}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className={`w-full py-3 text-center border-t transition-colors ${details.logoType === type ? 'bg-primary/10 border-primary/20' : 'bg-white border-gray-100'
                                                }`}>
                                                <span className={`text-sm font-semibold ${details.logoType === type ? 'text-primary' : 'text-gray-700'
                                                    }`}>
                                                    {t(translations[type])}
                                                </span>
                                            </div>

                                            {details.logoType === type && (
                                                <div className="absolute top-2 right-2 text-primary bg-white rounded-full p-0.5 shadow-sm">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Logo Placement Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {t(translations.logoPlacement)} <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['chest', 'shoulder', 'back'].map((placement) => {
                                    // Map placement IDs to image paths
                                    const imgMap = {
                                        chest: '/images/customization/placement-chest.png',
                                        shoulder: '/images/customization/placement-shoulder.png',
                                        back: '/images/customization/placement-back.png'
                                    };

                                    return (
                                        <button
                                            key={placement}
                                            onClick={() => setDetails({ ...details, logoPlacement: placement })}
                                            className={`relative group flex flex-col items-center p-0 rounded-xl border-2 overflow-hidden transition-all duration-300 ${details.logoPlacement === placement
                                                ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md'
                                                : 'border-gray-200 hover:border-primary hover:shadow-lg opacity-90 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="relative w-full aspect-square bg-gray-50">
                                                <Image
                                                    src={imgMap[placement]}
                                                    alt={t(translations[placement === 'back' ? 'logoBack' : placement])}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className={`w-full py-3 text-center border-t transition-colors ${details.logoPlacement === placement ? 'bg-primary/10 border-primary/20' : 'bg-white border-gray-100'
                                                }`}>
                                                <span className={`text-sm font-semibold ${details.logoPlacement === placement ? 'text-primary' : 'text-gray-700'
                                                    }`}>
                                                    {t(translations[placement === 'back' ? 'logoBack' : placement])}
                                                </span>
                                            </div>

                                            {details.logoPlacement === placement && (
                                                <div className="absolute top-2 right-2 text-primary bg-white rounded-full p-0.5 shadow-sm">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
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
                                {t(translations.fabricType)} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={details.fabric}
                                onChange={(e) => setDetails({ ...details, fabric: e.target.value })}
                                className={`w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-all ${language === 'ar' ? '!bg-[position:left_1rem_center] !pl-12 !pr-4' : '!bg-[position:right_1rem_center] !pr-12 !pl-4'}`}
                            >
                                <option value="">{t(translations.selectFabricPlaceholder)}</option>
                                {getFabricOptions().map(fabric => (
                                    <option key={fabric} value={fabric}>
                                        {fabricTranslations[fabric] ? (language === 'ar' ? fabricTranslations[fabric].ar : fabricTranslations[fabric].en) : fabric}
                                    </option>
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
                                {t(translations.additionalRef)} <span className="text-gray-400 font-normal">({t(translations.optionalLogo)})</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-2">
                                {t(translations.uploadRefDesc)}
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
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t(translations.sizeMatrix)}
                                </h3>
                                <button
                                    onClick={() => setShowSizingWizard(true)}
                                    className="flex items-center gap-2 text-primary hover:text-primary-700 font-semibold text-sm transition-colors bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/10 hover:border-primary/20"
                                >
                                    <Ruler className="w-4 h-4" />
                                    {language === 'ar' ? 'اعرف مقاسك' : 'Know Your Size'}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {sizes.map((size) => (
                                    <div key={size} className="flex items-center justify-between gap-4 p-3 md:p-4 border border-gray-200 rounded-xl bg-white hover:border-primary hover:shadow-sm transition-all mb-3">
                                        {/* Size Label */}
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <span className="bg-gray-100 text-gray-600 px-2 md:px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                                                {language === 'ar' ? 'مقاس' : 'Size'}
                                            </span>
                                            <span className="font-bold text-gray-900 text-lg md:text-xl w-6 md:w-8 text-center inline-block">
                                                {size}
                                            </span>
                                        </div>

                                        {/* Modern Grouped Stepper */}
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm shrink-0" dir="ltr">
                                            {/* Minus Button */}
                                            <button
                                                onClick={() => updateQuantity(size, (sizeQuantities[size] || 0) - 1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors active:bg-gray-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                                </svg>
                                            </button>

                                            {/* Numeric Input */}
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={sizeQuantities[size] || 0}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    updateQuantity(size, val);
                                                }}
                                                className="w-12 h-10 text-center font-bold text-lg bg-white border-x border-gray-200 focus:outline-none focus:ring-0 p-0 text-primary"
                                            />

                                            {/* Plus Button */}
                                            <button
                                                onClick={() => updateQuantity(size, (sizeQuantities[size] || 0) + 1)}
                                                className="w-10 h-10 flex items-center justify-center bg-primary text-white hover:bg-primary-600 transition-colors active:bg-primary-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
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

    // Success View (replaces the wizard when complete)
    const renderSuccessView = () => (
        <div className="text-center animate-fade-in py-12">
            <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 ref={successHeadingRef} tabIndex="-1" className="text-3xl font-bold text-gray-900 mb-2 outline-none">
                    {t(translations.orderComplete)}
                </h3>
                <p className="text-gray-600 mb-6">
                    {t(translations.allItemsAdded)}
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
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

    // Sticky Mobile Cart Bar
    const renderMobileCartBar = () => {
        if (cart.length === 0) return null;

        const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 lg:hidden animate-slide-up">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="text-white">
                        <div className="text-sm opacity-90 mb-0.5">
                            {language === 'ar' ? 'لديك في السلة' : 'In your cart'}
                        </div>
                        <div className="font-bold text-lg">
                            {totalCartItems} {language === 'ar' ? 'منتجات' : 'items'}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/cart')}
                        className="px-6 py-2.5 bg-white text-primary rounded-lg font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        {language === 'ar' ? 'مراجعة الطلب 🛒' : 'Review Order 🛒'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div ref={wizardTopRef} className="max-w-6xl mx-auto px-4 py-8 pb-32 lg:pb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                    {/* Contact Info Step */}
                    {!contactInfoSubmitted && renderContactInfoStep()}

                    {/* Selection Phase */}
                    {contactInfoSubmitted && wizardPhase === 'SELECTION' && renderSelectionPhase()}

                    {/* Customization Phase */}
                    {contactInfoSubmitted && wizardPhase === 'CUSTOMIZATION' && renderCustomizationPhase()}

                    {/* Success View (replaces form when complete) */}
                    {contactInfoSubmitted && wizardPhase === 'COMPLETED' && renderSuccessView()}
                </div>
            </div>
            {renderMobileCartBar()}
            {showSizingWizard && <SizingWizard onClose={() => setShowSizingWizard(false)} sector="schools" />}
        </>
    );
}
