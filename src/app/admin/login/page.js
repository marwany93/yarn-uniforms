'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

export default function AdminLoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const translations = {
        title: { en: 'Admin Login', ar: 'تسجيل دخول المدير' },
        subtitle: {
            en: 'Sign in to access the dashboard',
            ar: 'سجل الدخول للوصول إلى لوحة التحكم'
        },
        email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
        emailPlaceholder: { en: 'name@company.com', ar: 'name@company.com' },
        password: { en: 'Password', ar: 'كلمة المرور' },
        passwordPlaceholder: { en: 'Enter your password', ar: 'أدخل كلمة المرور' },
        signIn: { en: 'Sign In', ar: 'تسجيل الدخول' },
        signingIn: { en: 'Signing in...', ar: 'جاري تسجيل الدخول...' },
        invalidCredentials: {
            en: 'Invalid email or password',
            ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        },
        backToHome: { en: '← Back to Home', ar: '→ العودة للرئيسية' },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError(t(translations.invalidCredentials));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-300 hover:text-white font-medium mb-8 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t(translations.backToHome)}
                </Link>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {t(translations.title)}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            {t(translations.subtitle)}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                {t(translations.email)}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder={t(translations.emailPlaceholder)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {t(translations.password)}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder={t(translations.passwordPlaceholder)}
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="ml-3 text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 shadow-lg transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                }`}
                        >
                            {loading ? t(translations.signingIn) : t(translations.signIn)}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
