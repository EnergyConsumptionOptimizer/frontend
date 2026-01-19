<script setup>
const props = defineProps({ color: String, stroke: String });
</script>

<template>
  <path
    d="M12,20a6,6,0,0,1-6-6c0-4,6-10.8,6-10.8S18,10,18,14A6,6,0,0,1,12,20Z"
    :fill="props.color"
    :stroke="props.stroke"
    stroke-width="1"
  />
</template>

<style scoped></style>
