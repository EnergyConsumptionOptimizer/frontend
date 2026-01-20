import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

const EcoTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{blue.50}", // #eff6ff - Very light blue
      100: "{blue.100}", // #dbeafe - Light blue
      200: "{blue.200}", // #bfdbfe
      300: "{blue.300}", // #93c5fd
      400: "{blue.400}", // #60a5fa
      500: "{blue.500}", // #3b82f6 - Primary brand color
      600: "{blue.600}", // #2563eb - Primary hover state
      700: "{blue.700}", // #1d4ed8
      800: "{blue.800}", // #1e40af
      900: "{blue.900}", // #1e3a8a
      950: "{blue.950}", // #172554 - Very dark blue
    },

    // Color scheme overrides
    colorScheme: {
      light: {
        // Light mode inherits Aura defaults
        // Text on surface-0 (white): Uses text-900 (near black) = ~14:1 contrast ✓
        surface: {
          0: "#ffffff", // Pure white background
          50: "{slate.50}", // #f8fafc
          100: "{slate.100}", // #f1f5f9
          200: "{slate.200}", // #e2e8f0
          300: "{slate.300}", // #cbd5e1
          400: "{slate.400}", // #94a3b8
          500: "{slate.500}", // #64748b
          600: "{slate.600}", // #475569
          700: "{slate.700}", // #334155
          800: "{slate.800}", // #1e293b
          900: "{slate.900}", // #0f172a
          950: "{slate.950}", // #020617
        },
      },
      dark: {
        // Dark mode surface palette
        // Text on surface-900 (near black): Uses text-50 (near white) = ~14:1 contrast ✓
        surface: {
          0: "#ffffff", // White (for contrast)
          50: "{slate.50}", // #f8fafc
          100: "{slate.100}", // #f1f5f9
          200: "{slate.200}", // #e2e8f0
          300: "{slate.300}", // #cbd5e1
          400: "{slate.400}", // #94a3b8
          500: "{slate.500}", // #64748b
          600: "{slate.600}", // #475569
          700: "{slate.700}", // #334155
          800: "{slate.800}", // #1e293b
          900: "{slate.900}", // #0f172a - Dark background
          950: "{slate.950}", // #020617 - Very dark background
        },
      },
    },

    // Focus ring for accessibility
    focusRing: {
      width: "2px",
      style: "solid",
      color: "{primary.500}",
      offset: "2px",
    },
  },
});

export default EcoTheme;
