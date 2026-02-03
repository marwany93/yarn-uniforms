'use client';
import { useState, useEffect, createContext, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Default to Arabic (target audience in Saudi Arabia)
    const [language, setLanguage] = useState('ar');

    // Load saved language preference on mount (runs once)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
            setLanguage(savedLang);
        } else {
            // Check browser language, default to Arabic
            const browserLang = navigator.language.startsWith('en') ? 'en' : 'ar';
            setLanguage(browserLang);
        }
    }, []); // Only run on mount

    // Update DOM and localStorage when language changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
    }, [language]); // Run when language changes

    // Function to change to a specific language
    const changeLanguage = (newLang) => {
        if (newLang === 'en' || newLang === 'ar') {
            setLanguage(newLang);
        }
    };

    // Function to toggle between languages
    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    };

    // Translation function with defensive check
    const t = (translations) => {
        // 🛡️ SECURITY PATCH: Prevent crash if translations is undefined/null
        if (!translations) return '';

        if (typeof translations === 'string') return translations;
        return translations[language] || translations['en'] || '';
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
