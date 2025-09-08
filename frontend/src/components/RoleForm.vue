<template>
  <v-card>
    <v-card-title>{{ role ? 'Editar Cargo' : 'Novo Cargo' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="form.name"
          label="Nome"
          required
          :rules="[v => !!v || 'Obrigatório']"
        ></v-text-field>
        <v-textarea
          v-model="form.description"
          label="Descrição"
          rows="3"
        ></v-textarea>
      </v-form>
      <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" :loading="loading" @click="onSubmit">Salvar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRolesStore } from '../stores/roles';

const props = defineProps({role: Object});
const emit = defineEmits(['saved', 'close']);

const rolesStore = useRolesStore();
const form = ref({ name: '', description: '' });
const error = ref('');
const loading = ref(false);

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      form.value = { name: newRole.name, description: newRole.description || '' };
    } else {
      form.value = { name: '', description: '' };
    }
  },
  { immediate: true }
);

async function onSubmit() {
  error.value = '';
  loading.value = true;
  try {
    if (props.role) {
      await rolesStore.updateRole(props.role.id, form.value);
    } else {
      await rolesStore.createRole(form.value);
    }
    emit('saved');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao salvar';
  } finally {
    loading.value = false;
  }
}
</script>