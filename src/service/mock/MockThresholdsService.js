let thresholds = [
  {
    id: "t1",
    name: "Gas Monthly Limit",
    utility: "GAS",
    type: "HISTORICAL",
    periodType: "ONE_MONTH",
    status: "ACTIVE",
  },
  {
    id: "t2",
    name: "Water Daily Spike",
    utility: "WATER",
    type: "ACTUAL",
    periodType: "",
    status: "ACTIVE",
  },
  {
    id: "t3",
    name: "Elec Forecast",
    utility: "ELECTRICITY",
    type: "FORECAST",
    periodType: "ONE_WEEK",
    status: "EXCEEDED",
  },
  {
    id: "t4",
    name: "Old Gas Limit",
    utility: "GAS",
    type: "HISTORICAL",
    periodType: "ONE_MONTH",
    status: "INACTIVE",
  },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockThresholdService = {
  async getThresholds() {
    await delay();
    return JSON.parse(JSON.stringify(thresholds));
  },

  async createThreshold(data) {
    await delay();
    const newObj = { ...data, id: crypto.randomUUID() };
    thresholds.push(newObj);
    return newObj;
  },

  async updateThreshold(id, data) {
    await delay();
    const idx = thresholds.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Not found");
    thresholds[idx] = { ...data, id };
    return thresholds[idx];
  },

  async deleteThreshold(id) {
    await delay();
    thresholds = thresholds.filter((t) => t.id !== id);
    return true;
  },
};
