/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                // Fire/Laser theme colors
                fire: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',  // Main orange
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                laser: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',  // Main red
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                metal: {
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d4d4d8',
                    400: '#a1a1aa',
                    500: '#71717a',
                    600: '#52525b',
                    700: '#3f3f46',
                    800: '#27272a',
                    900: '#18181b',
                },
                spark: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',  // Main yellow
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                }
            },
            backgroundImage: {
                'fire-gradient': 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #fbbf24 100%)',
                'laser-gradient': 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                'metal-gradient': 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
            },
            boxShadow: {
                'fire': '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                'laser': '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
            }
        },
    },
    plugins: [],
}
