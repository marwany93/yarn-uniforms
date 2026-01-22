/**
 * Dynamic Questions Configuration for Yarn Uniforms
 * 
 * Edit this file to modify questions for each sector.
 * Each sector has an array of question objects with bilingual support.
 * 
 * Field Types:
 * - text: Single line text input
 * - textarea: Multi-line text input
 * - number: Numeric input
 * - email: Email input with validation
 * - tel: Phone number input
 * - select: Dropdown selection
 * - radio: Radio button group
 * - checkbox: Checkbox group
 * - file: File upload (images/documents)
 * - date: Date picker
 */

const questionsConfig = {
    // SCHOOLS SECTOR
    schools: [
        {
            id: 'school_name',
            type: 'text',
            required: true,
            label: {
                en: 'School Name',
                ar: 'اسم المدرسة'
            },
            placeholder: {
                en: 'Enter school name',
                ar: 'أدخل اسم المدرسة'
            }
        },
        {
            id: 'contact_person',
            type: 'text',
            required: true,
            label: {
                en: 'Contact Person',
                ar: 'الشخص المسؤول'
            },
            placeholder: {
                en: 'Full name',
                ar: 'الاسم الكامل'
            }
        },
        {
            id: 'email',
            type: 'email',
            required: true,
            label: {
                en: 'Email Address',
                ar: 'البريد الإلكتروني'
            },
            placeholder: {
                en: 'email@example.com',
                ar: 'email@example.com'
            }
        },
        {
            id: 'phone',
            type: 'tel',
            required: true,
            label: {
                en: 'Phone Number',
                ar: 'رقم الهاتف'
            },
            placeholder: {
                en: '+966 5X XXX XXXX',
                ar: '٠٥٠٠٠٠٠٠٠٠'
            }
        },
        {
            id: 'uniform_type',
            type: 'select',
            required: true,
            label: {
                en: 'Uniform Type',
                ar: 'نوع الزي'
            },
            options: [
                { value: 'boys', label: { en: 'Boys Uniform', ar: 'زي الأولاد' } },
                { value: 'girls', label: { en: 'Girls Uniform', ar: 'زي البنات' } },
                { value: 'both', label: { en: 'Both', ar: 'كلاهما' } }
            ]
        },
        {
            id: 'quantity',
            type: 'number',
            required: true,
            label: {
                en: 'Total Quantity',
                ar: 'الكمية الإجمالية'
            },
            placeholder: {
                en: 'Number of uniforms',
                ar: 'عدد الأزياء'
            },
            min: 1
        },
        {
            id: 'sizes',
            type: 'textarea',
            required: true,
            label: {
                en: 'Size Breakdown',
                ar: 'توزيع المقاسات'
            },
            placeholder: {
                en: 'Example: Small (50), Medium (100), Large (50)',
                ar: 'مثال: صغير (٥٠)، متوسط (١٠٠)، كبير (٥٠)'
            },
            rows: 3
        },
        {
            id: 'design_reference',
            type: 'file',
            required: false,
            accept: 'image/*,.pdf',
            label: {
                en: 'Design Reference (Optional)',
                ar: 'صورة التصميم (اختياري)'
            },
            description: {
                en: 'Upload images or PDF of desired uniform design',
                ar: 'ارفع صور أو ملف PDF للتصميم المطلوب'
            }
        },
        {
            id: 'delivery_date',
            type: 'date',
            required: true,
            label: {
                en: 'Required Delivery Date',
                ar: 'تاريخ التسليم المطلوب'
            }
        },
        {
            id: 'additional_notes',
            type: 'textarea',
            required: false,
            label: {
                en: 'Additional Notes',
                ar: 'ملاحظات إضافية'
            },
            placeholder: {
                en: 'Any special requirements or notes',
                ar: 'أي متطلبات أو ملاحظات خاصة'
            },
            rows: 4
        }
    ],

    // FACTORIES SECTOR
    factories: [
        {
            id: 'company_name',
            type: 'text',
            required: true,
            label: {
                en: 'Factory Name',
                ar: 'اسم المصنع'
            },
            placeholder: {
                en: 'Enter factory name',
                ar: 'أدخل اسم المصنع'
            }
        },
        {
            id: 'contact_person',
            type: 'text',
            required: true,
            label: {
                en: 'Contact Person',
                ar: 'الشخص المسؤول'
            },
            placeholder: {
                en: 'Full name',
                ar: 'الاسم الكامل'
            }
        },
        {
            id: 'email',
            type: 'email',
            required: true,
            label: {
                en: 'Email Address',
                ar: 'البريد الإلكتروني'
            },
            placeholder: {
                en: 'email@example.com',
                ar: 'email@example.com'
            }
        },
        {
            id: 'phone',
            type: 'tel',
            required: true,
            label: {
                en: 'Phone Number',
                ar: 'رقم الهاتف'
            },
            placeholder: {
                en: '+966 5X XXX XXXX',
                ar: '٠٥٠٠٠٠٠٠٠٠'
            }
        },
        {
            id: 'worker_type',
            type: 'radio',
            required: true,
            label: {
                en: 'Worker Category',
                ar: 'فئة العمال'
            },
            options: [
                { value: 'production', label: { en: 'Production Workers', ar: 'عمال الإنتاج' } },
                { value: 'technical', label: { en: 'Technical Staff', ar: 'الطاقم الفني' } },
                { value: 'admin', label: { en: 'Administrative Staff', ar: 'الطاقم الإداري' } },
                { value: 'mixed', label: { en: 'Mixed Categories', ar: 'فئات مختلطة' } }
            ]
        },
        {
            id: 'safety_requirements',
            type: 'checkbox',
            required: false,
            label: {
                en: 'Safety Requirements',
                ar: 'متطلبات السلامة'
            },
            options: [
                { value: 'fire_resistant', label: { en: 'Fire Resistant', ar: 'مقاوم للحريق' } },
                { value: 'high_visibility', label: { en: 'High Visibility', ar: 'عالي الوضوح' } },
                { value: 'anti_static', label: { en: 'Anti-Static', ar: 'مضاد للكهرباء الساكنة' } },
                { value: 'waterproof', label: { en: 'Waterproof', ar: 'مقاوم للماء' } }
            ]
        },
        {
            id: 'quantity',
            type: 'number',
            required: true,
            label: {
                en: 'Total Quantity',
                ar: 'الكمية الإجمالية'
            },
            placeholder: {
                en: 'Number of uniforms',
                ar: 'عدد الأزياء'
            },
            min: 1
        },
        {
            id: 'sizes',
            type: 'textarea',
            required: true,
            label: {
                en: 'Size Breakdown',
                ar: 'توزيع المقاسات'
            },
            placeholder: {
                en: 'Example: S (20), M (50), L (80), XL (50)',
                ar: 'مثال: S (٢٠)، M (٥٠)، L (٨٠)، XL (٥٠)'
            },
            rows: 3
        },
        {
            id: 'logo_embroidery',
            type: 'radio',
            required: true,
            label: {
                en: 'Logo/Embroidery Required?',
                ar: 'هل تحتاج شعار/تطريز؟'
            },
            options: [
                { value: 'yes', label: { en: 'Yes', ar: 'نعم' } },
                { value: 'no', label: { en: 'No', ar: 'لا' } }
            ]
        },
        {
            id: 'logo_file',
            type: 'file',
            required: false,
            accept: 'image/*,.ai,.eps,.pdf',
            label: {
                en: 'Logo File (if applicable)',
                ar: 'ملف الشعار (إذا كان ينطبق)'
            },
            description: {
                en: 'Upload high-resolution logo (AI, EPS, or PNG preferred)',
                ar: 'ارفع شعار عالي الدقة (يفضل AI أو EPS أو PNG)'
            }
        },
        {
            id: 'delivery_date',
            type: 'date',
            required: true,
            label: {
                en: 'Required Delivery Date',
                ar: 'تاريخ التسليم المطلوب'
            }
        },
        {
            id: 'additional_notes',
            type: 'textarea',
            required: false,
            label: {
                en: 'Additional Notes',
                ar: 'ملاحظات إضافية'
            },
            placeholder: {
                en: 'Any special requirements or notes',
                ar: 'أي متطلبات أو ملاحظات خاصة'
            },
            rows: 4
        }
    ],

    // COMPANIES SECTOR
    companies: [
        {
            id: 'company_name',
            type: 'text',
            required: true,
            label: {
                en: 'Company Name',
                ar: 'اسم الشركة'
            },
            placeholder: {
                en: 'Enter company name',
                ar: 'أدخل اسم الشركة'
            }
        },
        {
            id: 'industry',
            type: 'select',
            required: true,
            label: {
                en: 'Industry Type',
                ar: 'نوع الصناعة'
            },
            options: [
                { value: 'retail', label: { en: 'Retail', ar: 'التجزئة' } },
                { value: 'hospitality', label: { en: 'Hospitality', ar: 'الضيافة' } },
                { value: 'services', label: { en: 'Services', ar: 'الخدمات' } },
                { value: 'technology', label: { en: 'Technology', ar: 'التكنولوجيا' } },
                { value: 'other', label: { en: 'Other', ar: 'أخرى' } }
            ]
        },
        {
            id: 'contact_person',
            type: 'text',
            required: true,
            label: {
                en: 'Contact Person',
                ar: 'الشخص المسؤول'
            },
            placeholder: {
                en: 'Full name',
                ar: 'الاسم الكامل'
            }
        },
        {
            id: 'email',
            type: 'email',
            required: true,
            label: {
                en: 'Email Address',
                ar: 'البريد الإلكتروني'
            },
            placeholder: {
                en: 'email@example.com',
                ar: 'email@example.com'
            }
        },
        {
            id: 'phone',
            type: 'tel',
            required: true,
            label: {
                en: 'Phone Number',
                ar: 'رقم الهاتف'
            },
            placeholder: {
                en: '+966 5X XXX XXXX',
                ar: '٠٥٠٠٠٠٠٠٠٠'
            }
        },
        {
            id: 'uniform_purpose',
            type: 'checkbox',
            required: true,
            label: {
                en: 'Uniform Purpose',
                ar: 'الغرض من الزي'
            },
            options: [
                { value: 'customer_facing', label: { en: 'Customer-Facing Staff', ar: 'موظفو خدمة العملاء' } },
                { value: 'office', label: { en: 'Office Staff', ar: 'موظفو المكاتب' } },
                { value: 'field_work', label: { en: 'Field Work', ar: 'العمل الميداني' } },
                { value: 'security', label: { en: 'Security', ar: 'الأمن' } }
            ]
        },
        {
            id: 'gender_split',
            type: 'radio',
            required: true,
            label: {
                en: 'Gender Requirements',
                ar: 'متطلبات الجنس'
            },
            options: [
                { value: 'male', label: { en: 'Male Only', ar: 'رجال فقط' } },
                { value: 'female', label: { en: 'Female Only', ar: 'نساء فقط' } },
                { value: 'both', label: { en: 'Both', ar: 'كلاهما' } }
            ]
        },
        {
            id: 'quantity',
            type: 'number',
            required: true,
            label: {
                en: 'Total Quantity',
                ar: 'الكمية الإجمالية'
            },
            placeholder: {
                en: 'Number of uniforms',
                ar: 'عدد الأزياء'
            },
            min: 1
        },
        {
            id: 'sizes',
            type: 'textarea',
            required: true,
            label: {
                en: 'Size Breakdown',
                ar: 'توزيع المقاسات'
            },
            placeholder: {
                en: 'Example: XS (10), S (30), M (40), L (30), XL (10)',
                ar: 'مثال: XS (١٠)، S (٣٠)، M (٤٠)، L (٣٠)، XL (١٠)'
            },
            rows: 3
        },
        {
            id: 'branding',
            type: 'radio',
            required: true,
            label: {
                en: 'Company Branding Required?',
                ar: 'هل تحتاج شعار الشركة؟'
            },
            options: [
                { value: 'yes', label: { en: 'Yes', ar: 'نعم' } },
                { value: 'no', label: { en: 'No', ar: 'لا' } }
            ]
        },
        {
            id: 'brand_files',
            type: 'file',
            required: false,
            accept: 'image/*,.ai,.eps,.pdf',
            label: {
                en: 'Brand Assets (Logo/Colors)',
                ar: 'ملفات العلامة التجارية (شعار/ألوان)'
            },
            description: {
                en: 'Upload logo and color guidelines',
                ar: 'ارفع الشعار ودليل الألوان'
            }
        },
        {
            id: 'delivery_date',
            type: 'date',
            required: true,
            label: {
                en: 'Required Delivery Date',
                ar: 'تاريخ التسليم المطلوب'
            }
        },
        {
            id: 'additional_notes',
            type: 'textarea',
            required: false,
            label: {
                en: 'Additional Notes',
                ar: 'ملاحظات إضافية'
            },
            placeholder: {
                en: 'Any special requirements or notes',
                ar: 'أي متطلبات أو ملاحظات خاصة'
            },
            rows: 4
        }
    ],

    // HOSPITALS SECTOR
    hospitals: [
        {
            id: 'hospital_name',
            type: 'text',
            required: true,
            label: {
                en: 'Hospital/Clinic Name',
                ar: 'اسم المستشفى/العيادة'
            },
            placeholder: {
                en: 'Enter facility name',
                ar: 'أدخل اسم المنشأة'
            }
        },
        {
            id: 'contact_person',
            type: 'text',
            required: true,
            label: {
                en: 'Contact Person',
                ar: 'الشخص المسؤول'
            },
            placeholder: {
                en: 'Full name',
                ar: 'الاسم الكامل'
            }
        },
        {
            id: 'email',
            type: 'email',
            required: true,
            label: {
                en: 'Email Address',
                ar: 'البريد الإلكتروني'
            },
            placeholder: {
                en: 'email@example.com',
                ar: 'email@example.com'
            }
        },
        {
            id: 'phone',
            type: 'tel',
            required: true,
            label: {
                en: 'Phone Number',
                ar: 'رقم الهاتف'
            },
            placeholder: {
                en: '+966 5X XXX XXXX',
                ar: '٠٥٠٠٠٠٠٠٠٠'
            }
        },
        {
            id: 'staff_type',
            type: 'checkbox',
            required: true,
            label: {
                en: 'Staff Categories',
                ar: 'فئات الموظفين'
            },
            options: [
                { value: 'doctors', label: { en: 'Doctors', ar: 'الأطباء' } },
                { value: 'nurses', label: { en: 'Nurses', ar: 'الممرضين' } },
                { value: 'technicians', label: { en: 'Technicians', ar: 'الفنيين' } },
                { value: 'admin', label: { en: 'Administrative Staff', ar: 'الموظفون الإداريون' } },
                { value: 'cleaning', label: { en: 'Cleaning Staff', ar: 'عمال النظافة' } }
            ]
        },
        {
            id: 'scrub_color',
            type: 'select',
            required: true,
            label: {
                en: 'Preferred Scrub Color',
                ar: 'لون الزي الطبي المفضل'
            },
            options: [
                { value: 'white', label: { en: 'White', ar: 'أبيض' } },
                { value: 'navy', label: { en: 'Navy Blue', ar: 'أزرق داكن' } },
                { value: 'teal', label: { en: 'Teal', ar: 'أزرق مخضر' } },
                { value: 'green', label: { en: 'Green', ar: 'أخضر' } },
                { value: 'custom', label: { en: 'Custom Color', ar: 'لون مخصص' } }
            ]
        },
        {
            id: 'gender_split',
            type: 'radio',
            required: true,
            label: {
                en: 'Gender Requirements',
                ar: 'متطلبات الجنس'
            },
            options: [
                { value: 'male', label: { en: 'Male Only', ar: 'رجال فقط' } },
                { value: 'female', label: { en: 'Female Only', ar: 'نساء فقط' } },
                { value: 'both', label: { en: 'Both', ar: 'كلاهما' } }
            ]
        },
        {
            id: 'quantity',
            type: 'number',
            required: true,
            label: {
                en: 'Total Quantity',
                ar: 'الكمية الإجمالية'
            },
            placeholder: {
                en: 'Number of uniforms',
                ar: 'عدد الأزياء'
            },
            min: 1
        },
        {
            id: 'sizes',
            type: 'textarea',
            required: true,
            label: {
                en: 'Size Breakdown',
                ar: 'توزيع المقاسات'
            },
            placeholder: {
                en: 'Example: XS (15), S (35), M (60), L (40), XL (20), XXL (10)',
                ar: 'مثال: XS (١٥)، S (٣٥)، M (٦٠)، L (٤٠)، XL (٢٠)، XXL (١٠)'
            },
            rows: 3
        },
        {
            id: 'fabric_requirements',
            type: 'checkbox',
            required: false,
            label: {
                en: 'Fabric Requirements',
                ar: 'متطلبات القماش'
            },
            options: [
                { value: 'antimicrobial', label: { en: 'Antimicrobial', ar: 'مضاد للميكروبات' } },
                { value: 'fluid_resistant', label: { en: 'Fluid Resistant', ar: 'مقاوم للسوائل' } },
                { value: 'breathable', label: { en: 'Highly Breathable', ar: 'عالي التهوية' } },
                { value: 'wrinkle_free', label: { en: 'Wrinkle-Free', ar: 'مقاوم للتجاعيد' } }
            ]
        },
        {
            id: 'embroidery',
            type: 'radio',
            required: true,
            label: {
                en: 'Name/Logo Embroidery?',
                ar: 'تطريز الاسم/الشعار؟'
            },
            options: [
                { value: 'yes', label: { en: 'Yes', ar: 'نعم' } },
                { value: 'no', label: { en: 'No', ar: 'لا' } }
            ]
        },
        {
            id: 'embroidery_details',
            type: 'textarea',
            required: false,
            label: {
                en: 'Embroidery Details',
                ar: 'تفاصيل التطريز'
            },
            placeholder: {
                en: 'Specify what to embroider (e.g., hospital name, department)',
                ar: 'حدد ما يجب تطريزه (مثل: اسم المستشفى، القسم)'
            },
            rows: 2
        },
        {
            id: 'logo_file',
            type: 'file',
            required: false,
            accept: 'image/*,.ai,.eps,.pdf',
            label: {
                en: 'Logo File (if applicable)',
                ar: 'ملف الشعار (إذا كان ينطبق)'
            },
            description: {
                en: 'Upload hospital logo for embroidery',
                ar: 'ارفع شعار المستشفى للتطريز'
            }
        },
        {
            id: 'delivery_date',
            type: 'date',
            required: true,
            label: {
                en: 'Required Delivery Date',
                ar: 'تاريخ التسليم المطلوب'
            }
        },
        {
            id: 'additional_notes',
            type: 'textarea',
            required: false,
            label: {
                en: 'Additional Notes',
                ar: 'ملاحظات إضافية'
            },
            placeholder: {
                en: 'Any special requirements or notes',
                ar: 'أي متطلبات أو ملاحظات خاصة'
            },
            rows: 4
        }
    ]
};

export default questionsConfig;
