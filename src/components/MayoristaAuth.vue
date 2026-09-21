<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modoLogin = ref(true)
const esperandoCodigo = ref(false)
const cargando = ref(false)

const errorMensaje = ref('')
const exitoMensaje = ref('')

// Campos
const loginEmail = ref('')
const loginPassword = ref('')
const regNombre = ref('')
const regApellido = ref('')
const regEmail = ref('')
const regPassword = ref('')
const codigoVerificacion = ref('')

const API_BASE = 'http://127.0.0.1:8000/api'

// PASO 1: Validar credenciales
const manejarLogin = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''
  cargando.value = true

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión')

    esperandoCodigo.value = true
    exitoMensaje.value = `Código de verificación enviado a ${loginEmail.value}. Revisá tu casilla de correo.`
  } catch (err) {
    errorMensaje.value = err.message
  } finally {
    cargando.value = false
  }
}

// PASO 1 (Alt): Registro
const manejarRegistro = async () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (!regNombre.value || !regApellido.value || !regEmail.value || !regPassword.value) {
    errorMensaje.value = 'Completa todos los campos obligatorios.'
    return
  }

  cargando.value = true

  try {
    const res = await fetch(`${API_BASE}/register`, {
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

    loginEmail.value = regEmail.value
    esperandoCodigo.value = true
    exitoMensaje.value = `Código de verificación enviado a ${regEmail.value}. Revisá tu casilla de correo.`
  } catch (err) {
    errorMensaje.value = err.message
  } finally {
    cargando.value = false
  }
}

// PASO 2: Verificar código OTP
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
    const res = await fetch(`${API_BASE}/verificar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailAEnviar,
        codigo: codigoVerificacion.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.mensaje || 'Código inválido o expirado')

    // Almacenamiento de credenciales y sesión
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario_activo', JSON.stringify(data.usuario))
    localStorage.setItem('mayorista_desbloqueado', 'true')
    
    // Notifica el cambio de almacenamiento para actualizar HeaderMayorista al instante
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
  <div class="pantalla-login">
    <!-- COLUMNA IZQUIERDA: INFORMACIÓN DE MAYORISTAS -->
    <div class="panel-info">
      <span class="badge">Acceso Exclusivo</span>
      <h1>Portal Mayoristas</h1>
      <p class="descripcion-info">
        Gestioná tus compras corporativas, actualizá el catálogo de tu negocio y accedé a precios diferenciados con despacho a todo Uruguay.
      </p>

      <ul class="beneficios">
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Autenticación en 2 Pasos:</strong> Seguridad garantizada con código de verificación por correo electrónico.
          </div>
        </li>
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Gestión de Inventario:</strong> Control de stock, carga masiva de lotes y lista de precios mayoristas.
          </div>
        </li>
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Atención Preferencial:</strong> Soporte directo para distribuidores y locales minoristas asociados.
          </div>
        </li>
      </ul>
    </div>

    <!-- COLUMNA DERECHA: TARJETA DE FORMULARIO -->
    <div class="inicio-container">
      <section class="hero">
        <div class="tabs" v-if="!esperandoCodigo">
          <button 
            type="button" 
            :class="{ activo: !modoLogin }" 
            @click="cambiarModo(false)"
          >
            Registrarse
          </button>
          <button 
            type="button" 
            :class="{ activo: modoLogin }" 
            @click="cambiarModo(true)"
          >
            Iniciar Sesión
          </button>
        </div>

        <template v-if="!esperandoCodigo">
          <h2>{{ modoLogin ? 'Iniciar Sesión' : 'Crear Cuenta Mayorista' }}</h2> 
          <p>{{ modoLogin ? 'Ingresá tus credenciales autorizadas' : 'Completa tus datos para solicitar acceso' }}</p>
        </template>
        <template v-else>
          <h2>Verificación de Correo</h2>
          <p>Ingresá el código enviado a tu casilla</p>
        </template>

        <!-- ALERTAS -->
        <div v-if="errorMensaje" class="alerta-error">
          {{ errorMensaje }}
        </div>

        <div v-if="exitoMensaje" class="alerta-exito">
          {{ exitoMensaje }}
        </div>

        <!-- FORMULARIO LOGIN (PASO 1) -->
        <form v-if="modoLogin && !esperandoCodigo" @submit.prevent="manejarLogin" class="formulario">
          <div class="campo">
            <label>Correo electrónico</label>
            <input type="email" v-model="loginEmail" required placeholder="empresa@correo.com" />
          </div>
          <div class="campo">
            <label>Contraseña</label>
            <input type="password" v-model="loginPassword" required placeholder="••••••••" />
          </div>
          <button type="submit" class="btn-principal" :disabled="cargando">
            {{ cargando ? 'Verificando...' : 'Ingresar al Portal' }}
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
            <label>Correo electrónico</label>
            <input type="email" v-model="regEmail" required placeholder="contacto@empresa.com" />
          </div>
          <div class="campo">
            <label>Contraseña</label>
            <input type="password" v-model="regPassword" required minlength="8" placeholder="••••••••" />
          </div>
          <button type="submit" class="btn-principal" :disabled="cargando">
            {{ cargando ? 'Enviando código...' : 'Solicitar Código' }}
          </button>
        </form>

        <!-- FORMULARIO VERIFICACIÓN (PASO 2) -->
        <form v-else @submit.prevent="manejarVerificacionCodigo" class="formulario">
          <div class="campo">
            <label>Código de 6 dígitos</label>
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

          <button type="submit" class="btn-principal" :disabled="cargando">
            {{ cargando ? 'Validando...' : 'Verificar y Entrar' }}
          </button>

          <button type="button" class="btn-volver" @click="esperandoCodigo = false">
            ← Cancelar y volver
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.pantalla-login {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 50px auto;
  padding: 0 20px;
  gap: 50px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.panel-info {
  flex: 1;
  text-align: left;
  color: #1e293b;
}

.badge {
  display: inline-block;
  background-color: #e2e8f0;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.panel-info h1 {
  font-family: 'Lora', Georgia, serif;
  font-size: 2.5rem;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 15px;
}

.descripcion-info {
  font-size: 1.05rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 30px;
}

.beneficios {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.beneficios li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.4;
}

.beneficios .icono {
  background-color: #b85141;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
}

.inicio-container {
  flex: 1;
  max-width: 450px;
  width: 100%;
}

.hero {
  background: #3c4a57;
  border: 1px solid #e2e8f0;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tabs {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 25px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: bold;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabs button.activo {
  background-color: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.hero h2 {
  font-family: 'Lora', Georgia, serif;
  font-size: 1.8rem;
  font-style: italic;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 5px;
}

.hero p {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  color: #f1f5f9;
  margin-bottom: 25px;
  line-height: 1.4;
}

.alerta-error {
  background-color: #fef2f2;
  color: #921919;
  border: 1px solid #fecaca;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  margin-bottom: 16px;
  text-align: center;
}

.alerta-exito {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  margin-bottom: 16px;
  text-align: center;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 6px;
}

.campo label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f1f5f9;
}

.campo input {
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo input:focus {
  border-color: #b85141;
  box-shadow: 0 0 0 3px rgba(184, 81, 65, 0.2);
}

.input-codigo {
  text-align: center;
  font-size: 1.6rem !important;
  letter-spacing: 8px;
  font-weight: bold;
}

.btn-principal {
  margin-top: 10px;
  display: inline-block;
  background-color: #b85141;
  color: white;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-principal:hover:not(:disabled) {
  background-color: #7e1b1b;
}

.btn-principal:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-volver {
  background: transparent;
  color: #cbd5e1;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 5px;
}

.btn-volver:hover {
  color: #ffffff;
}

@media (max-width: 850px) {
  .pantalla-login {
    flex-direction: column;
    margin: 20px auto;
    gap: 30px;
  }
  .panel-info {
    text-align: center;
  }
  .beneficios li {
    text-align: left;
  }
}
</style>