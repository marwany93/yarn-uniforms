'use client';
import React, { useState } from 'react';
import { Mail, CheckCircle, Send } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function ContactPage() {
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        school: '',
        phone: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    const translations = {
        title: {
            ar: 'تواصل معنا',
            en: 'Contact Us'
        },
        subtitle: {
            ar: 'نحن هنا لمساعدتك والإجابة على استفساراتك',
            en: 'We are here to help and answer any questions you might have'
        },
        contactInfo: {
            ar: 'معلومات التواصل',
            en: 'Contact Information'
        },
        formTitle: {
            ar: 'أرسل رسالة',
            en: 'Send a Message'
        },
        name: {
            ar: 'الاسم الكامل',
            en: 'Full Name'
        },
        school: {
            ar: 'اسم المدرسة / الشركة',
            en: 'School / Company Name'
        },
        phone: {
            ar: 'رقم الهاتف',
            en: 'Phone Number'
        },
        email: {
            ar: 'البريد الإلكتروني',
            en: 'Email Address'
        },
        message: {
            ar: 'طبيعة الاستفسار أو رسالتك',
            en: 'Your Message'
        },
        send: {
            ar: 'إرسال',
            en: 'Send'
        },
        sending: {
            ar: 'جاري الإرسال...',
            en: 'Sending...'
        },
        successTitle: {
            ar: 'تم الاستلام بنجاح',
            en: 'Message Received Successfully'
        },
        successDesc: {
            ar: 'شكراً لتواصلك معنا! سيقوم فريقنا بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.',
            en: 'Thank you for reaching out! Our team will review your message and get back to you as soon as possible.'
        },
        sendAnother: {
            ar: 'إرسال رسالة أخرى',
            en: 'Send Another Message'
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validation ---
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';

        if (!formData.email) {
            newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
        }

        if (!formData.phone) {
            newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
        } else if (formData.phone.length < 10) {
            newErrors.phone = language === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
        }

        if (!formData.message.trim()) newErrors.message = language === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'CONTACT_FORM',
                    customerName: formData.name,
                    schoolName: formData.school,
                    phone: formData.phone,
                    to: formData.email,
                    message: formData.message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setIsSuccess(true);
            setFormData({ name: '', school: '', phone: '', email: '', message: '' });
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(language === 'ar' ? 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقاً.' : 'Failed to send message. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4">
                        {translations.title[language]}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {translations.subtitle[language]}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Card */}
                    <div className="lg:col-span-1 border border-gray-100 bg-white rounded-2xl shadow-sm p-8 h-fit">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                            {translations.contactInfo[language]}
                        </h3>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-full text-primary shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{translations.email[language]}</p>
                                    <a href="mailto:info@yarnuniforms.com" className="text-gray-900 font-semibold hover:text-primary transition-colors" dir="ltr">
                                        info@yarnuniforms.com
                                    </a>
                                </div>
                            </div>

                            {/* We can add phone and address here later when provided */}
                        </div>
                    </div>

                    {/* Contact Form Card */}
                    <div className="lg:col-span-2 border border-gray-100 bg-white rounded-2xl shadow-sm p-8">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                                <div className="p-4 bg-green-50 rounded-full mb-6">
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {translations.successTitle[language]}
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                                    {translations.successDesc[language]}
                                </p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    {translations.sendAnother[language]}
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    {translations.formTitle[language]}
                                </h3>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {translations.name[language]} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                            />
                                        </div>

                                        {/* School/Company */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {language === 'ar' ? 'اسم المدرسة / الشركة' : 'School / Company Name'} <span className="text-gray-400 font-normal text-xs">{language === 'ar' ? '(اختياري)' : '(Optional)'}</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="school"
                                                value={formData.school}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex direction-ltr" style={{ direction: 'ltr' }}>
                                                <div className={`phone-input-wrapper bg-gray-50 w-full px-4 py-3 border rounded-xl focus-within:ring-2 focus-within:bg-white focus-within:ring-primary/20 focus-within:border-primary transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} style={{ direction: 'ltr' }}>
                                                    <PhoneInput
                                                        international
                                                        defaultCountry="SA"
                                                        countryCallingCodeEditable={false}
                                                        value={formData.phone}
                                                        onChange={(val) => {
                                                            setFormData({ ...formData, phone: val });
                                                            if (errors.phone) setErrors({ ...errors, phone: null });
                                                        }}
                                                        className="flex items-center gap-3"
                                                        numberInputProps={{
                                                            className: "w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 focus:ring-0 border-none p-0"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {translations.email[language]} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                dir="ltr"
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none text-left ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            {translations.message[language]} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none resize-y ${errors.message ? 'border-red-500' : 'border-gray-200'}`}
                                        ></textarea>
                                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-[#151b60] text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                {translations.sending[language]}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                {translations.send[language]}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
