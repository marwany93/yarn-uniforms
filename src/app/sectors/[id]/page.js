import { notFound } from 'next/navigation';
import { sectors, getSectorById } from '@/data/sectors';
import SectorPageClient from './SectorPageClient';

// Generate static params for all sectors
export function generateStaticParams() {
    return sectors.map((sector) => ({
        id: sector.id,
    }));
}

export default function SectorPage({ params }) {
    const sector = getSectorById(params.id);

    // If sector not found, trigger 404
    if (!sector) {
        notFound();
    }

    return <SectorPageClient sector={sector} />;
}
