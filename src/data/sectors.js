/**
 * Sectors Data Configuration
 * Defines the available uniform sectors with metadata
 */

export const sectors = [
    {
        id: 'schools',
        title: 'Educational Sector',
        titleAr: 'القطاع التعليمي',
        icon: '🎓',
        description: 'Premium school uniforms designed for comfort, durability, and professional identity.',
        descriptionAr: 'زي مدرسي فاخر مصمم للراحة والمتانة والهوية المهنية.',
        color: '#3B82F6', // Blue
        image: '/sectors/sector-schools.png',
    },
    {
        id: 'medical',
        title: 'Medical Sector',
        titleAr: 'القطاع الطبي',
        icon: '⚕️',
        description: 'Professional medical scrubs and uniforms that meet healthcare industry standards.',
        descriptionAr: 'زي طبي احترافي يلبي معايير الصناعة الصحية.',
        color: '#10B981', // Green
        image: '/sectors/sector-medical.png',
    },
    {
        id: 'corporate',
        title: 'Industrial & Corporate',
        titleAr: 'القطاع الصناعي والشركات',
        icon: '🏭',
        description: 'High-quality corporate and industrial uniforms built for safety and professionalism.',
        descriptionAr: 'زي شركات وصناعي عالي الجودة مصمم للسلامة والاحترافية.',
        color: '#F59E0B', // Amber
        image: '/sectors/sector-corporate.png',
    },
    {
        id: 'hospitality',
        title: 'Restaurants & Cafes',
        titleAr: 'قطاع المطاعم والمقاهي',
        icon: '☕',
        description: 'Elegant hospitality uniforms that enhance your brand image.',
        descriptionAr: 'زي ضيافة أنيق يعزز صورة علامتك التجارية.',
        color: '#8B5CF6', // Purple
        image: '/sectors/sector-hospitality.png',
    },
    {
        id: 'transportation',
        title: 'Transportation & Aviation',
        titleAr: 'قطاع النقل والطيران',
        icon: '✈️',
        description: 'Professional uniforms for airlines and transport services.',
        descriptionAr: 'زي رسمي احترافي لخدمات الطيران والنقل.',
        color: '#64748B', // Slate
        image: '/sectors/sector-transport.png',
    },
    {
        id: 'domestic',
        title: 'Domestic Labor',
        titleAr: 'قطاع العمالة المنزلية',
        icon: '🏠',
        description: 'High-quality uniforms for domestic staff with comfort and style.',
        descriptionAr: 'زي موحد عالي الجودة للعمالة المنزلية يجمع بين الراحة والأناقة.',
        color: '#EC4899', // Pink
        image: '/sectors/sector-domestic.png',
    }
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
