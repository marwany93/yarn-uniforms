import { Shield, Lock, FileText, RefreshCcw, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'سياسة الخصوصية | Yarn Uniforms',
    description: 'سياسة الخصوصية لموقع يارن للزي الموحد',
};

export default function PrivacyPage() {
    const policies = [
        {
            icon: <Shield className="w-8 h-8 text-primary" />,
            title: "الالتزام والسرية",
            desc: "في يارن نلتزم بحماية خصوصية مستخدمي موقعنا، ونتعامل مع جميع المعلومات الشخصية بسرية تامة."
        },
        {
            icon: <FileText className="w-8 h-8 text-primary" />,
            title: "جمع المعلومات",
            desc: "نقوم بجمع المعلومات التي يزوّدنا بها المستخدم طوعًا عبر نماذج التواصل، وذلك بهدف الرد على الاستفسارات وتقديم خدماتنا وتحسين تجربة الاستخدام."
        },
        {
            icon: <Lock className="w-8 h-8 text-primary" />,
            title: "حماية البيانات",
            desc: "نحرص على حماية البيانات من أي استخدام غير مصرح به، ولا نقوم بمشاركة المعلومات مع أي طرف ثالث إلا عند الحاجة لتقديم الخدمة أو وفق الأنظمة المعمول بها."
        },
        {
            icon: <RefreshCcw className="w-8 h-8 text-primary" />,
            title: "تحديث السياسة",
            desc: "يحق لنا تحديث سياسة الخصوصية عند الحاجة، وسيتم نشر أي تعديلات على هذه الصفحة."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section */}
            <section className="bg-primary py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">سياسة الخصوصية</h1>
                <p className="text-primary-100 text-lg max-w-2xl mx-auto">نلتزم بحماية بياناتك وخصوصيتك بأعلى معايير الأمان</p>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-4 py-16 max-w-4xl -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="space-y-10">
                        {policies.map((policy, idx) => (
                            <div key={idx} className="flex gap-6 items-start">
                                <div className="bg-primary/10 p-4 rounded-xl shrink-0">
                                    {policy.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{policy.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">{policy.desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Contact Box */}
                        <div className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center gap-4">
                            <div className="bg-white p-3 rounded-full shadow-sm"><Mail className="w-6 h-6 text-primary" /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">لديك استفسار؟</h4>
                                <p className="text-gray-600">للاستفسار حول سياسة الخصوصية، يمكن التواصل معنا عبر قنوات الاتصال المتاحة في <Link href="/contact" className="text-primary font-bold hover:underline">صفحة اتصل بنا</Link>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
