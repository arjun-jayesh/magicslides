import type { Config } from 'tailwindcss';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // We will define custom colors here as we build the UI Shell
            },
        },
    },
    plugins: [],
} satisfies Config;
