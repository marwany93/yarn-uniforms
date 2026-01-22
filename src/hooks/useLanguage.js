'use client';
import { useState, useEffect, createContext, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Default to English if running on server or no preference found
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Load saved language preference
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            setLanguage(savedLang);
        } else {
            // Check browser language
            const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
            setLanguage(browserLang);
        }

        // Set html dir attribute
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const t = (translations) => {
        // 🛡️ SECURITY PATCH: Prevent crash if translations is undefined/null
        if (!translations) return '';

        if (typeof translations === 'string') return translations;
        return translations[language] || translations['en'] || '';
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
