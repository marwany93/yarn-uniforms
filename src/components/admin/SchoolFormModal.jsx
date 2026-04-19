'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { schoolProducts, productCategories } from '@/data/schoolProducts';
import Image from 'next/image';
import Papa from 'papaparse';
import { Upload, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, Users } from 'lucide-react';


const SchoolFormModal = ({ school, isOpen, onClose }) => {
    const { t, language } = useLanguage();

    // School Details State
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [slug, setSlug] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // --- Students State & Logic ---
    const [existingStudents, setExistingStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    const normalizeArabic = (text) => {
        if (!text) return '';
        return text
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[\u064B-\u065F]/g, '')
            .replace(/ـ/g, '')
            .toLowerCase()
            .trim();
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (school?.id && isOpen) {
                setIsLoadingStudents(true);
                try {
                    const q = query(collection(db, 'students'), where('schoolId', '==', school.id));
                    const snapshot = await getDocs(q);
                    const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setExistingStudents(studentsList);
                } catch (error) {
                    console.error('Error fetching students:', error);
                } finally {
                    setIsLoadingStudents(false);
                }
            } else {
                setExistingStudents([]);
            }
        };
        fetchStudents();
    }, [school, isOpen]);


    const filteredStudents = existingStudents.filter(student => {
        if (!studentSearchTerm) return true;
        const search = normalizeArabic(studentSearchTerm);
        const name = normalizeArabic(student.name || '');
        const id = (student.nationalId || '').toLowerCase();
        return name.includes(search) || id.includes(studentSearchTerm.toLowerCase());
    });

    // Assigned Products State
    const [assignedProducts, setAssignedProducts] = useState([]);

    // Per-product image upload state: { [index]: { file, preview, uploading } }
    const [productImageState, setProductImageState] = useState({});

    // Student Roster State
    const [rosterFile, setRosterFile] = useState(null);
    const [parsedStudents, setParsedStudents] = useState([]);
    const [rosterError, setRosterError] = useState('');
    const [isUploadingRoster, setIsUploadingRoster] = useState(false);
    const [rosterUploadResult, setRosterUploadResult] = useState(null); // { added, skipped }
    const [rosterExpanded, setRosterExpanded] = useState(false);
    const rosterInputRef = useRef(null);

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
        setParsedStudents([]);
        setRosterFile(null);
        setRosterError('');
        setRosterUploadResult(null);
        setProductImageState({});
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
            price: '',
            customPrice: '',
            customImage: '',
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
        // Clean up image state for removed index
        const newImageState = { ...productImageState };
        delete newImageState[index];
        setProductImageState(newImageState);
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

    // --- Product Image Upload ---
    const handleProductImageChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProductImageState(prev => ({
                ...prev,
                [index]: { file, preview: reader.result, uploading: false }
            }));
        };
        reader.readAsDataURL(file);

        // Upload immediately to Firebase Storage
        setProductImageState(prev => ({ ...prev, [index]: { ...prev[index], uploading: true } }));
        try {
            const schoolSlug = slug || school?.slug || 'school';
            const productId = assignedProducts[index]?.productId || `product_${index}`;
            const storageRef = ref(storage, `schools_uniforms/${schoolSlug}/${productId}-${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            // Store URL in assignedProducts
            handleProductChange(index, 'customImage', url);
            setProductImageState(prev => ({
                ...prev,
                [index]: { file, preview: reader.result, uploading: false, url }
            }));
        } catch (err) {
            console.error('Product image upload failed:', err);
            setProductImageState(prev => ({
                ...prev,
                [index]: { ...prev[index], uploading: false, error: 'Upload failed' }
            }));
        }
    };

    // --- CSV Upload ---
    const handleRosterFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRosterFile(file);
        setRosterError('');
        setParsedStudents([]);
        setRosterUploadResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Normalize headers — allow different capitalizations
                const rows = results.data.map(row => {
                    const normalized = {};
                    Object.entries(row).forEach(([k, v]) => {
                        normalized[k.toLowerCase().trim()] = v?.toString().trim();
                    });
                    return normalized;
                });

                // Validate required columns
                const valid = rows.filter(r => r['name'] && r['nationalid']);
                if (valid.length === 0) {
                    setRosterError(
                        language === 'ar'
                            ? 'ملف CSV لا يحتوي على أعمدة صحيحة. يجب أن يحتوي على: Name, NationalID'
                            : 'CSV has no valid rows. Required columns: Name, NationalID'
                    );
                    return;
                }
                setParsedStudents(valid);
            },
            error: (err) => {
                setRosterError(language === 'ar' ? 'فشل تحليل الملف.' : 'Failed to parse CSV file.');
            }
        });
    };

    const handleRosterUpload = async () => {
        if (!parsedStudents.length) return;
        const currentSchoolId = school?.id;
        if (!currentSchoolId) {
            setRosterError(language === 'ar' ? 'يجب حفظ المدرسة أولاً قبل رفع القائمة.' : 'Save the school first before uploading a roster.');
            return;
        }

        setIsUploadingRoster(true);
        setRosterError('');

        try {
            const batch = writeBatch(db);
            let added = 0;
            let skipped = 0;

            for (const row of parsedStudents) {
                const nationalId = row['nationalid'];
                const name = row['name'];

                if (!nationalId || !name) { skipped++; continue; }

                // Use nationalId+schoolId as document ID for upsert (overwrite duplicate)
                const docId = `${currentSchoolId}_${nationalId}`;
                const studentRef = doc(db, 'students', docId);
                batch.set(studentRef, {
                    name,
                    nationalId,
                    schoolId: currentSchoolId,
                    updatedAt: serverTimestamp()
                }, { merge: true }); // merge: true = upsert (overwrite if exists)
                added++;
            }

            await batch.commit();
            setRosterUploadResult({ added, skipped });
            setParsedStudents([]);
            setRosterFile(null);
            if (rosterInputRef.current) rosterInputRef.current.value = '';
        } catch (err) {
            console.error('Roster upload error:', err);
            setRosterError(language === 'ar' ? 'فشل رفع القائمة. حاول مرة أخرى.' : 'Failed to upload roster. Please try again.');
        } finally {
            setIsUploadingRoster(false);
        }
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
                assignedProducts: assignedProducts.filter(p => p.productId),
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
        remove: { en: 'Remove', ar: 'إزالة' },
        roster: { en: 'Student Roster', ar: 'قائمة الطلاب' },
        rosterHint: { en: 'Upload a CSV with columns: Name, NationalID', ar: 'ارفع ملف CSV بأعمدة: Name, NationalID' },
        uploadRoster: { en: 'Upload Roster', ar: 'رفع القائمة' },
        uploadingRoster: { en: 'Uploading...', ar: 'جاري الرفع...' },
        rosterPreview: { en: 'Preview', ar: 'معاينة' },
        confirmUpload: { en: 'Confirm & Save to Firestore', ar: 'تأكيد وحفظ في قاعدة البيانات' },
        customPrice: { en: 'Custom Price (Override)', ar: 'سعر مخصص (يلغي الافتراضي)' },
        schoolImage: { en: 'School Uniform Photo', ar: 'صورة الزي للمدرسة' },
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
                                            const imgState = productImageState[index];
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

                                                        {/* Default Price */}
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                                                            <input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => handleProductChange(index, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                                                                className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                                                min="1"
                                                                required
                                                            />
                                                        </div>

                                                        {/* Custom Price Override */}
                                                        <div className="md:col-span-2 hidden">
                                                            <label className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1 block">{t(translations.customPrice)}</label>
                                                            <input
                                                                type="number"
                                                                value={item.customPrice || ''}
                                                                onChange={(e) => handleProductChange(index, 'customPrice', e.target.value ? Number(e.target.value) : '')}
                                                                placeholder={language === 'ar' ? 'اختياري' : 'Optional'}
                                                                className="block w-full text-sm border-amber-200 bg-amber-50 rounded-md focus:ring-amber-400 focus:border-amber-400 border p-2 placeholder:text-amber-400"
                                                                min="0"
                                                            />
                                                        </div>

                                                        {/* Fixed Details (Color / Fabric) */}
                                                        <div className="md:col-span-4 grid grid-cols-2 gap-2 hidden">
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
                                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block hidden">Fabric</label>
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

                                                    {/* School-Specific Uniform Image */}
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 block">
                                                            📸 {t(translations.schoolImage)}
                                                        </label>
                                                        <div className="flex items-center gap-4">
                                                            {/* Current image preview */}
                                                            <div className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                                                                {(item.customImage || imgState?.preview) ? (
                                                                    <Image
                                                                        src={item.customImage || imgState?.preview}
                                                                        alt=""
                                                                        width={64}
                                                                        height={64}
                                                                        className="object-contain w-full h-full"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs text-center">No image</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleProductImageChange(index, e)}
                                                                    className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                                />
                                                                {imgState?.uploading && (
                                                                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                        {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                                                                    </div>
                                                                )}
                                                                {item.customImage && !imgState?.uploading && (
                                                                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        {language === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {item.customImage && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleProductChange(index, 'customImage', '')}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Remove image"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
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

                                {/* --- Section 3: إدارة الطلاب ورفع الـ CSV (Student Roster) --- */}
                                <div className="mt-10 pt-8 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Users className="w-6 h-6 text-primary-600" />
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {language === 'ar' ? 'إدارة قائمة الطلاب' : 'Student Roster Management'}
                                        </h3>
                                    </div>

                                    {/* 1. تنبيه للمدارس الجديدة */}
                                    {!school?.id && (
                                        <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6 flex items-center gap-3">
                                            <span className="text-2xl">⚠️</span>
                                            <p>{language === 'ar' ? 'يجب حفظ بيانات المدرسة أولاً قبل أن تتمكن من رفع أو إدارة قائمة الطلاب.' : 'Save the school first before uploading or managing the student roster.'}</p>
                                        </div>
                                    )}

                                    {/* 2. منطقة رفع الملف (Dropzone) */}
                                    {school?.id && (
                                        <div className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl p-6 mb-8 text-center transition-all hover:bg-primary-100/50">
                                            <div className="mb-3 p-3 bg-white rounded-full inline-block shadow-sm">
                                                <Upload className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 mb-1">
                                                {language === 'ar' ? 'رفع قائمة طلاب جديدة (ملف CSV)' : 'Upload New Student Roster (CSV File)'}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                {t(translations.rosterHint)} <br />
                                                {language === 'ar' ? 'يجب أن يحتوي الملف على عمودين: Name, NationalID' : 'File must contain exactly two columns: Name, NationalID'}
                                            </p>

                                            <input
                                                ref={rosterInputRef}
                                                type="file"
                                                accept=".csv"
                                                onChange={handleRosterFileChange}
                                                className="block w-full max-w-sm mx-auto text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 transition-all cursor-pointer shadow-sm"
                                            />

                                            {/* Roster Error Message */}
                                            {rosterError && (
                                                <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                                    {rosterError}
                                                </div>
                                            )}

                                            {/* Roster Success Message */}
                                            {rosterUploadResult && (
                                                <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 font-medium flex justify-center items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {rosterUploadResult.added} {language === 'ar' ? 'طالب تم إضافتهم بنجاح!' : 'students uploaded successfully!'}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. مراجعة الملف قبل التأكيد (Preview) */}
                                    {school?.id && parsedStudents.length > 0 && (
                                        <div className="mb-8 p-5 bg-white border-2 border-primary-100 rounded-2xl shadow-sm">
                                            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
                                                <span>{t(translations.rosterPreview)}</span>
                                                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs">
                                                    {parsedStudents.length} {language === 'ar' ? 'طالب جاهز للرفع' : 'students ready'}
                                                </span>
                                            </p>

                                            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 mb-4">
                                                <table className="w-full text-xs text-left rtl:text-right">
                                                    <thead className="bg-gray-100 sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-2 text-gray-500 font-semibold">#</th>
                                                            <th className="px-3 py-2 text-gray-500 font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                                                            <th className="px-3 py-2 text-gray-500 font-semibold">{language === 'ar' ? 'الهوية' : 'National ID'}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {parsedStudents.slice(0, 10).map((s, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                                                                <td className="px-3 py-1.5 font-medium text-gray-800">{s['name']}</td>
                                                                <td className="px-3 py-1.5 font-mono text-gray-600" dir="ltr">{s['nationalid']}</td>
                                                            </tr>
                                                        ))}
                                                        {parsedStudents.length > 10 && (
                                                            <tr>
                                                                <td colSpan={3} className="px-3 py-2 text-center text-gray-400 italic">
                                                                    +{parsedStudents.length - 10} {language === 'ar' ? 'إضافيين...' : 'more...'}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRosterUpload}
                                                disabled={isUploadingRoster}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-md"
                                            >
                                                {isUploadingRoster
                                                    ? <><Loader2 className="w-5 h-5 animate-spin" />{t(translations.uploadingRoster)}</>
                                                    : <><Upload className="w-5 h-5" />{t(translations.confirmUpload)}</>
                                                }
                                            </button>
                                        </div>
                                    )}

                                    {/* 4. جدول الطلاب الحاليين مع البحث */}
                                    {school?.id && (
                                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                                                <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                                    {language === 'ar' ? 'الطلاب المسجلين بالفعل' : 'Currently Enrolled Students'}
                                                    <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-bold">
                                                        {existingStudents.length}
                                                    </span>
                                                </h5>
                                                <div className="w-full sm:w-1/2">
                                                    <input
                                                        type="text"
                                                        placeholder={language === 'ar' ? 'ابحث بالاسم أو الرقم...' : 'Search by name or ID...'}
                                                        value={studentSearchTerm}
                                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-72 overflow-y-auto">
                                                {isLoadingStudents ? (
                                                    <div className="p-8 text-center text-gray-500">
                                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                                                        {language === 'ar' ? 'جاري جلب الطلاب...' : 'Loading students...'}
                                                    </div>
                                                ) : filteredStudents.length > 0 ? (
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-white sticky top-0 shadow-sm z-10">
                                                            <tr>
                                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50/90 backdrop-blur-sm">#</th>
                                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50/90 backdrop-blur-sm">{language === 'ar' ? 'اسم الطالب' : 'Name'}</th>
                                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50/90 backdrop-blur-sm">{language === 'ar' ? 'الرقم الوطني / الإقامة' : 'National ID'}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {filteredStudents.map((student, idx) => (
                                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
                                                                    <td className="px-6 py-3 text-sm font-bold text-gray-900">{student.name}</td>
                                                                    <td className="px-6 py-3 text-sm text-gray-600 font-mono">{student.nationalId}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-8 text-center text-gray-500 text-sm bg-gray-50/50">
                                                        {studentSearchTerm
                                                            ? (language === 'ar' ? 'لا توجد نتائج تطابق بحثك.' : 'No results found.')
                                                            : (language === 'ar' ? 'لا يوجد طلاب مسجلين حتى الآن.' : 'No students enrolled yet.')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* --- نهاية قسم الطلاب --- */}
                            </div>
                        </div>

                        {/* Footer (أزرار الحفظ والإلغاء) */}
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
