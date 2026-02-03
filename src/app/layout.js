import './globals.css';
import { Cairo, Roboto, Baloo_Da_2 } from 'next/font/google';
import { LanguageProvider } from '@/hooks/useLanguage';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Yarn 2025 Brand Fonts
const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    variable: '--font-roboto',
    display: 'swap',
});

const balooDa2 = Baloo_Da_2({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    variable: '--font-baloo',
    display: 'swap',
});

const cairo = Cairo({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['arabic', 'latin'],
    variable: '--font-cairo',
    display: 'swap',
});

export const metadata = {
    title: 'Yarn Uniforms | Quality Uniforms for Schools, Factories, Companies & Hospitals',
    description: 'Professional uniform solutions for schools, factories, companies, and hospitals in Saudi Arabia. Order custom uniforms with bilingual support.',
    keywords: 'uniforms, school uniforms, factory uniforms, hospital scrubs, company uniforms, Saudi Arabia, يارن للزي الموحد',
    authors: [{ name: 'Yarn Uniforms' }],
    openGraph: {
        title: 'Yarn Uniforms',
        description: 'Professional uniform solutions for all sectors',
        url: 'https://yarnuniforms.com.sa',
        siteName: 'Yarn Uniforms',
        locale: 'en_US',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    // Debug: Verify layout is loading
    console.log('🏗️ RootLayout: Mounting with CartProvider...');

    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body
                className={`${roboto.variable} ${balooDa2.variable} ${cairo.variable} font-sans antialiased`}
                suppressHydrationWarning={true}
            >
                <LanguageProvider>
                    <CartProvider>
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </CartProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
