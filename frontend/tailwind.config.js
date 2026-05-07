/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'organic-green': {
                    DEFAULT: '#22c55e', // Green 500
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                'earth-brown': {
                    DEFAULT: '#8D6E63',
                    light: '#A1887F',
                    dark: '#5D4037',
                },
                'sky-blue': {
                    DEFAULT: '#38bdf8', // Sky 400
                    light: '#7dd3fc',
                    dark: '#0284c7',
                },
                'dark-navy': {
                    DEFAULT: '#020617', // Slate 950
                    light: '#0f172a', // Slate 900
                    accent: '#1e293b', // Slate 800
                },
                'neon-green': '#00ff9d',
                'soil-dark': '#1a1818',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
