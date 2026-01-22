'use client';
import { useState, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation'; // <--- Added import
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import generateOrderId from '@/lib/generateOrderId';

export default function DynamicForm({ sector, onSubmitSuccess }) {
    const { t, language } = useLanguage();
    const router = useRouter(); // <--- Added hook
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        uniform_type: '',
        quantity: 1,
        size_breakdown: '',
        notes: '',
        file: null
    });

    const [errors, setErrors] = useState({});

    // Validation Logic
    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = language === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid email address';
        }
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = language === 'ar' ? 'رقم الهاتف غير صحيح (أرقام فقط)' : 'Invalid phone number';
        }
        if (!formData.name.trim()) newErrors.name = language === 'ar' ? 'مطلوب' : 'Required';
        if (!formData.contact_person.trim()) newErrors.contact_person = language === 'ar' ? 'مطلوب' : 'Required';
        if (!formData.uniform_type) newErrors.uniform_type = language === 'ar' ? 'مطلوب' : 'Required';
        if (formData.quantity < 1) newErrors.quantity = language === 'ar' ? 'الحد الأدنى 1' : 'Min quantity is 1';
        if (!formData.size_breakdown.trim()) newErrors.size_breakdown = language === 'ar' ? 'مطلوب' : 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            let fileUrl = null;
            let fileName = null;

            if (formData.file) {
                const storage = getStorage();
                const storageRef = ref(storage, `uploads/${Date.now()}_${formData.file.name}`);
                await uploadBytes(storageRef, formData.file);
                fileUrl = await getDownloadURL(storageRef);
                fileName = formData.file.name;
            }

            const orderId = await generateOrderId();

            await addDoc(collection(db, 'orders'), {
                orderId,
                sector,
                formData: {
                    ...formData,
                    file: fileUrl ? { name: fileName, url: fileUrl } : null
                },
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // --- CRITICAL FIX: FORCE REDIRECT ---
            // If parent provided a callback, use it. Otherwise, redirect manually.
            if (onSubmitSuccess) {
                onSubmitSuccess(orderId);
            } else {
                router.push(`/track?id=${orderId}`);
            }
            // ------------------------------------

        } catch (error) {
            console.error("Error submitting order:", error);
            alert(language === 'ar' ? 'حدث خطأ أثناء الإرسال' : 'Error submitting order');
            setLoading(false); // Only stop loading on error. On success, keep loading until redirect happens.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Name & Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'اسم الجهة / المدرسة' : 'Company / School Name'} <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'الشخص المسؤول' : 'Contact Person'} <span className="text-red-500">*</span></label>
                    <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.contact_person ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`} />
                    {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>}
                </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`} dir="ltr" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`} dir="ltr" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* Uniform Type & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'نوع الزي' : 'Uniform Type'} <span className="text-red-500">*</span></label>
                    <select name="uniform_type" value={formData.uniform_type} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.uniform_type ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white`}>
                        <option value="">{language === 'ar' ? 'اختر النوع' : 'Select Type'}</option>
                        <option value="Boys Uniform">Boys Uniform</option>
                        <option value="Girls Uniform">Girls Uniform</option>
                        <option value="Sports Wear">Sports Wear</option>
                        <option value="Staff Uniform">Staff Uniform</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.uniform_type && <p className="text-red-500 text-xs mt-1">{errors.uniform_type}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'الكمية الإجمالية' : 'Total Quantity'} <span className="text-red-500">*</span></label>
                    <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
            </div>

            {/* Size Breakdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'تفاصيل المقاسات' : 'Size Breakdown'} <span className="text-red-500">*</span></label>
                <textarea name="size_breakdown" rows="3" value={formData.size_breakdown} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.size_breakdown ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`} placeholder="e.g. S: 10, M: 20, L: 5"></textarea>
                {errors.size_breakdown && <p className="text-red-500 text-xs mt-1">{errors.size_breakdown}</p>}
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'الشعار وتصميم مرجعي' : 'Logo and Design Reference'} <span className="text-gray-400 font-normal">({language === 'ar' ? 'اختياري' : 'Optional'})</span></label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                <div onClick={triggerFileUpload} className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all group">
                    {formData.file ? (
                        <div className="flex items-center text-primary-600">
                            <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-medium">{formData.file.name}</span>
                        </div>
                    ) : (
                        <>
                            <svg className="w-10 h-10 text-gray-400 group-hover:text-primary-500 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p className="text-sm text-gray-500 group-hover:text-primary-600 font-medium">{language === 'ar' ? 'اضغط لرفع ملف' : 'Click to upload file'}</p>
                            <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
                <textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all"></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-xl'}`}>
                {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (language === 'ar' ? 'إرسال الطلب' : 'Submit Order')}
            </button>
        </form>
    );
}
