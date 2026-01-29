/**
 * Sectors Data Configuration
 * Defines the available uniform sectors with metadata
 */

export const sectors = [
    {
        id: 'schools',
        title: 'Schools',
        titleAr: 'المدارس',
        icon: '🎓',
        description: 'Premium school uniforms designed for comfort, durability, and style. Perfect for students of all ages.',
        descriptionAr: 'زي مدرسي فاخر مصمم للراحة والمتانة والأناقة. مثالي للطلاب من جميع الأعمار.',
        color: '#3B82F6', // Blue
        image: '/images/sectors/schools.jpg', // Placeholder
    },
    {
        id: 'medical',
        title: 'Medical Sector',
        titleAr: 'القطاع الطبي',
        icon: '⚕️',
        description: 'Professional medical scrubs and uniforms that meet healthcare industry standards with superior comfort.',
        descriptionAr: 'زي طبي احترافي يلبي معايير الصناعة الصحية مع راحة فائقة.',
        color: '#10B981', // Green
        image: '/images/sectors/medical.jpg', // Placeholder
    },
    {
        id: 'corporate',
        title: 'Corporate & Factories',
        titleAr: 'الشركات والمصانع',
        icon: '🏭',
        description: 'High-quality corporate and industrial uniforms built for safety, functionality, and professional appearance.',
        descriptionAr: 'زي شركات وصناعي عالي الجودة مصمم للسلامة والوظائف والمظهر المهني.',
        color: '#F59E0B', // Amber
        image: '/images/sectors/corporate.jpg', // Placeholder
    },
    {
        id: 'hospitality',
        title: 'Hotels & Restaurants',
        titleAr: 'الفنادق والمطاعم',
        icon: '🍽️',
        description: 'Elegant hospitality uniforms that enhance your brand image while ensuring staff comfort and mobility.',
        descriptionAr: 'زي ضيافة أنيق يعزز صورة علامتك التجارية مع ضمان راحة وحركة الموظفين.',
        color: '#8B5CF6', // Purple
        image: '/images/sectors/hospitality.jpg', // Placeholder
    },
];

/**
 * Get sector by ID
 * @param {string} sectorId - The sector identifier
 * @returns {object|undefined} Sector object or undefined if not found
 */
export const getSectorById = (sectorId) => {
    return sectors.find((sector) => sector.id === sectorId);
};

/**
 * Get sector title based on language
 * @param {object} sector - The sector object
 * @param {string} lang - Language code ('en' or 'ar')
 * @returns {string} Sector title in the specified language
 */
export const getSectorTitle = (sector, lang = 'en') => {
    return lang === 'ar' ? sector.titleAr : sector.title;
};

/**
 * Get sector description based on language
 * @param {object} sector - The sector object
 * @param {string} lang - Language code ('en' or 'ar')
 * @returns {string} Sector description in the specified language
 */
export const getSectorDescription = (sector, lang = 'en') => {
    return lang === 'ar' ? sector.descriptionAr : sector.description;
};
