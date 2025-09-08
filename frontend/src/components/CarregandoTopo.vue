<template>
  <v-progress-linear
    v-if="isLoading"
    indeterminate
    color="primary"
    height="3"
    style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999;"
  />
</template>

<script setup>
// Componente de barra de carregamento global (top loader).
import { computed } from 'vue';
import { useUiStore } from '../stores/ui';

const ui = useUiStore();
const isLoading = computed(() => ui.isLoading);
</script>
