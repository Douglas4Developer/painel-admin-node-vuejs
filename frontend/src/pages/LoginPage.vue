<template>
  <v-container fluid class="auth-wrap">
    <div class="auth-hero d-none d-md-flex">
      <div class="hero-inner">
        <h2>Bem-vindo</h2>
        <p>Acesse sua conta para continuar. Segurança com sessão JWT renovável.</p>
        <div class="hero-shapes" aria-hidden="true"></div>
      </div>
    </div>

    <div class="auth-panel">
      <v-hover v-slot="{ isHovering, props }">
        <v-card v-bind="props" class="glass p-card" :elevation="isHovering ? 18 : 12">
          <div class="brand">
            <img src="@/assets/logo3.svg" alt="Logo" height="36" />
            <span class="brand-title">Login</span>
          </div>

          <v-alert
            v-if="errorMessage"
            type="error" variant="tonal" density="comfortable"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <v-form ref="formRef" @submit.prevent="onSubmit" validate-on="submit" class="form-grid">
            <v-text-field
              v-model="email" label="Email" type="email" variant="solo"
              density="comfortable" prepend-inner-icon="mdi-email-outline"
              :rules="[req]" autocomplete="email" class="mb-3"
            />
            <v-text-field
              v-model="password" :type="show ? 'text' : 'password'" label="Senha"
              variant="solo" density="comfortable" prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="show = !show" :rules="[req]"
              autocomplete="current-password" class="mb-2"
              @keydown="checkCaps" @keyup="checkCaps"
            />
            <div class="d-flex align-center justify-space-between mb-4">
              <v-checkbox v-model="remember" label="Lembrar de mim" density="compact" hide-details />
              <span v-if="capsOn" class="text-caption d-inline-flex align-center">
                <v-icon size="18" class="mr-1">mdi-keyboard-caps</v-icon> Caps Lock ativo
              </span>
            </div>

            <v-btn class="gbtn mb-2" size="large" block type="submit" :loading="loading" :disabled="loading">
              <v-icon start>mdi-login-variant</v-icon> Entrar
            </v-btn>

            <div class="or my-4"><v-divider /><span>ou</span><v-divider /></div>

            <div class="text-center text-body-2">
              Não tem conta?
              <v-btn variant="text" class="text-none" @click="goRegister">Criar conta</v-btn>
            </div>
          </v-form>
        </v-card>
      </v-hover>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref(null)
const email = ref('')
const password = ref('')
const remember = ref(false)
const show = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const capsOn = ref(false)

const req = v => (!!v ? true : 'Obrigatório')
const goRegister = () => router.push({ name: 'Register' })
const checkCaps = e => { capsOn.value = !!(e.getModifierState && e.getModifierState('CapsLock')) }

async function onSubmit () {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; errorMessage.value = ''
  try {
    await auth.login(email.value, password.value, { remember: remember.value })
    router.replace(route.query.redirect || '/dashboard')
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || 'Não foi possível entrar. Verifique suas credenciais.'
  } finally { loading.value = false }
}
</script>

<style scoped>
/* grid do formulário com respiro consistente */
.form-grid{
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;          /* mobile */
}

@media (min-width: 960px){
  .form-grid{ row-gap: 18px; }  /* desktop */
}

/* logo/título com mais folga inferior */
.brand{ margin-bottom: 22px; }   /* antes era 18px */
@media (min-width: 960px){
  .brand{ margin-bottom: 26px; }
}

/* botão principal com respiro extra do resto */
.gbtn{ margin-top: 6px; }

/* inputs mais altos (mantendo o visual "solo") */
:deep(.v-field--variant-solo){
  --v-field-padding-start: 16px;
  border-radius: 14px;
}
:deep(.v-field){ min-height: 52px; }           /* altura base */
@media (min-width: 960px){
  :deep(.v-field){ min-height: 56px; }         /* um tiquinho maior no desktop */
}

/* ajusta o espaçamento do checkbox + dica do CapsLock */
.form-grid :deep(.v-checkbox){ margin-top: 4px; }

/* card com padding mais generoso no desktop e mais contido no mobile */
.p-card{ width:min(520px, 92vw); padding: 24px 22px; }
@media (min-width: 960px){
  .p-card{ padding: 28px 28px; }
}

/* afasta levemente o divisor "ou" do botão e dos links */
.or{ margin: 10px 0 4px; }

/* melhora o alinhamento vertical geral do painel em telas altas */
.auth-panel{ padding: clamp(24px, 3vw, 48px); }
/* ====== LAYOUT SPLIT ====== */
.auth-wrap{
  min-height:100vh; display:grid; grid-template-columns: 1.2fr 1fr;
  background:
    radial-gradient(900px 600px at 10% 15%, rgba(136, 84, 255,.25), transparent 70%),
    radial-gradient(900px 600px at 95% 85%, rgba(0, 200, 255,.22), transparent 70%),
    linear-gradient(135deg,#1c1d39 0%, #2a1b49 45%, #0f265c 100%);
}
.auth-hero{ position:relative; display:flex; align-items:center; color:#fff; }
.hero-inner{ padding: clamp(32px,6vw,80px); max-width: 680px; }
.hero-inner h2{ font-size: clamp(28px,3.4vw,44px); margin:0 0 10px; font-weight:700; }
.hero-inner p{ opacity:.85; line-height:1.6; }
.hero-shapes::before, .hero-shapes::after{
  content:''; position:absolute; inset:auto auto 12% 8%;
  width: 60%; height: 46%;
  background: linear-gradient(120deg, rgba(255,120,80,.55), rgba(255,0,204,.45));
  filter: blur(26px); border-radius: 24px; transform: skewX(-18deg);
}
.hero-shapes::after{ left: auto; right: 8%; bottom: 20%; width: 40%; background: linear-gradient(120deg, rgba(0,208,255,.55), rgba(120,80,255,.45)); }

.auth-panel{ display:flex; align-items:center; justify-content:center; padding: clamp(24px,3vw,40px); }
.p-card{ width:min(520px, 92vw); }

/* ====== GLASS CARD ====== */
.glass{
  backdrop-filter: blur(14px);
  border-radius:24px;
  border:1px solid rgba(255,255,255,.18);
  background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.06));
  box-shadow:
    0 20px 60px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.08);
  color: rgba(255,255,255,.94);
}
.brand{ display:flex; align-items:center; gap:10px; margin-bottom:18px; }
.brand-title{ font-weight:600; font-size:1.15rem; }

/* inputs solo ficam lindos no glass */
:deep(.v-field--variant-solo){ --v-field-padding-start:14px; border-radius:14px; }

/* botão gradiente */
.gbtn{
  border-radius:14px; color:white;
  background: linear-gradient(135deg,#7b5cff 0%, #4da3ff 100%);
  box-shadow: 0 8px 22px rgba(77,163,255,.35);
}

/* divisor “ou” */
.or{ display:flex; align-items:center; gap:12px; }
.or span{ color:rgba(255,255,255,.7); }

/* responsivo */
@media (max-width: 960px){
  .auth-wrap{ grid-template-columns: 1fr; }
  .auth-hero{ display:none !important; }
}
</style>
