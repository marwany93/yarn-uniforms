import SchoolWizard from '@/components/wizard/SchoolWizard';

export const metadata = {
    title: 'School Uniform Designer | Yarn Uniforms',
    description: 'Design and customize your school uniforms with our interactive wizard.',
};

export default function SchoolsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-primary text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-5xl">🎓</span>
                        <h1 className="text-4xl md:text-5xl font-bold">School Uniform Designer</h1>
                    </div>
                    <p className="text-xl opacity-90 text-center max-w-3xl mx-auto">
                        Customize your school&apos;s uniform catalog with our easy-to-use design wizard
                    </p>
                </div>
            </section>

            {/* Wizard Component */}
            <SchoolWizard />
        </div>
    );
}
