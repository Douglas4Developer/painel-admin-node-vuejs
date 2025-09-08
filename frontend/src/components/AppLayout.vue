<template>
  <v-layout>
    <!-- Drawer ÚNICO: adapta por breakpoint -->
    <v-navigation-drawer
      v-model="drawer"
      class="drawer-left"
      app
      :permanent="!mobile"
      :temporary="mobile"
      :rail="isRail"
      :expand-on-hover="!mobile && railHover && isRail"
      :scrim="mobile"
      :touchless="!mobile"
      width="280"
      theme="dark"
      @mouseenter="!mobile && railHover && (rail = false)"
      @mouseleave="!mobile && railHover && (rail = true)"
    >
      <!-- Cabeçalho -->
      <v-sheet class="px-3 pt-4 pb-2" color="transparent">
        <div class="d-flex align-center">
          <v-avatar size="40" color="white" class="mr-3" rounded="lg">
            <span class="text-primary text-caption">{{ iniciais }}</span>
          </v-avatar>

          <!-- Mostra nome/email só quando expandido -->
          <div v-if="!isRail" class="min-w-0">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ auth.user?.name || 'Usuário' }}
            </div>
            <div class="text-caption text-truncate" style="opacity:.85">
              {{ auth.user?.email }}
            </div>
          </div>
        </div>

        <div v-if="!isRail" class="mt-2">
          <v-chip
            v-for="r in (auth.user?.roles || [])"
            :key="r.id || r.name"
            label size="x-small"
            class="mr-1 mb-1" color="white" variant="text"
          >
            {{ r.name || r }}
          </v-chip>
        </div>
      </v-sheet>

      <v-divider class="my-2" />

      <!-- Navegação -->
      <v-list nav density="comfortable">
        <v-list-subheader v-if="!isRail" class="text-white">Navegação</v-list-subheader>

        <v-list-item
          v-for="item in navItems"
          :key="item.key"
          :to="item.to || undefined"
          :active="item.to && route.name === item.to.name"
          :class="['nav-item' , { 'is-rail': isRail }]"
          :active-class="'nav-active'"
          :ripple="false"
          @click="onNavClick(item)"
        >
          <!-- ÍCONE sempre renderizado -->
          <template #prepend>
            <v-icon :icon="item.icon" size="24" />
          </template>

          <!-- Título só quando expandido -->
          <template #title v-if="!isRail">
            <span class="nav-title">{{ item.title }}</span>
          </template>

          <!-- Tooltip no rail -->
          <v-tooltip v-if="isRail" activator="parent" location="right">
            {{ item.title }}
          </v-tooltip>
        </v-list-item>
      </v-list>


      <v-spacer />

      <v-divider class="my-2" />

      <!-- Ações inferiores -->
      <v-list density="compact">
        <v-list-item
          :title="!isRail ? 'Preferências' : undefined"
          prepend-icon="mdi-tune-variant"
          class="nav-item"
          :class="{ 'is-rail': isRail }"
          :ripple="false"
          @click="notify('Em breve: Preferências')"
        >
          <template #title v-if="!isRail"><span class="nav-title">Preferências</span></template>
          <v-tooltip v-if="isRail" activator="parent" location="right">Preferências</v-tooltip>
        </v-list-item>

        <v-list-item
          :title="!isRail ? 'Sair' : undefined"
          prepend-icon="mdi-logout"
          class="nav-item"
          :class="{ 'is-rail': isRail }"
          :ripple="false"
          @click="requestLogout"
        >
          <template #title v-if="!isRail"><span class="nav-title">Sair</span></template>
          <v-tooltip v-if="isRail" activator="parent" location="right">Sair</v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary" density="comfortable" flat>
      <!-- ÚNICO BOTÃO: no mobile abre/fecha; no desktop alterna rail -->
      <v-btn
        icon variant="text" class="mr-1"
        @click="toggleMainMenu"
        :aria-label="mobile ? 'Abrir menu' : (rail ? 'Expandir menu' : 'Recolher menu')"
      >
        <v-icon v-if="mobile">mdi-menu</v-icon>
        <v-icon v-else>{{ rail ? 'mdi-menu-open' : 'mdi-menu' }}</v-icon>
      </v-btn>

      <img src="@/assets/logo3.svg" alt="Logo" height="32" class="ml-2 mr-3" />
      <v-divider vertical class="mx-2 d-none d-sm-flex" inset />
      <div class="text-subtitle-2 font-weight-medium d-none d-sm-flex">Painel Administrativo</div>

      <v-spacer />

      <v-btn variant="text" class="text-none" @click="openUserPanel" aria-label="Abrir painel do usuário">
        <v-avatar size="28" class="mr-2" color="primary">
          <span class="text-white text-caption">{{ iniciais }}</span>
        </v-avatar>
        <span class="d-none d-sm-inline">{{ auth.user?.name || auth.user?.email || 'Usuário' }}</span>
      </v-btn>
    </v-app-bar>

    <CarregandoTopo />

    <v-main>
      <slot />
    </v-main>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Overlay de logout -->
    <v-overlay :model-value="loading" persistent class="d-flex align-center justify-center" scrim="rgba(255,255,255,0.6)">
      <v-progress-circular indeterminate size="56" width="6" />
    </v-overlay>

    <!-- Confirmação -->
    <v-dialog v-model="confirmLogout" max-width="420">
      <v-card>
        <v-card-title>Sair da conta?</v-card-title>
        <v-card-text>Você será redirecionado para o login.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmLogout = false">Cancelar</v-btn>
          <v-btn color="error" prepend-icon="mdi-logout" @click="doLogout">Sair</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Painel do Usuário (direita) -->
    <v-navigation-drawer v-model="userPanel" location="right" temporary width="420" class="elevation-8">
      <v-sheet class="pa-4 header-tonal">
        <div class="d-flex align-center">
          <v-avatar size="56" class="mr-3" color="primary">
            <span class="text-white text-h6">{{ iniciais }}</span>
          </v-avatar>
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-bold text-truncate">{{ auth.user?.name || 'Usuário' }}</div>
            <div class="text-body-2 text-medium-emphasis text-truncate">{{ auth.user?.email }}</div>
          </div>
        </div>
      </v-sheet>

      <v-list density="comfortable" nav>
        <v-list-subheader>Minha conta</v-list-subheader>
        <v-list-item prepend-icon="mdi-account-edit" title="Editar perfil" @click="goProfile" />
        <v-list-item prepend-icon="mdi-lock-check" title="Trocar senha" @click="notify('Em breve: Trocar senha')" />
        <v-list-item prepend-icon="mdi-history" title="Atividade recente" @click="notify('Em breve: Atividade')" />
      </v-list>

      <v-divider class="my-2" />

      <v-list density="comfortable">
        <v-list-subheader>Sessão</v-list-subheader>
        <v-list-item prepend-icon="mdi-logout" title="Sair" @click="requestLogout" />
      </v-list>

      <template #append>
        <v-divider />
        <div class="pa-3 text-caption text-medium-emphasis">
          Versão {{ appVersion }} ・ {{ new Date().getFullYear() }}
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Sobre mim (direita) -->
    <v-navigation-drawer v-model="aboutPanel" location="right" temporary width="520" class="elevation-12 about-drawer">
      <v-sheet class="pa-5 about-hero">
        <div class="d-flex align-center">
          <v-avatar size="72" class="mr-4" color="primary">
            <span class="text-white text-h5">D</span>
          </v-avatar>
          <div class="min-w-0">
            <div class="text-h6 font-weight-bold text-truncate">Douglas Ferreira</div>
            <div class="text-body-2 text-white opacity-90">Full-Stack Developer • JavaScript | Spring | Vue | Node</div>
          </div>
        </div>
        <div class="mt-3 d-flex flex-wrap gap-2">
          <v-chip color="white" size="small" label class="mr-2 mb-2" variant="elevated">
            <v-icon start size="16">mdi-map-marker</v-icon> Goiânia, BR
          </v-chip>
          <v-chip color="white" size="small" label class="mr-2 mb-2" variant="elevated">
            <v-icon start size="16">mdi-briefcase</v-icon> +5 anos dev
          </v-chip>
        </div>
      </v-sheet>

      <v-list density="comfortable" class="py-2">
        <v-list-subheader>Sobre</v-list-subheader>
        <v-list-item prepend-icon="mdi-information-outline">
          <v-list-item-title>
            Desenvolvedor focado em código limpo, arquitetura em camadas e boas práticas (SOLID, TDD, Design Patterns).
            Experiência em microsserviços, mensageria (Kafka), integrações REST e CI/CD.
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list density="comfortable" class="py-2">
        <v-list-subheader>Habilidades</v-list-subheader>
        <div class="px-4 pb-2 d-flex flex-wrap gap-2">
          <v-chip variant="tonal" color="primary" label>JavaScript (Vue/Angular/React)</v-chip>
          <v-chip variant="tonal" color="primary" label>Spring Boot</v-chip>
          <v-chip variant="tonal" color="primary" label>Node.js</v-chip>
          <v-chip variant="tonal" color="primary" label>PostgreSQL</v-chip>
          <v-chip variant="tonal" color="primary" label>Kafka</v-chip>
          <v-chip variant="tonal" color="primary" label>Docker</v-chip>
          <v-chip variant="tonal" color="primary" label>CI/CD</v-chip>
          <v-chip variant="tonal" color="primary" label>Clean Architecture</v-chip>
          <v-chip variant="tonal" color="primary" label>DDD</v-chip>
        </div>
      </v-list>

      <v-divider />

      <v-list density="comfortable" class="py-2">
        <v-list-subheader>Projetos em destaque</v-list-subheader>
        <v-list-item prepend-icon="mdi-api">
          <v-list-item-title>Integrações judiciais • microservices</v-list-item-title>
          <v-list-item-subtitle>Spring, Kafka, Oracle/Postgres, testes automatizados</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-cellphone-link">
          <v-list-item-title>App de onboarding • Flutter/FlutterFlow</v-list-item-title>
          <v-list-item-subtitle>Autenticação, fluxo de upload, UX mobile first</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list density="comfortable" class="py-2">
        <v-list-subheader>Contato</v-list-subheader>
        <div class="px-4 pb-4 d-flex flex-wrap gap-2">
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-linkedin">LinkedIn</v-btn>
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-github">GitHub</v-btn>
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-email">E-mail</v-btn>
        </div>
      </v-list>
    </v-navigation-drawer>
  </v-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '../stores/auth'
import CarregandoTopo from './CarregandoTopo.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay() // breakpoint reativo

// Estados
const drawer = ref(false)   // mobile: fechado; desktop: aberto (onMounted)
const rail = ref(false)     // desktop: começa expandido (false). true => rail
const railHover = ref(true) // defina false se não quiser expandir no hover

// Derivados
const isRail = computed(() => !mobile.value && rail.value)

const userPanel = ref(false)
const aboutPanel = ref(false)
const loading = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })
const confirmLogout = ref(false)

const navItems = [
  { key: 'dash',  title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'Dashboard' } },
  { key: 'users', title: 'Usuários',  icon: 'mdi-account-multiple-outline', to: { name: 'Users' } },
  { key: 'roles', title: 'Cargos',    icon: 'mdi-briefcase-variant-outline', to: { name: 'Roles' } },
  { key: 'about', title: 'Sobre mim', icon: 'mdi-account-badge', onClick: 'about' },
]

const appVersion = '1.0.0'

const iniciais = computed(() => {
  const base = (auth.user?.name || auth.user?.email || '').trim()
  if (!base) return '?'
  const principal = base.includes('@') ? base.split('@')[0] : base
  const parts = principal.split(' ').filter(Boolean)
  const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
  return letters || 'U'
})

// Ações
function toggleMainMenu () {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    rail.value = !rail.value
  }
}

function onNavClick (item) {
  if (item.onClick) runItemAction(item.onClick)
  if (mobile.value) drawer.value = false // fecha no mobile
}

function runItemAction (action) {
  if (action === 'about') openAbout()
}

function openUserPanel () { userPanel.value = true }
function openAbout () { aboutPanel.value = true }
function goProfile () {
  userPanel.value = false
  router.push({ name: 'Profile' })
}
function notify (message, color = 'success') {
  snackbar.value = { show: true, message, color }
}
function requestLogout () { confirmLogout.value = true }
async function doLogout () {
  try {
    loading.value = true
    await auth.logout()
    notify('Sessão encerrada')
    router.replace({ name: 'Login' })
  } catch {
    notify('Falha ao sair', 'error')
  } finally {
    loading.value = false
    confirmLogout.value = false
  }
}

// Hooks
onMounted(async () => {
  if (!mobile.value) drawer.value = true // desktop começa aberto
  if (auth.isAuthenticated && !auth.user?.name && !auth.user?.email) {
    try { await auth.fetchMe() } catch (e) { console.error('fetchMe falhou', e) }
  }
})

// Fecha no mobile ao trocar de rota
watch(() => route.fullPath, () => {
  if (mobile.value) drawer.value = false
})

// Ajusta estados ao mudar de breakpoint
watch(mobile, (isMobile) => {
  if (isMobile) {
    rail.value = false
    drawer.value = false
  } else {
    drawer.value = true
  }
})
</script>

<style scoped>
/* Drawer azul */
.drawer-left {
  background-color: rgb(62,81,181) !important;
  border-right: none;
}
:deep(.drawer-left .is-rail.nav-item) {
  margin: 4px 6px;
  padding-inline: 4px;
}

:deep(.drawer-left .v-list-item__prepend) {
  min-width: 48px;             /* espaço fixo para o ícone */
  display: flex;
  justify-content: center;     /* centraliza o ícone no rail */
}

/* Mantém o tratamento visual do ícone no hover/ativo */
:deep(.drawer-left .is-rail.nav-item .v-list-item__prepend > .v-icon) {
  padding: 8px; border-radius: 12px; background: transparent;
  transition: background .18s ease, transform .12s ease;
}
:deep(.drawer-left .is-rail.nav-item:hover .v-list-item__prepend > .v-icon) { background: rgba(255,255,255,.12); }
:deep(.drawer-left .is-rail.nav-active .v-list-item__prepend > .v-icon) { background: rgba(255,255,255,.22); }
:deep(.v-navigation-drawer--rail.v-navigation-drawer--active) {
  --v-layout-left: var(--v-navigation-drawer-rail-width) !important;
}

/* Cabeçalho tonal do painel direito */
.header-tonal { background: rgba(62,81,181,.10); border-bottom: 1px solid rgba(0,0,0,.06); }

/* Sobre mim */
.about-drawer .v-list-subheader { font-weight: 600; }
.about-hero {
  background: linear-gradient(135deg,
    rgba(62,81,181,1) 0%,
    rgba(62,81,181,.85) 60%,
    rgba(62,81,181,.65) 100%);
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,.2);
}
.gap-2 { gap: .5rem; }
.opacity-90 { opacity: .9; }
</style>
