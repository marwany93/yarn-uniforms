import { notFound } from 'next/navigation';
import { sectors, getSectorById } from '@/data/sectors';
import SchoolWizard from '@/components/wizard/SchoolWizard';

// Generate static params for school sector
export function generateStaticParams() {
    return [{ id: 'schools' }];
}

export default function SchoolsPage({ params }) {
    const sector = getSectorById('schools');

    // If sector not found, trigger 404
    if (!sector || params.id !== 'schools') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-primary text-white py-12">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-5xl mb-4">
                        {sector.icon}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
                        School Uniform Designer
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Create the perfect school uniform with our interactive design wizard
                    </p>
                </div>
            </div>

            {/* Wizard Component */}
            <SchoolWizard />
        </div>
    );
}
