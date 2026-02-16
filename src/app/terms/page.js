import { CheckCircle, Copyright, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'شروط الخدمة | Yarn Uniforms',
    description: 'شروط الخدمة لموقع يارن للزي الموحد',
};

export default function TermsPage() {
    const terms = [
        {
            icon: <CheckCircle className="w-8 h-8 text-primary" />,
            title: "الموافقة على الشروط",
            desc: "باستخدامك لموقع يارن، فإنك توافق على شروط الخدمة المعمول بها وتلتزم بها بالكامل."
        },
        {
            icon: <Copyright className="w-8 h-8 text-primary" />,
            title: "حقوق الملكية الفكرية",
            desc: "جميع المحتويات في الموقع (من نصوص، صور، تصاميم، وشعارات) مملوكة لـ يارن ولا يجوز استخدامها أو نسخها أو توزيعها دون إذن كتابي مسبق."
        },
        {
            icon: <AlertCircle className="w-8 h-8 text-primary" />,
            title: "التعديل والتحديث",
            desc: "يحق لـ يارن تعديل أو تحديث شروط الخدمة في أي وقت لضمان تحسين جودة الخدمة، ويتم نشر التعديلات الجديدة مباشرة على هذه الصفحة."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section */}
            <section className="bg-primary py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">شروط الخدمة</h1>
                <p className="text-primary-100 text-lg max-w-2xl mx-auto">القواعد والضوابط التي تنظم استخدامك لموقعنا وخدماتنا</p>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-4 py-16 max-w-4xl -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="space-y-10">
                        {terms.map((term, idx) => (
                            <div key={idx} className="flex gap-6 items-start">
                                <div className="bg-primary/10 p-4 rounded-xl shrink-0">
                                    {term.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{term.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">{term.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
