import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                "shine": "shine 8s ease-in-out infinite",
                "meteor": "meteor 5s linear infinite",
            },
            keyframes: {
                shine: {
                    "0%": { "background-position": "0% 0%" },
                    "50%": { "background-position": "100% 100%" },
                    "100%": { "background-position": "0% 0%" },
                },
                meteor: {
                    "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
                    "70%": { opacity: "1" },
                    "100%": {
                        transform: "rotate(215deg) translateX(-500px)",
                        opacity: "0",
                    },
                },
            },
        },
    },
    plugins: [],
};
export default config;
