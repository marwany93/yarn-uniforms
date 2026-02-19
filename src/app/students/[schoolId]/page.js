'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getProductById } from '@/data/schoolProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import SizingWizard from '@/components/wizard/SizingWizard';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

export default function SchoolStorefront() {
    const { t, language } = useLanguage();
    const { addToCart, cart, removeFromCart, checkCartConflict, clearCart } = useCart();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const schoolId = params.schoolId;
    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [school, setSchool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({});
    const [selectedStage, setSelectedStage] = useState('primary');
    const [showSizingGuide, setShowSizingGuide] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Conflict Modal State
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingCartItem, setPendingCartItem] = useState(null);

    const stageSizes = {
        primary: ['4', '6', '8', '10', '12', '14', '16'],
        prep_secondary: ['S', 'M', 'L', 'XL', 'XXL']
    };

    useEffect(() => {
        const fetchSchool = async () => {
            if (!schoolId) return;

            try {
                const docRef = doc(db, 'schools', schoolId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSchool({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('School not found');
                    setSchool(null);
                }
            } catch (err) {
                console.error("Error fetching school:", err);
                setError('Failed to load school data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchool();
    }, [schoolId]);

    // Handle Edit Mode - Auto Open Modal
    useEffect(() => {
        if (editId && cart.length > 0 && school && school.assignedProducts) {
            const itemToEdit = cart.find(item => item.id === editId);
            if (itemToEdit) {
                const productToOpen = school.assignedProducts.find(p => p.productId === itemToEdit.productId);

                if (productToOpen) {
                    const baseProduct = getProductById(productToOpen.productId);
                    if (baseProduct) {
                        setSelectedProduct({ ...productToOpen, baseProduct });
                        setSelectedSizes(itemToEdit.details?.sizes || {});
                        setIsEditMode(true);
                    }
                }
            }
        }
    }, [editId, cart, school]);

    const executeAddToCart = (item) => {
        if (isEditMode) {
            removeFromCart(editId);
        }

        addToCart(item);

        // Reset
        setSelectedProduct(null);
        setSelectedSizes({});
        setPendingCartItem(null);
        setShowConflictModal(false);

        // Smart Redirect
        if (isEditMode) {
            setIsEditMode(false);
            router.push('/cart');
        } else {
            router.replace(window.location.pathname);
        }
    };

    const handleAddToCart = () => {
        const totalQuantity = Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0);
        if (totalQuantity === 0) return; // Don't add if no sizes selected

        const cartItem = {
            id: `${selectedProduct.productId}-${Date.now()}`,
            productId: selectedProduct.productId,
            productName: selectedProduct.baseProduct.name,
            productNameAr: selectedProduct.baseProduct.nameAr,
            image: selectedProduct.baseProduct.image,
            price: selectedProduct.price,
            quantity: totalQuantity,
            sector: 'students',
            sectorAr: 'أفراد (طالب/ولي أمر)',
            details: {
                ...selectedProduct.fixedDetails, // Inject B2B fixed details (fabric, color, etc.)
                sizes: selectedSizes,
                schoolId: school.id,
                schoolName: school.name.en || '',
                schoolNameAr: school.name.ar || ''
            }
        };

        // Check for Conflict (B2B vs B2C)
        // Skip check if in edit mode (as we are updating an existing item which implies context is correct or we are fixing it)
        if (!isEditMode && checkCartConflict('students')) {
            setPendingCartItem(cartItem);
            setShowConflictModal(true);
            return;
        }

        executeAddToCart(cartItem);
    };

    const handleConfirmConflict = () => {
        clearCart();
        if (pendingCartItem) {
            executeAddToCart(pendingCartItem);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <span className="text-6xl mb-4">🏫</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'ar' ? 'المدرسة غير موجودة' : 'School Not Found'}
                </h1>
                <p className="text-gray-500 mb-6">
                    {language === 'ar'
                        ? 'عذراً، لم نتمكن من العثور على المدرسة المطلوبة.'
                        : 'Sorry, we could not find the school you are looking for.'}
                </p>
                <button
                    onClick={() => router.push('/students')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    {language === 'ar' ? 'العودة للقائمة' : 'Go Back to List'}
                </button>
            </div>
        );
    }

    const schoolName = language === 'ar'
        ? (school.nameAr || school.name?.ar)
        : (school.nameEn || school.name?.en);

    return (
        <div className="min-h-screen bg-gray-50 pb-20" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Compact Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    {/* Compact Logo */}
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center relative">
                        {school.logo ? (
                            <Image
                                src={school.logo}
                                alt={schoolName || 'School Logo'}
                                fill
                                className="object-contain p-1"
                            />
                        ) : (
                            <span className="text-2xl text-gray-400">🏫</span>
                        )}
                    </div>

                    {/* School Name & Link back */}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{schoolName}</h1>
                        <button
                            onClick={() => router.push('/students')}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1 transition-colors group"
                        >
                            <span className="rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1">←</span>
                            <span>{language === 'ar' ? 'تغيير المدرسة' : 'Change School'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {school.assignedProducts && school.assignedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {school.assignedProducts.map((item, index) => {
                            const baseProduct = getProductById(item.productId);
                            if (!baseProduct) return null;

                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                    {/* Image */}
                                    <div className="aspect-[3/4] md:aspect-[4/5] relative bg-gray-50">
                                        <Image
                                            src={baseProduct.image}
                                            alt={language === 'ar' ? baseProduct.nameAr : baseProduct.name}
                                            fill
                                            className="object-contain p-2 md:p-4 hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                                        <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                                            {language === 'ar' ? baseProduct.nameAr : baseProduct.name}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-500 mb-3 line-clamp-1">
                                            {language === 'ar' ? item.fixedDetails?.fabric : item.fixedDetails?.fabric || 'N/A'}
                                        </p>

                                        <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                                            <div className="text-base md:text-lg font-bold text-primary-600">
                                                {item.price} <span className="text-xs font-normal text-gray-500">{language === 'ar' ? 'ريال' : 'SAR'}</span>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedProduct({ ...item, baseProduct }); setSelectedSizes({}); setShowSizingGuide(false); }}
                                                className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-gray-900 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
                                            >
                                                {language === 'ar' ? 'اختر المقاس' : 'Choose Size'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <span className="text-4xl block mb-4">👕</span>
                        <h3 className="text-lg font-medium text-gray-900">
                            {language === 'ar' ? 'لا توجد منتجات' : 'No Products Available'}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            {language === 'ar'
                                ? 'لم تضاف منتجات لهذه المدرسة بعد.'
                                : 'No products have been assigned to this school yet.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Size Selection Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up sm:animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">
                                {language === 'ar' ? 'اختر المقاس والكمية' : 'Select Size & Quantity'}
                            </h3>
                            <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {/* Sizing Guide Button */}
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowSizingGuide(true)}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <span className="text-lg">📏</span>
                                    <span>{language === 'ar' ? 'اعرف مقاسك' : 'Know Your Size'}</span>
                                </button>
                            </div>

                            {/* Stage Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {language === 'ar' ? 'المرحلة الدراسية' : 'School Stage'}
                                </label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setSelectedStage('primary')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedStage === 'primary' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {language === 'ar' ? 'ابتدائي / رياض أطفال' : 'Primary / KG'}
                                    </button>
                                    <button
                                        onClick={() => setSelectedStage('prep_secondary')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedStage === 'prep_secondary' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {language === 'ar' ? 'إعدادي / ثانوي' : 'Prep / Secondary'}
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Size Grid */}
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {language === 'ar' ? 'اختر المقاس والكمية' : 'Select Size & Quantity'}
                            </label>
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                {stageSizes[selectedStage].map(size => (
                                    <div key={size} className={`flex flex-col items-center p-2 md:p-3 border rounded-xl transition-colors ${selectedSizes[size] > 0 ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}>
                                        <span className={`font-bold mb-2 ${selectedSizes[size] > 0 ? 'text-primary-700' : 'text-gray-700'}`}>{size}</span>
                                        <div className="flex items-center gap-2 md:gap-3 bg-gray-100 rounded-lg p-1 w-full justify-center">
                                            <button
                                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary-600 font-bold"
                                                onClick={() => setSelectedSizes(prev => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) - 1) }))}
                                            >-</button>
                                            <span className="w-4 text-center font-medium">{selectedSizes[size] || 0}</span>
                                            <button
                                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary-600 font-bold"
                                                onClick={() => setSelectedSizes(prev => ({ ...prev, [size]: (prev[size] || 0) + 1 }))}
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleAddToCart}
                                disabled={Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0) === 0}
                                className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isEditMode
                                    ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                                    : (language === 'ar' ? 'إضافة للسلة' : 'Add to Cart')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render Sizing Wizard Overlay if requested */}
            {showSizingGuide && (
                <SizingWizard
                    onClose={() => setShowSizingGuide(false)}
                    sector="schools"
                />
            )}

            {/* Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up text-center border border-gray-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {language === 'ar' ? 'تنبيه السلة' : 'Cart Alert'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {language === 'ar'
                                ? 'سلتك الحالية تحتوي على طلبات من قسم آخر. هل تريد إفراغ السلة والبدء في طلب جديد للطلاب؟'
                                : 'Your cart has items from another sector. Clear cart and start a new student order?'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirmConflict}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                            >
                                {language === 'ar' ? 'إفراغ وبدء جديد' : 'Clear & Start New'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Cart Button (Shows only if cart has items) */}
            {totalCartItems > 0 && (
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                    <button
                        onClick={() => router.push('/cart')}
                        className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-105 transition-all duration-300 border border-gray-700"
                    >
                        <div className="relative">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-900">
                                {totalCartItems}
                            </span>
                        </div>
                        <span className="font-bold text-lg">
                            {language === 'ar' ? 'الذهاب إلى السلة' : 'Go to Checkout'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
