<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modoLogin = ref(true)
const esperandoCodigo = ref(false)
const cargando = ref(false)

const errorMensaje = ref('')
const exitoMensaje = ref('')

// Campos Login
const loginEmail = ref('')
const loginPassword = ref('')

// Campos Registro
const regNombre = ref('')
const regApellido = ref('')
const regEmail = ref('')
const regPassword = ref('')

// Campo Código Verificación
const codigoVerificacion = ref('')

// PASO 1: Validar credenciales e iniciar flujo de código
const manejarLogin = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''
  cargando.value = true

  try {
    const res = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión')

    // Al ser válidas las credenciales, avanzamos a la pantalla del código
    esperandoCodigo.value = true
    exitoMensaje.value = `Código de verificación enviado a ${loginEmail.value}. Revisá tu casilla de correo.`
  } catch (err) {
    errorMensaje.value = err.message
  } finally {
    cargando.value = false
  }
}

// PASO 1 (Alternativo): Registro de usuario
const manejarRegistro = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!regNombre.value || !regApellido.value || !regEmail.value || !regPassword.value) {
    errorMensaje.value = 'Completa todos los campos obligatorios.'
    return
  }

  cargando.value = true

  try {
    const res = await fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: regNombre.value,
        apellido: regApellido.value,
        email: regEmail.value,
        password: regPassword.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.mensaje || 'Error al registrar usuario')

    // Guardamos el email registrado para usarlo en la verificación
    loginEmail.value = regEmail.value
    esperandoCodigo.value = true
    exitoMensaje.value = `Código de verificación enviado a ${regEmail.value}. Revisá tu casilla de correo.`
  } catch (err) {
    errorMensaje.value = err.message
  } finally {
    cargando.value = false
  }
}

// PASO 2: Verificar el código de 6 dígitos para otorgar acceso final
const manejarVerificacionCodigo = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!codigoVerificacion.value) {
    errorMensaje.value = 'Por favor ingresa el código de 6 dígitos.'
    return
  }

  const emailAEnviar = modoLogin.value ? loginEmail.value : (regEmail.value || loginEmail.value)
  cargando.value = true

  try {
    const res = await fetch('http://127.0.0.1:8000/api/verificar-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailAEnviar,
        codigo: codigoVerificacion.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.mensaje || 'Código inválido o expirado')

    // Guardado de sesión tras validar código
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario_activo', JSON.stringify(data.usuario))
    localStorage.setItem('mayorista_desbloqueado', 'true')
    window.dispatchEvent(new Event('storage'))

    esperandoCodigo.value = false
    router.push('/mayorista/panel')
  } catch (err) {
    errorMensaje.value = err.message
  } finally {
    cargando.value = false
  }
}

const cambiarModo = (esLogin) => {
  modoLogin.value = esLogin
  esperandoCodigo.value = false
  codigoVerificacion.value = ''
  errorMensaje.value = ''
  exitoMensaje.value = ''
}
</script>

<template>
  <div class="auth-mayorista-container">
    <div class="auth-card">
      <div class="encabezado">
        <h2>Portal Mayoristas</h2>
        <p>Acceso exclusivo para distribuidores y comercios</p>
      </div>

      <!-- Selector de pestaña -->
      <div class="selector-tabs" v-if="!esperandoCodigo">
        <button :class="{ activo: modoLogin }" @click="cambiarModo(true)">Ingresar</button>
        <button :class="{ activo: !modoLogin }" @click="cambiarModo(false)">Registrarse</button>
      </div>

      <p v-if="errorMensaje" class="mensaje error">{{ errorMensaje }}</p>
      <p v-if="exitoMensaje" class="mensaje exito">{{ exitoMensaje }}</p>

      <!-- FORMULARIO LOGIN (PASO 1) -->
      <form v-if="modoLogin && !esperandoCodigo" @submit.prevent="manejarLogin" class="formulario">
        <div class="campo">
          <label>Correo Electrónico</label>
          <input type="email" v-model="loginEmail" required placeholder="empresa@correo.com" />
        </div>
        <div class="campo">
          <label>Contraseña</label>
          <input type="password" v-model="loginPassword" required placeholder="••••••••" />
        </div>
        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Iniciando sesión...' : 'Ingresar al Portal' }}
        </button>
      </form>

      <!-- FORMULARIO REGISTRO (PASO 1) -->
      <form v-else-if="!modoLogin && !esperandoCodigo" @submit.prevent="manejarRegistro" class="formulario">
        <div class="campo">
          <label>Nombre</label>
          <input type="text" v-model="regNombre" required placeholder="Juan" />
        </div>
        <div class="campo">
          <label>Apellido</label>
          <input type="text" v-model="regApellido" required placeholder="Pérez" />
        </div>
        <div class="campo">
          <label>Correo Electrónico</label>
          <input type="email" v-model="regEmail" required placeholder="contacto@empresa.com" />
        </div>
        <div class="campo">
          <label>Contraseña</label>
          <input type="password" v-model="regPassword" required minlength="8" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Enviando código...' : 'Enviar Código de Verificación' }}
        </button>
      </form>

      <!-- FORMULARIO VERIFICACIÓN DE CÓDIGO (PASO 2) -->
      <form v-else @submit.prevent="manejarVerificacionCodigo" class="formulario">
        <div class="info-gmail">
          <p>Revisá tu bandeja de entrada o carpeta de Spam en Gmail e ingresá el código de 6 dígitos que te enviamos.</p>
        </div>

        <div class="campo">
          <label>Código de Verificación</label>
          <input 
            type="text" 
            v-model="codigoVerificacion" 
            required 
            maxlength="6" 
            placeholder="123456" 
            class="input-codigo"
            autocomplete="one-time-code"
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Verificar y Continuar' }}
        </button>

        <button type="button" class="btn-secundario" @click="esperandoCodigo = false">
          ← Cancelar y volver
        </button>
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
  background-color: #d9d0c9;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-gmail {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  text-align: center;
}

.info-gmail p {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
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

.input-codigo {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 6px;
  font-weight: bold;
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

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secundario {
  width: 100%;
  padding: 8px;
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 8px;
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