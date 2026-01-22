/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],

    theme: {
        extend: {
            // Yarn 2025 Brand Colors
            colors: {
                primary: {
                    DEFAULT: '#192E4F', // Royal Navy
                    50: '#e8ecf1',
                    100: '#d1d9e3',
                    200: '#a3b3c7',
                    300: '#758dab',
                    400: '#47678f',
                    500: '#192E4F', // Main
                    600: '#14253f',
                    700: '#0f1c2f',
                    800: '#0a1320',
                    900: '#050910',
                },
                secondary: {
                    DEFAULT: '#e5d7ca', // Warm Desert Tan
                    50: '#faf8f6',
                    100: '#f5f1ed',
                    200: '#ebe3db',
                    300: '#e5d7ca', // Main
                    400: '#d9c5b3',
                    500: '#cdb39c',
                    600: '#b89675',
                    700: '#9b7854',
                    800: '#75593f',
                    900: '#4e3a2a',
                },
                dark: '#10182A', // Charcoal Navy - Main text
                background: '#fcf9f7', // Seashell White - Body background
                white: '#FFFFFF', // Pure white for cards
            },

            // Yarn 2025 Typography
            fontFamily: {
                sans: ['var(--font-roboto)', 'var(--font-cairo)', 'system-ui', 'sans-serif'], // Default body
                display: ['var(--font-baloo)', 'var(--font-cairo)', 'system-ui', 'sans-serif'], // Headings
                arabic: ['var(--font-cairo)', 'system-ui', 'sans-serif'], // Arabic fallback
            },

            // Custom spacing for better Arabic/English compatibility
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '100': '25rem',
                '128': '32rem',
            },

            // Custom animations
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.4s ease-out',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },

    // RTL Support Plugin
    plugins: [
        require('@tailwindcss/forms'),
    ],

    // Enable dark mode (optional)
    darkMode: 'class',
}
