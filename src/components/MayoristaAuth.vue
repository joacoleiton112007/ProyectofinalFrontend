<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMayoristaStore } from '@/stores/mayoristaStore'

const router = useRouter()
const mayoristaStore = useMayoristaStore()

const modoLogin = ref(true)
const errorMensaje = ref('')
const exitoMensaje = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const regRazonSocial = ref('')
const regRut = ref('')
const regEmail = ref('')
const regPassword = ref('')

const manejarLogin = () => {
  errorMensaje.value = ''
  const res = mayoristaStore.loginMayorista(loginEmail.value, loginPassword.value)
  
  if (res.exito) {
    router.push('/mayorista/panel')
  } else {
    errorMensaje.value = res.mensaje
  }
}

const manejarRegistro = () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!regRazonSocial.value || !regRut.value || !regEmail.value || !regPassword.value) {
    errorMensaje.value = 'Completa todos los campos obligatorios.'
    return
  }

  const res = mayoristaStore.registrarMayorista({
    razonSocial: regRazonSocial.value,
    rut: regRut.value,
    email: regEmail.value,
    password: regPassword.value
  })

  if (res.exito) {
    exitoMensaje.value = res.mensaje
    modoLogin.value = true
    regPassword.value = ''
  } else {
    errorMensaje.value = res.mensaje
  }
}
</script>

<template>
  <div class="auth-mayorista-container">
    <div class="auth-card">
      <div class="encabezado">
        <h2>Portal Mayoristas</h2>
        <p>Acceso exclusivo para distribuidores y comercios</p>
      </div>

      <div class="selector-tabs">
        <button :class="{ activo: modoLogin }" @click="modoLogin = true">Ingresar</button>
        <button :class="{ activo: !modoLogin }" @click="modoLogin = false">Registrarse</button>
      </div>

      <p v-if="errorMensaje" class="mensaje error">{{ errorMensaje }}</p>
      <p v-if="exitoMensaje" class="mensaje exito">{{ exitoMensaje }}</p>

      <form v-if="modoLogin" @submit.prevent="manejarLogin" class="formulario">
        <div class="campo">
          <label>Correo Electrónico</label>
          <input type="email" v-model="loginEmail" required placeholder="empresa@correo.com" />
        </div>
        <div class="campo">
          <label>Contraseña</label>
          <input type="password" v-model="loginPassword" required />
        </div>
        <button type="submit" class="btn-submit">Ingresar al Portal</button>
      </form>

      <form v-else @submit.prevent="manejarRegistro" class="formulario">
        <div class="campo">
          <label>Razón Social / Nombre Comercial</label>
          <input type="text" v-model="regRazonSocial" required placeholder="Distribuidora S.A." />
        </div>
        <div class="campo">
          <label>RUT / RUC</label>
          <input type="text" v-model="regRut" required placeholder="123456789012" />
        </div>
        <div class="campo">
          <label>Correo Electrónico</label>
          <input type="email" v-model="regEmail" required placeholder="contacto@empresa.com" />
        </div>
        <div class="campo">
          <label>Contraseña</label>
          <input type="password" v-model="regPassword" required />
        </div>
        <button type="submit" class="btn-submit">Crear Cuenta Mayorista</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-mayorista-container {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1f5f9;
}

.auth-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.encabezado {
  text-align: center;
  margin-bottom: 20px;
}

.encabezado h2 {
  margin: 0;
  color: #0f172a;
}

.encabezado p {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 5px;
}

.selector-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.selector-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
}

.selector-tabs button.activo {
  color: #1e293b;
  border-bottom: 3px solid #b84941;
}

.formulario .campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.campo label {
  font-size: 0.85rem;
  font-weight: bold;
  color: #334155;
  margin-bottom: 5px;
}

.campo input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.mensaje {
  padding: 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
}

.mensaje.error {
  background-color: #fef2f2;
  color: #ef4444;
}

.mensaje.exito {
  background-color: #f0fdf4;
  color: #16a34a;
}
</style>