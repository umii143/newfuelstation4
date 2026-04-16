/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Glassy White Theme (Light Mode)
                light: {
                    bg: {
                        primary: '#F8FAFC',
                        surface: '#FFFFFF',
                        elevated: 'rgba(255, 255, 255, 0.8)',
                    },
                    text: {
                        primary: '#0F172A',
                        secondary: '#64748B',
                    },
                    border: '#E2E8F0',
                },
                // Deep Obsidian Theme (Dark Mode)
                dark: {
                    bg: {
                        primary: '#0B1121',
                        surface: '#1E293B',
                        elevated: 'rgba(30, 41, 59, 0.8)',
                    },
                    text: {
                        primary: '#F1F5F9',
                        secondary: '#94A3B8',
                    },
                    border: '#334155',
                },
                // Accent Colors
                accent: {
                    blue: '#3B82F6',
                    'blue-light': '#60A5FA',
                    emerald: '#10B981',
                    'emerald-light': '#34D399',
                    rose: '#F43F5E',
                    'rose-light': '#FB7185',
                    amber: '#F59E0B',
                    'amber-light': '#FBBF24',
                },
            },
            boxShadow: {
                'sm-light': '0 1px 2px rgba(0,0,0,0.05)',
                'md-light': '0 4px 6px rgba(0,0,0,0.07)',
                'lg-light': '0 10px 15px rgba(0,0,0,0.1)',
                'xl-light': '0 20px 25px rgba(0,0,0,0.15)',
                'sm-dark': '0 1px 2px rgba(0,0,0,0.3)',
                'md-dark': '0 4px 6px rgba(0,0,0,0.4)',
                'lg-dark': '0 10px 15px rgba(0,0,0,0.5)',
                'xl-dark': '0 20px 25px rgba(0,0,0,0.6)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
