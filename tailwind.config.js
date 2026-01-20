/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // Custom breakpoints aligned with layout SCSS
      screens: {
        sm: "640px", // Mobile landscape, small tablets
        md: "768px", // Tablets
        lg: "1024px", // Desktop (matches SCSS breakpoint)
        xl: "1280px", // Large desktop
        "2xl": "1536px", // Extra large desktop
      },

      // Extended spacing for touch targets (WCAG AA)
      spacing: {
        11: "2.75rem", // 44px - minimum touch target
        13: "3.25rem", // 52px - comfortable touch target
        15: "3.75rem", // 60px - large touch target
      },

      // Custom colors for semantic meaning
      colors: {
        // Success states
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        // Warning states
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Error states
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },

      // Typography scale aligned with _typography.scss
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },

      // Animation durations
      transitionDuration: {
        400: "400ms", // Standard element transition
      },

      // Border radius aligned with PrimeVue
      borderRadius: {
        content: "var(--content-border-radius)",
      },
    },
  },

  plugins: [require("tailwindcss-primeui")],

  // Safelist for dynamic classes (if needed)
  safelist: [
    "min-h-11", // Touch targets
    "min-w-11",
    "text-balance",
    "text-pretty",
  ],
};
