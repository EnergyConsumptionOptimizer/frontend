import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

const EcoTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{blue.50}",
      100: "{blue.100}",
      200: "{blue.200}",
      300: "{blue.300}",
      400: "{blue.400}",
      500: "{blue.500}",
      600: "{blue.600}",
      700: "{blue.700}",
      800: "{blue.800}",
      900: "{blue.900}",
      950: "{blue.950}",
    },

    electricity: {
      50: "{yellow.50}",
      100: "{yellow.100}",
      200: "{yellow.200}",
      300: "{yellow.300}",
      400: "{yellow.400}",
      500: "{yellow.500}",
      600: "{yellow.600}",
      700: "{yellow.700}",
      800: "{yellow.800}",
      900: "{yellow.900}",
      950: "{yellow.950}",
    },

    gas: {
      50: "{orange.50}",
      100: "{orange.100}",
      200: "{orange.200}",
      300: "{orange.300}",
      400: "{orange.400}",
      500: "{orange.500}",
      600: "{orange.600}",
      700: "{orange.700}",
      800: "{orange.800}",
      900: "{orange.900}",
      950: "{orange.950}",
    },

    water: {
      50: "{cyan.50}",
      100: "{cyan.100}",
      200: "{cyan.200}",
      300: "{cyan.300}",
      400: "{cyan.400}",
      500: "{cyan.500}",
      600: "{cyan.600}",
      700: "{cyan.700}",
      800: "{cyan.800}",
      900: "{cyan.900}",
      950: "{cyan.950}",
    },
  },
});

export default EcoTheme;
