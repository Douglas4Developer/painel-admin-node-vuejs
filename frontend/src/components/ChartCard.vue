<template>
  <v-card class="h-100">
    <v-card-title class="text-subtitle-1">{{ title }}</v-card-title>
    <v-card-text>
      <apexchart :type="type" height="220" :options="options" :series="series" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;
defineProps({
  title: { type: String, required: true },
  type: { type: String, default: 'bar' }, // 'bar' | 'donut' | 'line' | 'area'
  options: { type: Object, required: true },
  series: { type: Array, required: true },
});
</script>
