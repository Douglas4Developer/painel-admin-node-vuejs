<template>
  <AppLayout>
    <v-container>
      <div class="d-flex justify-space-between align-center mb-4">
        <h1 class="text-h5">Usuários</h1>
        <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">Novo Usuário</v-btn>
      </div>

      <v-row class="g-3">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="search"
            label="Buscar por nome ou email"
            clearable
            dense
            hide-details
            @keyup.enter="applyFiltersAndFetch"
          >
            <template #append>
              <v-btn
                icon
                variant="text"
                :loading="loading"
                @click="applyFiltersAndFetch"
                aria-label="Buscar"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="selectedRole"
            :items="roleItems"
            label="Filtrar por cargo"
            item-title="name"
            item-value="id"
            clearable
            dense
            hide-details
            @update:model-value="applyFiltersAndFetch()"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="selectedStatus"
            :items="statusItems"
            label="Filtrar por status"
            item-title="label"
            item-value="value"
            clearable
            dense
            hide-details
            @update:model-value="applyFiltersAndFetch()"
          />
        </v-col>
      </v-row>
      <v-skeleton-loader v-if="loading" type="table" />

      <v-alert v-else-if="!users.length" type="info" variant="tonal" class="mb-4">
        Nenhum usuário encontrado.
      </v-alert>

      <v-data-table
        v-else
        :headers="headers"
        :items="users"
        item-key="id"
        class="mb-4 elevation-1"
      >
        <template #item.roles="{ item }">
          <v-chip
            v-for="r in item.roles"
            :key="r.name"
            label
            size="small"
            class="mr-1"
          >
            {{ r.role?.name ?? r.name }}
          </v-chip>
        </template>

        <template #item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'warning'" variant="tonal" size="small">
            {{ item.isActive ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Editar">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" @click="edit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip :text="item.isActive ? 'Desativar' : 'Reativar'">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                :loading="actionLoadingId === item.id"
                @click="toggleActive(item)"
              >
                <v-icon>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-pagination
        v-model="page"
        :length="pages"
        @update:model-value="fetch()"
      />

      <!-- Dialog Form -->
      <v-dialog v-model="dialog" max-width="640">
        <UserForm
          :key="editing?.id || 'new'"
          :user="editing"
          :roles="roles"
          @saved="onSaved"
          @close="dialog = false"
        />
      </v-dialog>
    </v-container>
  </AppLayout>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import UserForm from '../components/UserForm.vue';
import { useUsersStore } from '../stores/users';
import { useRolesStore } from '../stores/roles';

const store = useUsersStore();
const roleStore = useRolesStore();

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Cargos', key: 'roles' },
  { title: 'Status', key: 'isActive' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
];

const statusMap = {
  active: 'ativo',
  inactive: 'inativo',
  all: 'todos',
  null: 'todos', // quando o select é limpo
  undefined: 'todos'
};

const search = ref('');
const selectedRole = ref(null);
const selectedStatus = ref('all'); // UI: ativo | inativo | todos
const page = ref(1);
const limit = ref(10);
const dialog = ref(false);
const editing = ref(null);
const actionLoadingId = ref(null);

const roles = computed(() => roleStore.roles);
const roleItems = computed(() => roles.value);

const users = computed(() => store.users);
const meta = computed(() => store.meta);
const loading = computed(() => store.loading);
const pages = computed(() => Math.max(Math.ceil((meta.value.total || 0) / limit.value), 1));


const statusItems = [
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
  { label: 'Todos', value: 'all' },
];

function openCreateDialog() {
  editing.value = null;
  dialog.value = true;
}

function edit(item) {
  editing.value = item;
  dialog.value = true;
}

async function toggleActive(item) {
  try {
    actionLoadingId.value = item.id;
    if (item.isActive) {
      await store.deactivate(item.id);
    } else {
      await store.update(item.id, { isActive: true });
    }
    await fetch();
  } finally {
    actionLoadingId.value = null;
  }
}

async function fetch() {
  const s = selectedStatus.value;
  const normalizedStatus = statusMap[s] ?? 'todos';
  await store.fetchUsers({
    q: search.value || undefined,
    role_id: selectedRole.value || undefined,
    status: normalizedStatus,
    page: page.value,
    limit: limit.value,
  });
}

function closeDialog() {
  dialog.value = false;
  editing.value = null;
}

function onSaved() {
  dialog.value = false;
  fetch();
}

onMounted(async () => {
  await roleStore.fetchRoles();
  await fetch();
});

function applyFiltersAndFetch() {
  page.value = 1;
  fetch();
}
</script>
