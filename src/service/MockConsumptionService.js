export const ConsumptionService = {
  getConsumptions(params) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateHistory(params)), 500);
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
      }, 200);
    });
  },
};

const generateHistory = ({ utility }) => {
  const count = 20;
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
