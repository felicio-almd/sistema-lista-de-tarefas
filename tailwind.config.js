/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        textPrimary: "var(--text-primary)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",

        bgBlack: "var(--background-black)",
        textBlack: "var(--text-black)",
        primaryBlack: "var(--primary-black)",
        secondaryBlack: "var(--secondary-black)",
        accentBlack: "var(--accent-black)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
