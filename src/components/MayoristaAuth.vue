<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modoLogin = ref(true)
const esperandoCodigo = ref(false) // Estado para el paso del código (Login o Registro)

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

const manejarLogin = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

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

    // Si el backend pide verificación por código en el login
    if (data.requiere_codigo) {
      esperandoCodigo.value = true
      exitoMensaje.value = 'Código enviado a tu correo. Por favor ingresalo a continuación.'
      return
    }

    // Si devuelve el token directo (fallback por si acaso)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario_activo', JSON.stringify(data.usuario))
    localStorage.setItem('mayorista_desbloqueado', 'true')
    window.dispatchEvent(new Event('storage'))

    router.push('/mayorista/panel')
  } catch (err) {
    errorMensaje.value = err.message
  }
}

const manejarRegistro = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!regNombre.value || !regApellido.value || !regEmail.value || !regPassword.value) {
    errorMensaje.value = 'Completa todos los campos obligatorios.'
    return
  }

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

    // Avanzar al paso del código
    esperandoCodigo.value = true
    exitoMensaje.value = 'Código enviado a tu correo. Por favor ingresalo a continuación.'
  } catch (err) {
    errorMensaje.value = err.message
  }
}

const manejarVerificacionCodigo = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!codigoVerificacion.value) {
    errorMensaje.value = 'Por favor ingresa el código de 6 dígitos.'
    return
  }

  // Identifica el email según si vino de Login o Registro
  const emailAEnviar = modoLogin.value ? loginEmail.value : regEmail.value

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

    // Al verificar correctamente, guardamos las credenciales y redirigimos al panel
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario_activo', JSON.stringify(data.usuario))
    localStorage.setItem('mayorista_desbloqueado', 'true')
    window.dispatchEvent(new Event('storage'))

    esperandoCodigo.value = false
    router.push('/mayorista/panel')
  } catch (err) {
    errorMensaje.value = err.message
  }
}

const cambiarModo = (esLogin) => {
  modoLogin.value = esLogin
  esperandoCodigo.value = false
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

      <div class="selector-tabs">
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
          <input type="password" v-model="loginPassword" required />
        </div>
        <button type="submit" class="btn-submit">Ingresar al Portal</button>
      </form>

      <!-- FORMULARIO REGISTRO (PASO 1: DATOS) -->
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
          <input type="password" v-model="regPassword" required minlength="8" />
        </div>
        <button type="submit" class="btn-submit">Enviar Código de Verificación</button>
      </form>

      <!-- FORMULARIO VERIFICACIÓN (PASO 2: CÓDIGO VERIFICACIÓN TANTO PARA LOGIN COMO REGISTRO) -->
      <form v-else @submit.prevent="manejarVerificacionCodigo" class="formulario">
        <div class="campo">
          <label>Código de Verificación (6 dígitos)</label>
          <input 
            type="text" 
            v-model="codigoVerificacion" 
            required 
            maxlength="6" 
            placeholder="123456" 
            class="input-codigo"
          />
        </div>
        <button type="submit" class="btn-submit">Verificar y Continuar</button>
        <button type="button" class="btn-secundario" @click="esperandoCodigo = false">
          ← Volver atrás
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
  font-family: 'Dancing Script', cursive;
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
  font-size: 1.4rem;
  letter-spacing: 4px;
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

.btn-secundario {
  width: 100%;
  padding: 8px;
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 5px;
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