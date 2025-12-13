export const MockConsumptionService = {
  getConsumptions(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = generateHistory(params);
        resolve({
          ...data,
          utility: params.utility,
        });
      }, 500);
    });
  },

  getNextValue(lastValue, utility) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const volatility = { Electricity: 5, Gas: 2, Water: 3 }[utility] || 4;
        const change = Math.random() * (volatility * 2) - volatility;
        const value = Math.max(0, Math.floor(lastValue + change));

        resolve({
          label: new Date().toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          value,
        });
      }, 1000);
    });
  },

  // eslint-disable-next-line no-unused-vars
  getForecast({ utility, period }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = 30;
        const labels = Array.from({ length: count }, (_, i) => `D${i + 1}`);

        const base =
          utility === "ELECTRICITY" ? 50 : utility === "GAS" ? 30 : 15;
        const multiplier = utility === "ELECTRICITY" ? 40 : 20;

        const values = Array.from({ length: count }, () =>
          Math.floor(base + Math.random() * multiplier),
        );

        resolve({ labels, values });
      }, 500);
    });
  },
};

const generateHistory = ({ utility }) => {
  const count = 50;
  const baseValue = { Electricity: 50, Gas: 30, Water: 15 }[utility] || 40;
  const labels = [];
  const values = [];

  let currentValue = baseValue;

  for (let i = 0; i < count; i++) {
    labels.push(`T-${count - i}`);
    currentValue = Math.max(0, currentValue + (Math.random() * 10 - 5));
    values.push(Math.floor(currentValue));
  }

  return { labels, values };
};
