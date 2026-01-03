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
import Badge from "primevue/badge";
import OverlayBadge from "primevue/overlaybadge";
import EcoTheme from "@/assets/styles/ecoTheme.js";

import "@/assets/styles/styles.scss";
import "@/assets/styles/tailwind.css";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

app.use(PrimeVue, {
  theme: {
    preset: EcoTheme,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
});

app.use(ToastService);
app.use(ConfirmationService);
app.directive("badge", BadgeDirective);
app.directive("tooltip", Tooltip);
app.component("Badge", Badge);
app.component("OverlayBadge", OverlayBadge);

app.mount("#app");
