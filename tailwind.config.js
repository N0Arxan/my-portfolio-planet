/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica",
                    "Arial",
                    "sans-serif"
                ],
            },
            colors: {
                // Add any custom colors here if needed, but we use standard tailwind colors with opacity
            },
            animation: {
                'fade-in': 'fadeIn 1.5s ease-out forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(-10px)' },
                    'to': { opacity: '0.9', transform: 'translateY(0)' },
                },
                scaleIn: {
                    'to': { opacity: '1', transform: 'scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
