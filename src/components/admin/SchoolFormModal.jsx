'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { schoolProducts, productCategories } from '@/data/schoolProducts';
import Image from 'next/image';

const SchoolFormModal = ({ school, isOpen, onClose }) => {
    const { t, language } = useLanguage();

    // School Details State
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [slug, setSlug] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Assigned Products State
    const [assignedProducts, setAssignedProducts] = useState([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (school) {
            setNameEn(school.name?.en || '');
            setNameAr(school.name?.ar || '');
            setSlug(school.slug || '');
            setLogoPreview(school.logo || null);
            setLogoFile(null);
            setAssignedProducts(school.assignedProducts || []);
        } else {
            resetForm();
        }
        setError('');
    }, [school, isOpen]);

    const resetForm = () => {
        setNameEn('');
        setNameAr('');
        setSlug('');
        setLogoPreview(null);
        setLogoFile(null);
        setAssignedProducts([]);
    };

    // --- Handlers ---

    const handleNameEnChange = (e) => {
        const val = e.target.value;
        setNameEn(val);
        if (!school) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = () => {
        setAssignedProducts([...assignedProducts, {
            productId: '',
            price: 0,
            allowedStage: 'all',
            fixedDetails: {
                color: '',
                fabric: '',
                logoType: 'embroidery',
                logoPlacement: 'chest'
            }
        }]);
    };

    const handleRemoveProduct = (index) => {
        const newProducts = [...assignedProducts];
        newProducts.splice(index, 1);
        setAssignedProducts(newProducts);
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...assignedProducts];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            newProducts[index][parent] = { ...newProducts[index][parent], [child]: value };
        } else {
            newProducts[index][field] = value;
        }
        setAssignedProducts(newProducts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            let logoUrl = school?.logo || '';

            if (logoFile) {
                const storageRef = ref(storage, `schools_logos/${slug}-${Date.now()}-${logoFile.name}`);
                const snapshot = await uploadBytes(storageRef, logoFile);
                logoUrl = await getDownloadURL(snapshot.ref);
            }

            const schoolData = {
                name: { en: nameEn, ar: nameAr },
                slug: slug,
                logo: logoUrl,
                assignedProducts: assignedProducts.filter(p => p.productId), // Remove empty rows
                updatedAt: serverTimestamp()
            };

            if (school) {
                await updateDoc(doc(db, 'schools', school.id), schoolData);
            } else {
                schoolData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'schools'), schoolData);
            }

            onClose();
        } catch (err) {
            console.error('Error saving school:', err);
            setError('Failed to save school. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const translations = {
        titleAdd: { en: 'Add New School', ar: 'إضافة مدرسة جديدة' },
        titleEdit: { en: 'Edit School', ar: 'تعديل بيانات المدرسة' },
        cancel: { en: 'Cancel', ar: 'إلغاء' },
        save: { en: 'Save School', ar: 'حفظ المدرسة' },
        saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
        basicInfo: { en: 'Basic Information', ar: 'البيانات الأساسية' },
        manageProducts: { en: 'Manage Products', ar: 'إدارة المنتجات' },
        addProduct: { en: '+ Add Product', ar: '+ إضافة منتج' },
        product: { en: 'Product', ar: 'المنتج' },
        price: { en: 'Price (SAR)', ar: 'السعر (ريال)' },
        details: { en: 'Fixed Details', ar: 'المواصفات الثابتة' },
        color: { en: 'Color Code', ar: 'كود اللون' },
        fabric: { en: 'Fabric', ar: 'نوع القماش' },
        logoType: { en: 'Logo Type', ar: 'نوع الشعار' },
        remove: { en: 'Remove', ar: 'إزالة' },
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">
                                {school ? t(translations.titleEdit) : t(translations.titleAdd)}
                            </h3>

                            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                            <div className="space-y-8">
                                {/* Section 1: Basic Info */}
                                <div>
                                    <h4 className="text-base font-semibold text-primary-700 mb-4 flex items-center gap-2">
                                        <span className="bg-primary-100 p-1 rounded">🏫</span> {t(translations.basicInfo)}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">English Name</label>
                                            <input type="text" required value={nameEn} onChange={handleNameEnChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Arabic Name</label>
                                            <input type="text" required value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2" dir="rtl" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">/students/</span>
                                                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 border p-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Logo</label>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden border">
                                                    {logoPreview && <Image src={logoPreview} alt="Preview" width={40} height={40} className="object-contain w-full h-full" />}
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Assigned Products */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-base font-semibold text-primary-700 flex items-center gap-2">
                                            <span className="bg-primary-100 p-1 rounded">👕</span> {t(translations.manageProducts)}
                                        </h4>
                                        <button type="button" onClick={handleAddProduct} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 border border-green-200 transition-colors">
                                            {t(translations.addProduct)}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {assignedProducts.map((item, index) => {
                                            const product = schoolProducts.find(p => p.id === item.productId);
                                            return (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="absolute top-2 right-2 rtl:left-2 rtl:right-auto text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                        {/* Product Select */}
                                                        <div className="md:col-span-4">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Product</label>
                                                            <div className="flex items-center gap-2">
                                                                {product && (
                                                                    <div className="w-8 h-8 rounded border bg-white shrink-0 overflow-hidden">
                                                                        <Image src={product.image} alt="" width={32} height={32} className="object-contain w-full h-full" />
                                                                    </div>
                                                                )}
                                                                <select
                                                                    value={item.productId}
                                                                    onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                                                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                                                >
                                                                    <option value="">Select Product...</option>
                                                                    {productCategories.map(cat => (
                                                                        <optgroup key={cat.id} label={language === 'ar' ? cat.nameAr : cat.name}>
                                                                            {schoolProducts.filter(p => p.category === cat.id).map(p => (
                                                                                <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.name}</option>
                                                                            ))}
                                                                        </optgroup>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                                                            <input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => handleProductChange(index, 'price', Number(e.target.value))}
                                                                className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                                                min="0"
                                                            />
                                                        </div>

                                                        {/* Fixed Details (Color/Fabric) */}
                                                        <div className="md:col-span-6 grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Color Code</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Navy Blue #000080"
                                                                    value={item.fixedDetails?.color || ''}
                                                                    onChange={(e) => handleProductChange(index, 'fixedDetails.color', e.target.value)}
                                                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 border p-2"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Fabric</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Cotton 100%"
                                                                    value={item.fixedDetails?.fabric || ''}
                                                                    onChange={(e) => handleProductChange(index, 'fixedDetails.fabric', e.target.value)}
                                                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 border p-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {assignedProducts.length === 0 && (
                                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                No products assigned yet. Click &quot;Add Product&quot; to start.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? t(translations.saving) : t(translations.save)}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                {t(translations.cancel)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolFormModal;
