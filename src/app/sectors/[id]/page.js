import { notFound } from 'next/navigation';
import { sectors, getSectorById } from '@/data/sectors';
import SectorPageClient from './SectorPageClient';

// Generate static params for all sectors
export function generateStaticParams() {
    return sectors.map((sector) => ({
        id: sector.id,
    }));
}

// التعديل هنا: ضفنا async قبل الدالة، وعملنا await للـ params
export default async function SectorPage({ params }) {
    const { id } = await params;
    const sector = getSectorById(id);

    // If sector not found, trigger 404
    if (!sector) {
        notFound();
    }

    return <SectorPageClient sector={sector} />;
}