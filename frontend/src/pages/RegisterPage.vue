<template>
  <v-container fluid class="auth-wrap">
    <div class="auth-hero d-none d-md-flex">
      <div class="hero-inner">
        <h2>Criar conta</h2>
        <p>Preencha seus dados para começar. Você poderá definir cargos depois.</p>
        <div class="hero-shapes" aria-hidden="true"></div>
      </div>
    </div>

    <div class="auth-panel">
      <v-card class="glass p-card" elevation="12">
        <div class="brand">
          <img src="@/assets/logo2.svg" alt="Logo" height="36" />
          <span class="brand-title">Registro</span>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="onSubmit" validate-on="submit" class="form-grid">
          <v-text-field v-model="name" label="Nome" variant="solo" density="comfortable"
            prepend-inner-icon="mdi-account" :rules="[req]" class="mb-3" autocomplete="name"/>
          <v-text-field v-model="email" label="Email" type="email" variant="solo" density="comfortable"
            prepend-inner-icon="mdi-email-outline" :rules="[req, emailRule]" class="mb-3" autocomplete="email"/>
          <v-text-field v-model="password" :type="showPass ? 'text':'password'" label="Senha" variant="solo"
            density="comfortable" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showPass?'mdi-eye-off':'mdi-eye'"
            @click:append-inner="showPass=!showPass" :rules="[req, min6]" class="mb-1" autocomplete="new-password" @input="calcStrength"/>
          <v-progress-linear :model-value="strength.percent" height="6" rounded class="mb-3" :color="strength.color"/>
          <div class="text-caption mb-2">Força da senha:
            <strong :class="`text-${strength.color}`">{{ strength.label }}</strong>
          </div>
          <v-text-field v-model="confirm" :type="showConf ? 'text':'password'" label="Confirmar senha" variant="solo"
            density="comfortable" prepend-inner-icon="mdi-lock-check-outline" :append-inner-icon="showConf?'mdi-eye-off':'mdi-eye'"
            @click:append-inner="showConf=!showConf" :rules="[req, sameAsPassword]" class="mb-3" autocomplete="new-password"/>
          <v-checkbox v-model="terms" :rules="[v => !!v || 'Necessário aceitar os termos']"
            label="Li e aceito os termos de uso" density="compact" hide-details class="mb-5"/>

          <v-btn class="gbtn" size="large" block type="submit" :loading="loading" :disabled="loading">
            <v-icon start>mdi-account-plus</v-icon> Criar conta
          </v-btn>

          <div class="text-center text-body-2 mt-4">
            Já tem conta?
            <v-btn variant="text" class="text-none" @click="goLogin">Entrar</v-btn>
          </div>
        </v-form>

        <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
          Conta criada com sucesso! Redirecionando…
        </v-alert>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const name = ref(''); const email = ref('')
const password = ref(''); const confirm = ref('')
const showPass = ref(false); const showConf = ref(false)
const terms = ref(false); const loading = ref(false)
const errorMessage = ref(''); const success = ref(false)

const req = v => (!!v ? true : 'Obrigatório')
const min6 = v => (v && v.length >= 6) || 'Mínimo 6 caracteres'
const emailRule = v => /.+@.+\..+/.test(v) || 'E-mail inválido'
const sameAsPassword = v => v === password.value || 'As senhas não coincidem'

const strength = ref({ percent: 0, label: 'Fraca', color: 'error' })
function calcStrength () {
  const v = password.value || ''; let p = 0
  if (v.length >= 6) p += 25; if (/[A-Z]/.test(v)) p += 20
  if (/[a-z]/.test(v)) p += 20; if (/\d/.test(v)) p += 20
  if (/[\W_]/.test(v)) p += 15
  let label='Fraca', color='error'
  if (p>=80){label='Excelente';color='success'} else if (p>=60){label='Boa';color='primary'} else if (p>=40){label='Média';color='warning'}
  strength.value = { percent: Math.min(p,100), label, color }
}
const goLogin = () => router.push({ name: 'Login' })

async function onSubmit () {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; errorMessage.value = ''; success.value = false
  try {
    await api.post('/auth/register', { name: name.value, email: email.value, password: password.value })
    await auth.login(email.value, password.value, { remember: true })
    success.value = true; router.replace({ name: 'Dashboard' })
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || 'Não foi possível criar a conta.'
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
