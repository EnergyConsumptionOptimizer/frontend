import { DOMAIN_COLORS } from "@/config/chartPalette.js";
import IconElectricity from "@/assets/icons/electricity.svg?component";
import IconGas from "@/assets/icons/gas.svg?component";
import IconWater from "@/assets/icons/water.svg?component";

export function computeUtilityConsumptionStatsCards(meters) {
  return [
    {
      label: "Gas",
      value: meters.gas?.value?.toString() || "-",
      unit: meters.gas?.utilityConsumptionUnit || "Smc",
      colorVar: DOMAIN_COLORS.gas,
      icon: IconGas,
    },
    {
      label: "Water",
      value: meters.water?.value?.toString() || "-",
      unit: meters.water?.utilityConsumptionUnit || "Smc",
      colorVar: DOMAIN_COLORS.water,
      icon: IconWater,
    },
    {
      label: "Electricity",
      value: meters.electricity?.value?.toString() || "-",
      unit: meters.electricity?.utilityConsumptionUnit || "kWh",
      colorVar: DOMAIN_COLORS.electricity,
      icon: IconElectricity,
    },
  ];
}
