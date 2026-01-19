import { reactive } from "vue";

export function useChartFilters(props, emit) {
  const firstTimeKey = Object.keys(props.timeFilterConfig)[0];
  const firstGranularity =
    props.timeFilterConfig[firstTimeKey]?.granularities?.[0];

  const filters = reactive({
    utility: props.utilities?.[0] || "",
    time: firstTimeKey || "",
    granularity: firstGranularity || "",
    user: props.users?.[0] || "",
    zone: props.zones?.[0] || "",
  });

  const handleFilterChange = (key) => {
    if (key === "time") {
      filters.granularity =
        props.timeFilterConfig[filters.time]?.granularities?.[0];
    }

    emit("filter-change", { ...filters });
  };

  return {
    filters,
    handleFilterChange,
  };
}
