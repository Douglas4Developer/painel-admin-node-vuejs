<template>
  <v-card>
    <v-card-title>{{ user ? 'Editar Usuário' : 'Novo Usuário' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="onSubmit" ref="formRef">
        <v-text-field
          v-model="form.name"
          label="Nome"
          required
          :rules="[v => !!v || 'Obrigatório']"
        ></v-text-field>
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          required
          :rules="[v => !!v || 'Obrigatório', v => /.+@.+\..+/.test(v) || 'E-mail inválido']"
        ></v-text-field>
        <v-text-field
          v-if="!user"
          v-model="form.password"
          label="Senha"
          type="password"
          required
          :rules="[v => !!v || 'Obrigatório', v => v.length >= 6 || 'Mínimo 6 caracteres']"
        ></v-text-field>
        <v-switch
          v-model="form.isActive"
          label="Ativo"
        ></v-switch>
        <v-select
          v-model="form.roleIds"
          :items="roles"
          item-title="name"
          item-value="id"
          multiple
          chips
          label="Cargos"
        ></v-select>
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
import { ref, watch } from 'vue'
import { useUsersStore } from '../stores/users'

const props = defineProps({
  user: { type: Object, default: null },
  roles: { type: Array,  default: () => [] },
})
const emit = defineEmits(['saved', 'close'])
const usersStore = useUsersStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  isActive: true,
  roleIds: [],
})
const error = ref('')
const loading = ref(false)

watch(
  () => props.user,
  (u) => {
    if (u && u.id) {
      form.value = {
        name: u.name || '',
        email: u.email || '',
        password: '',
        isActive: u.isActive ?? true,
        roleIds: Array.isArray(u.roles)
          ? u.roles.map(r => r.role?.id ?? r.id)  
          : [],
      }
    } else {
      form.value = { name: '', email: '', password: '', isActive: true, roleIds: [] }
    }
  },
  { immediate: true }
)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
  const roleIds = (form.value.roleIds || []).filter(Boolean).map(String); 

    if (props.user && props.user.id) {
      // Atualiza dados básicos
      await usersStore.updateUser(props.user.id, {
        name: form.value.name,
       email: form.value.email,
       isActive: form.value.isActive,
     })
     // Define cargos num endpoint dedicado (fonte da verdade)
     if (roleIds.length) await usersStore.setRoles(props.user.id, roleIds)
     else await usersStore.setRoles(props.user.id, []) // limpa se vazio
   } else {
     // Cria usuário
     const created = await usersStore.createUser({
       name: form.value.name,
       email: form.value.email,
       password: form.value.password,
       isActive: form.value.isActive,
     })
     const newId = created?.id ?? created?.data?.id ?? created?.user?.id
     if (!newId) throw new Error('ID do usuário não retornado na criação')
     await usersStore.setRoles(newId, roleIds)
   }
    emit('saved')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Erro ao salvar'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
