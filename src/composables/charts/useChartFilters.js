import { reactive, onMounted } from "vue";

export function useChartFilters(props, emit) {
  const filters = reactive({
    utility: props.utilities?.[0],
    time: props.timeRanges?.[0],
    granularity: props.granularities?.[0],
    user: props.users?.[0],
    zone: props.zones?.[0],
  });

  const isDefault = (val, defaults) => val?.value === defaults?.[0]?.value;

  const handleFilterChange = (source) => {
    if (source === "user" && !isDefault(filters.user, props.users)) {
      filters.zone = props.zones[0];
    }
    if (source === "zone" && !isDefault(filters.zone, props.zones)) {
      filters.user = props.users[0];
    }

    emit("filter-change", { ...filters });
  };

  onMounted(() => {
    emit("filter-change", { ...filters });
  });

  return { filters, handleFilterChange };
}
