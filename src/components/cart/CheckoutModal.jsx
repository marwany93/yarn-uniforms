import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, User, ChevronDown } from 'lucide-react';
import { Country } from 'country-state-city';
import { useLanguage } from '@/hooks/useLanguage';
import { saudiLocations } from '@/data/saudiLocations';

const CheckoutModal = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
    const { language } = useLanguage();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneCode: '+966',
        phone: '',
        street: '',
        building: '',
        district: '',
        regionId: 'riyadh', // Default to Riyadh
        cityId: '', // User will select
        landmark: ''
    });

    const [availableCities, setAvailableCities] = useState([]);
    const [errors, setErrors] = useState({});

    // Update Cities when Region Changes
    useEffect(() => {
        const selectedRegion = saudiLocations.find(r => r.id === formData.regionId);
        if (selectedRegion) {
            setAvailableCities(selectedRegion.cities);
        } else {
            setAvailableCities([]);
        }
    }, [formData.regionId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        // Name
        if (!formData.name.trim()) newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';

        // Email (Strict Regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = language === 'ar' ? 'تنسيق البريد الإلكتروني غير صحيح' : 'Invalid email format';
        }

        // Phone (Digits only, min 8)
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) {
            newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
        } else if (phoneDigits.length < 8) {
            newErrors.phone = language === 'ar' ? 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل' : 'Phone must be at least 8 digits';
        }

        // Address Fields
        if (!formData.street.trim()) newErrors.street = language === 'ar' ? 'اسم الشارع مطلوب' : 'Street name is required';
        if (!formData.building.trim()) newErrors.building = language === 'ar' ? 'رقم المبنى مطلوب' : 'Building number is required';
        if (!formData.district.trim()) newErrors.district = language === 'ar' ? 'الحي مطلوب' : 'District is required';
        if (!formData.regionId) newErrors.regionId = language === 'ar' ? 'المنطقة مطلوبة' : 'Region is required';
        if (!formData.cityId) newErrors.cityId = language === 'ar' ? 'المدينة مطلوبة' : 'City is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const fullPhone = `${formData.phoneCode}${formData.phone}`;
        const selectedRegion = saudiLocations.find(r => r.id === formData.regionId);
        const selectedCity = selectedRegion?.cities.find(c => c.id === formData.cityId);

        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: fullPhone,
            shippingAddress: {
                country: 'Saudi Arabia',
                countryCode: 'SA',
                region: selectedRegion ? (language === 'ar' ? selectedRegion.nameAr : selectedRegion.nameEn) : formData.regionId,
                regionEn: selectedRegion?.nameEn,
                regionAr: selectedRegion?.nameAr,
                city: selectedCity ? (language === 'ar' ? selectedCity.nameAr : selectedCity.nameEn) : formData.cityId,
                cityEn: selectedCity?.nameEn,
                cityAr: selectedCity?.nameAr,
                district: formData.district,
                street: formData.street,
                building: formData.building,
                landmark: formData.landmark || ''
            }
        };

        onSubmit(submissionData);
    };

    if (!isOpen) return null;

    const inputClasses = (error) => `
        w-full p-3 bg-gray-50 border rounded-lg outline-none transition-all
        focus:ring-2 focus:ring-primary/20 focus:border-primary
        ${error ? 'border-red-500' : 'border-gray-200'}
    `;

    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-scale-up"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        {language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Wrapper (Takes remaining height) */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

                    {/* Scrollable Form Content */}
                    <div className="overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        {/* Name */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className={`absolute top-3.5 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`${inputClasses(errors.name)} ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                                    placeholder={language === 'ar' ? 'الاسم الثلاثي' : 'Full Name'}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Phone (Composite) */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                {/* Code (Static for now) */}
                                <div
                                    className="w-[120px] shrink-0 flex items-center justify-center gap-2 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed select-none"
                                    dir="ltr"
                                >
                                    <span className="text-lg leading-none">🇸🇦</span>
                                    <span dir="ltr">+966</span>
                                </div>

                                {/* Number Input */}
                                <div className="relative flex-1">
                                    <Phone className="absolute top-3.5 left-3 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Numbers only
                                            setFormData(prev => ({ ...prev, phone: val }));
                                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                        }}
                                        className={`${inputClasses(errors.phone)} pl-10`}
                                        placeholder="5xxxxxxxx"
                                    />
                                </div>
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1 text-right">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className={`absolute top-3.5 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    dir="ltr"
                                    className={`${inputClasses(errors.email)} ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Separator */}
                        <div className="flex items-center gap-3 py-2">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/5 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                <MapPin size={14} />
                                {language === 'ar' ? 'عنوان التوصيل' : 'Shipping Address'}
                            </div>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* Country (Static) */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'البلد' : 'Country'}
                            </label>
                            <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed flex items-center gap-2">
                                <span>🇸🇦</span>
                                <span>{language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</span>
                            </div>
                        </div>

                        {/* Region & City Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Region */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {language === 'ar' ? 'المنطقة' : 'Region'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="regionId"
                                    value={formData.regionId}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, regionId: e.target.value, cityId: '' }));
                                        if (errors.regionId) setErrors(prev => ({ ...prev, regionId: '' }));
                                    }}
                                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    className="w-full bg-none py-3 pr-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-800 text-sm"
                                >
                                    <option value="" disabled>{language === 'ar' ? 'اختر المنطقة...' : 'Select Region...'}</option>
                                    {saudiLocations.map((region) => (
                                        <option key={region.id} value={region.id}>
                                            {language === 'ar' ? region.nameAr : region.nameEn}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute bottom-3 rtl:left-4 ltr:right-4 pointer-events-none">
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </div>
                                {errors.regionId && <p className="text-red-500 text-xs mt-1">{errors.regionId}</p>}
                            </div>

                            {/* City */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {language === 'ar' ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="cityId"
                                    value={formData.cityId}
                                    onChange={handleChange}
                                    disabled={!formData.regionId}
                                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    className="w-full bg-none py-3 pr-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-800 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="" disabled>{language === 'ar' ? 'اختر المدينة...' : 'Select City...'}</option>
                                    {availableCities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {language === 'ar' ? city.nameAr : city.nameEn}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute bottom-3 rtl:left-4 ltr:right-4 pointer-events-none">
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </div>
                                {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>}
                            </div>
                        </div>

                        {/* District */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'الحي' : 'District'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className={inputClasses(errors.district)}
                                placeholder={language === 'ar' ? 'اسم الحي' : 'District Name'}
                            />
                            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                        </div>

                        {/* Street & Building Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className={labelClasses}>
                                    {language === 'ar' ? 'اسم الشارع' : 'Street'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className={inputClasses(errors.street)}
                                    placeholder={language === 'ar' ? 'اسم الشارع' : 'Street Name'}
                                />
                                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    {language === 'ar' ? 'رقم المبنى' : 'Bldg No'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="building"
                                    value={formData.building}
                                    onChange={handleChange}
                                    className={inputClasses(errors.building)}
                                    placeholder={language === 'ar' ? 'رقم' : 'No'}
                                />
                                {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building}</p>}
                            </div>
                        </div>

                        {/* Landmark */}
                        <div>
                            <label className={labelClasses}>
                                {language === 'ar' ? 'معلم مميز (اختياري)' : 'Landmark / Extra Details (Optional)'}
                            </label>
                            <textarea
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleChange}
                                rows="2"
                                className={inputClasses('') + ' resize-none'}
                                placeholder={language === 'ar' ? 'بالقرب من...' : 'Near...'}
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer Action (Outside Scrollable Area) */}
                    <div className="p-5 border-t border-gray-100 bg-white shrink-0 rounded-b-2xl">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                                </>
                            ) : (
                                language === 'ar' ? 'تأكيد وإرسال الطلب' : 'Confirm & Submit Order'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;