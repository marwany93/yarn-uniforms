import { getProductById } from './schoolProducts';

export const schools = [
    {
        id: 'al-noor-int',
        slug: 'al-noor-international-school',
        name: { en: 'Al Noor International School', ar: 'مدرسة النور الدولية' },
        logo: '/images/schools/noor-logo-placeholder.png', // Placeholder path
        assignedProducts: [
            {
                productId: 'dr1', // Apron DR 1
                price: 120, // School-specific price
                allowedStage: 'kg_primary',
                fixedDetails: {
                    color: 6, // Navy
                    fabric: 'Gabardine (Mixed 65/35)',
                    logoType: 'embroidery',
                    logoPlacement: 'chest'
                }
            },
            {
                productId: 'ps1', // Polo Shirt PS 1
                price: 85,
                allowedStage: 'kg_primary', // Modified from prep_secondary to fit Polo usage usually
                fixedDetails: {
                    color: 1, // White
                    fabric: 'Pika (Lacoste)',
                    logoType: 'printing',
                    logoPlacement: 'chest'
                }
            },
            {
                productId: 'bpa1', // Boys Pant
                price: 95,
                allowedStage: 'kg_primary',
                fixedDetails: {
                    color: 6, // Navy
                    fabric: 'Gabardine (Mixed 65/35)',
                    logoType: 'none',
                    logoPlacement: 'none'
                }
            }
        ]
    },
    {
        id: 'future-gen',
        slug: 'future-generation-schools',
        name: { en: 'Future Generation Schools', ar: 'مدارس جيل المستقبل' },
        logo: '/images/schools/future-gen-logo.png', // Placeholder
        assignedProducts: [
            {
                productId: 'ps2', // Polo Shirt PS 2 (Different design maybe)
                price: 90,
                allowedStage: 'prep_secondary',
                fixedDetails: {
                    color: 5, // Blue
                    fabric: 'Pika (Lacoste)',
                    logoType: 'embroidery',
                    logoPlacement: 'chest'
                }
            },
            {
                productId: 'bpa1', // Boys Pant
                price: 110,
                allowedStage: 'prep_secondary',
                fixedDetails: {
                    color: 6, // Navy
                    fabric: 'Gabardine (Mixed 65/35)',
                    logoType: 'none',
                    logoPlacement: 'none'
                }
            },
            {
                productId: 'tbe1', // Tracksuit top maybe? Or set
                price: 180,
                allowedStage: 'prep_secondary',
                fixedDetails: {
                    color: 2, // Green? Just guessing from options
                    fabric: 'Scuba',
                    logoType: 'printing',
                    logoPlacement: 'chest'
                }
            }
        ]
    }
];

export const getSchoolById = (id) => schools.find(s => s.id === id);
export const getSchoolBySlug = (slug) => schools.find(s => s.slug === slug);
