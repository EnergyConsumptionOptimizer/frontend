import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import BadgeDirective from "primevue/badgedirective";
import Tooltip from "primevue/tooltip";
import StyleClass from "primevue/styleclass";
import EcoTheme from "@/assets/styles/ecoTheme.js";

import "@/assets/styles/styles.scss";
import "@/assets/styles/tailwind.css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.use(router);

// Make router accessible globally for route announcements
window.$router = router;

app.use(PrimeVue, {
  theme: {
    preset: EcoTheme,
    options: {
      darkModeSelector: ".app-dark",
      ripple: true,
    },
  },
  // Locale for better screen reader support
  locale: {
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    dayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthNamesShort: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    today: "Today",
    clear: "Clear",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
  },
});

app.use(ToastService);
app.use(ConfirmationService);

app.directive("badge", BadgeDirective);
app.directive("tooltip", Tooltip);
app.directive("styleclass", StyleClass);

app.config.errorHandler = (err, instance, info) => {
  console.error("Global error:", err);
  console.error("Component:", instance);
  console.error("Error info:", info);
};

app.mount("#app");
