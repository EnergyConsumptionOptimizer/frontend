const STORAGE_KEY = "onboarding_temp_thresholds";

const getStore = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const setStore = (data) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const ThresholdLocalService = {
  async getThresholds() {
    return getStore();
  },

  async createThreshold(payload) {
    const thresholds = getStore();
    if (thresholds.some((t) => t.name === payload.name)) {
      throw new Error(
        `A threshold with name "${payload.name}" already exists.`,
      );
    }

    const newThreshold = {
      ...payload,
      id: `temp-${Date.now()}`,
      periodType:
        payload.thresholdType === "ACTUAL" ? null : payload.periodType,
    };

    thresholds.push(newThreshold);
    setStore(thresholds);
    return newThreshold;
  },

  async updateThreshold(id, payload) {
    const thresholds = getStore();
    const index = thresholds.findIndex((t) => t.id === id);

    if (index !== -1) {
      if (
        payload.name &&
        thresholds.some((t) => t.name === payload.name && t.id !== id)
      ) {
        throw new Error(
          `A threshold with name "${payload.name}" already exists.`,
        );
      }

      thresholds[index] = { ...thresholds[index], ...payload };
      setStore(thresholds);
      return thresholds[index];
    }
    throw new Error("Threshold not found locally");
  },

  async deleteThreshold(id) {
    const thresholds = getStore();
    const newThresholds = thresholds.filter((t) => t.id !== id);
    setStore(newThresholds);
    return true;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
