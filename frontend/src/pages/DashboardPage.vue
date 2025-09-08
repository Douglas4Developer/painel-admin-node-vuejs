<template>
  <AppLayout>
    <v-container>
      <v-overlay
        :model-value="loading"
        persistent
        scrim="rgba(255,255,255,0.6)"
        class="d-flex align-center justify-center"
      >
        <v-progress-circular indeterminate size="56" width="6" />
      </v-overlay>
      <div class="d-flex justify-space-between align-center mb-4">
        <h1 class="text-h5">Dashboard</h1>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadMetrics" :loading="loading">Atualizar</v-btn>
        <v-overlay :model-value="loading" scrim="rgba(255,255,255,0.6)" contained>
       </v-overlay>
      </div>

      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-text class="d-flex align-center">
              <v-avatar color="primary" class="mr-4">
                <v-icon>mdi-account-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Usuários Totais</div>
                <div class="text-h5">{{ summary.totalUsers }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-text class="d-flex align-center">
              <v-avatar color="success" class="mr-4">
                <v-icon>mdi-check-circle-outline</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Ativos</div>
                <div class="text-h5">{{ summary.activeUsers }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-text class="d-flex align-center">
              <v-avatar color="warning" class="mr-4">
                <v-icon>mdi-account-off-outline</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Inativos</div>
                <div class="text-h5">{{ summary.inactiveUsers }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <ChartCard
            title="Usuários por Cargo"
            type="bar"
            :options="chartByRole.options"
            :series="chartByRole.series"
          />
        </v-col>
        <v-col cols="12" md="6">
          <ChartCard
            title="Ativos x Inativos"
            type="donut"
            :options="chartActive.options"
            :series="chartActive.series"
          />
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import ChartCard from '../components/ChartCard.vue';
import api from '../services/api';

// Estado
const loading = ref(false);
const roles = ref([]);
const summary = ref({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });

// Gráficos
const chartByRole = ref({
  options: {
    chart: { toolbar: { show: false } },
    xaxis: { categories: [] },
  },
  series: [{ name: 'Usuários', data: [] }],
});

const chartActive = ref({
  options: { labels: ['Ativos', 'Inativos'], legend: { position: 'bottom' } },
  series: [0, 0],
});

// Carrega métricas usando endpoints existentes:
// - total: meta.total de GET /users?limit=1
// - ativos: meta.total de GET /users?limit=1&q=is_active:true (vamos simular com filtro no back futuramente)
// - por cargo: meta.total de GET /users?role_id=<id>&limit=1
async function countUsers(params) {
  const res = await api.get('/users', { params: { limit: 1, page: 1, ...params } });
  return res.data.meta.total || 0;
}

async function loadMetrics() {
  loading.value = true;
  try {
    // Carrega roles
    const r = await api.get('/roles');
    roles.value = r.data.data;

 

    // Ativos e inativos (como não temos filtro no back, fazemos duas chamadas por status:
    // sugerido: adicionar ?is_active=true/false no backend; por enquanto, fazemos amostra de paginação 1000)
    // workaround melhor: endpoint /metrics/summary no back. Vamos usar uma estratégia simples:
   // Contagens corretas direto do backend
   const [total, active, inactive] = await Promise.all([
     countUsers({ status: 'todos' }),
     countUsers({ status: 'ativo' }),     // aceita 'ativo'/'active' por causa da normalização no back
     countUsers({ status: 'inativo' }),   // idem
   ]);

    // Por cargo
    const categories = [];
    const values = [];
    for (const role of roles.value) {
      const qty = await countUsers({ role_id: role.id });
      categories.push(role.name);
      values.push(qty);
    }

    summary.value = { totalUsers: total, activeUsers: active, inactiveUsers: inactive };
    chartByRole.value = {
      options: { chart: { toolbar: { show: false } }, xaxis: { categories } },
      series: [{ name: 'Usuários', data: values }],
    };
    chartActive.value = {
      options: { labels: ['Ativos', 'Inativos'], legend: { position: 'bottom' } },
      series: [active, inactive],
    };
  } finally {
    loading.value = false;
  }
}

onMounted(loadMetrics);
</script>
