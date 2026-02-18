'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

const SchoolModal = ({ school, isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [slug, setSlug] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (school) {
            setNameEn(school.name?.en || '');
            setNameAr(school.name?.ar || '');
            setSlug(school.slug || '');
            setLogoPreview(school.logo || null);
            setLogoFile(null);
        } else {
            setNameEn('');
            setNameAr('');
            setSlug('');
            setLogoPreview(null);
            setLogoFile(null);
        }
        setError('');
    }, [school, isOpen]);

    // Auto-generate slug from English name if not manually edited
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
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            let logoUrl = school?.logo || '';

            if (logoFile) {
                const storageRef = ref(storage, `schools/${slug}-${Date.now()}-${logoFile.name}`);
                const snapshot = await uploadBytes(storageRef, logoFile);
                logoUrl = await getDownloadURL(snapshot.ref);
            }

            const schoolData = {
                name: {
                    en: nameEn,
                    ar: nameAr
                },
                slug: slug,
                logo: logoUrl,
                updatedAt: serverTimestamp()
            };

            if (school) {
                // Update existing
                const schoolRef = doc(db, 'schools', school.id);
                await updateDoc(schoolRef, schoolData);
            } else {
                // Create new
                schoolData.createdAt = serverTimestamp();
                schoolData.assignedProducts = []; // Initialize empty array
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
        save: { en: 'Save', ar: 'حفظ' },
        saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
        nameEn: { en: 'School Name (English)', ar: 'اسم المدرسة (إنجليزي)' },
        nameAr: { en: 'School Name (Arabic)', ar: 'اسم المدرسة (عربي)' },
        slug: { en: 'URL Slug', ar: 'الرابط المختصر' },
        logo: { en: 'School Logo', ar: 'شعار المدرسة' },
        upload: { en: 'Click to upload', ar: 'اضغط للتحميل' },
        dragDrop: { en: 'or drag and drop', ar: 'أو اسحب وأفلت' },
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left rtl:text-right w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {school ? t(translations.titleEdit) : t(translations.titleAdd)}
                                    </h3>

                                    {error && (
                                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4">
                                        {/* Name English */}
                                        <div>
                                            <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700">
                                                {t(translations.nameEn)}
                                            </label>
                                            <input
                                                type="text"
                                                id="nameEn"
                                                required
                                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                                value={nameEn}
                                                onChange={handleNameEnChange}
                                            />
                                        </div>

                                        {/* Name Arabic */}
                                        <div>
                                            <label htmlFor="nameAr" className="block text-sm font-medium text-gray-700">
                                                {t(translations.nameAr)}
                                            </label>
                                            <input
                                                type="text"
                                                id="nameAr"
                                                required
                                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                                value={nameAr}
                                                onChange={(e) => setNameAr(e.target.value)}
                                                dir="rtl"
                                            />
                                        </div>

                                        {/* Slug */}
                                        <div>
                                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                                {t(translations.slug)}
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    /students/
                                                </span>
                                                <input
                                                    type="text"
                                                    id="slug"
                                                    required
                                                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 border py-2 px-3"
                                                    value={slug}
                                                    onChange={(e) => setSlug(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Logo Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t(translations.logo)}
                                            </label>
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                                <div className="shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                                    {logoPreview ? (
                                                        <Image
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            width={64}
                                                            height={64}
                                                            className="object-contain w-full h-full p-1"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No Logo</span>
                                                    )}
                                                </div>
                                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                                    <span>{t(translations.upload)}</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? t(translations.saving) : t(translations.save)}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default SchoolModal;
