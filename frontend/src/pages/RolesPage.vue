<template>
  <AppLayout>
    <v-container>
      <div class="d-flex justify-space-between align-center mb-4">
        <h1 class="text-h5">Cargos</h1>
        <v-btn color="primary" @click="openCreateDialog">Novo Cargo</v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="roles"
        class="mb-4"
      >
        <template #item.actions="{ item }">
          <v-tooltip text="Editar">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" @click="editRole(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Excluir">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                color="error"
                :loading="actionLoadingId === item.id"
                @click="deleteRole(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-dialog v-model="dialog" max-width="500">
        <RoleForm :role="editingRole" @close="closeDialog" @saved="onSaved" />
      </v-dialog>
    </v-container>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import RoleForm from '../components/RoleForm.vue'
import { useRolesStore } from '../stores/roles'

const rolesStore = useRolesStore()

const dialog = ref(false)
const editingRole = ref(null)
const actionLoadingId = ref(null) // <- faltava

const roles = computed(() => rolesStore.roles)

// Vuetify 3 usa 'key' (não 'value')
const headers = [
  { title: 'Nome',       key: 'name' },
  { title: 'Descrição',  key: 'description' },
  { title: 'Ações',      key: 'actions', sortable: false },
]

function openCreateDialog() {
  editingRole.value = null
  dialog.value = true
}

function editRole(item) {
  editingRole.value = { ...item }
  dialog.value = true
}

async function deleteRole(item) {
  if (!confirm('Deseja remover este cargo?')) return
  try {
    actionLoadingId.value = item.id
    await rolesStore.deleteRole(item.id)
    await rolesStore.fetchRoles()
  } catch (err) {
    alert(err?.response?.data?.message || 'Erro ao remover')
  } finally {
    actionLoadingId.value = null
  }
}

function closeDialog() {
  dialog.value = false
}

async function onSaved() {
  dialog.value = false
  await rolesStore.fetchRoles()
}

onMounted(() => {
  rolesStore.fetchRoles()
})
</script>
