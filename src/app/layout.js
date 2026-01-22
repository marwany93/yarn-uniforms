import './globals.css';
import { Cairo, Inter } from 'next/font/google';
import { LanguageProvider } from '@/hooks/useLanguage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Load Google Fonts
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const cairo = Cairo({
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
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`} suppressHydrationWarning={true}>
                <LanguageProvider>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </LanguageProvider>
            </body>
        </html>
    );
}
