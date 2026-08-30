<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  alHacerClicEnVer: {
    type: Function,
    required: false
  }
});

const router = useRouter();

const esLogin = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

// Variables independientes para Registro
const nombreRegistro = ref('');
const emailRegistro = ref('');
const passwordRegistro = ref('');

// Variables independientes para Login
const emailLogin = ref('');
const passwordLogin = ref('');

const cambiarTab = (loginEstado) => {
  esLogin.value = loginEstado;
  mensajeError.value = '';
  mensajeExito.value = '';
};

const handleSubmit = () => {
  mensajeError.value = '';
  mensajeExito.value = '';
  const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_app')) || [];

  if (esLogin.value) {
    // Autenticación de Inicio de Sesión
    const usuarioEncontrado = usuariosGuardados.find(
      (user) => user.email === emailLogin.value && user.password === passwordLogin.value
    );

    if (usuarioEncontrado) {
      localStorage.setItem('usuario_activo', JSON.stringify(usuarioEncontrado));
      router.push('/listado');
    } else {
      mensajeError.value = 'Correo o contraseña incorrectos, o el usuario no existe.';
    }
  } else {
    // Autenticación de Registro
    const existeUsuario = usuariosGuardados.some((user) => user.email === emailRegistro.value);

    if (existeUsuario) {
      mensajeError.value = 'Este correo electrónico ya está registrado.';
      return;
    }

    const nuevoUsuario = {
      nombre: nombreRegistro.value,
      email: emailRegistro.value,
      password: passwordRegistro.value
    };

    usuariosGuardados.push(nuevoUsuario);
    localStorage.setItem('usuarios_app', JSON.stringify(usuariosGuardados));

    // Limpiar campos de registro
    nombreRegistro.value = '';
    emailRegistro.value = '';
    passwordRegistro.value = '';

    // Redirigir a la vista de Inicio de Sesión
    esLogin.value = true;
    mensajeExito.value = 'Cuenta creada exitosamente. Inicia sesión para continuar.';
  }
};
</script>

<template>
  <div class="inicio-container">
    <section class="hero">
      <div class="tabs">
        <button 
          type="button" 
          :class="{ activo: !esLogin }" 
          @click="cambiarTab(false)"
        >
          Registrarse
        </button>
        <button 
          type="button" 
          :class="{ activo: esLogin }" 
          @click="cambiarTab(true)"
        >
          Iniciar Sesión
        </button>
      </div>

      <h2>{{ esLogin ? 'Iniciar Sesión' : 'Registrar Sesion' }}</h2>
      <p>{{ esLogin ? 'Ingresa tus credenciales para continuar' : 'Crea tu cuenta para acceder a la plataforma' }}</p>

      <!-- Alertas de estado -->
      <div v-if="mensajeError" class="alerta-error">
        {{ mensajeError }}
      </div>

      <div v-if="mensajeExito" class="alerta-exito">
        {{ mensajeExito }}
      </div>

      <!-- FORMULARIO DE REGISTRO -->
      <form v-if="!esLogin" key="form-registro" @submit.prevent="handleSubmit" class="formulario">
        <div class="campo">
          <label for="reg-nombre">Nombre completo</label>
          <input 
            id="reg-nombre" 
            v-model="nombreRegistro" 
            type="text" 
            autocomplete="name"
            placeholder="Tu nombre completo" 
            required 
            @invalid="$event.target.setCustomValidity('Por favor completa este campo')"
            @input="$event.target.setCustomValidity('')"
          />
        </div>

        <div class="campo">
          <label for="reg-email">Correo electrónico</label>
          <input 
            id="reg-email" 
            v-model="emailRegistro" 
            type="email" 
            autocomplete="email"
            placeholder="correo@ejemplo.com" 
            required 
            @invalid="
              $event.target.validity.valueMissing 
                ? $event.target.setCustomValidity('Por favor completa este campo')
                : $event.target.setCustomValidity('Por favor ingresa una dirección de correo electrónico con \'@\'')
            "
            @input="$event.target.setCustomValidity('')"
          />
        </div>

        <div class="campo">
          <label for="reg-password">Contraseña</label>
          <input 
            id="reg-password" 
            v-model="passwordRegistro" 
            type="password" 
            autocomplete="new-password"
            placeholder="••••••••" 
            required 
            @invalid="$event.target.setCustomValidity('Por favor completa este campo')"
            @input="$event.target.setCustomValidity('')"
          />
        </div>

        <button type="submit" class="btn-principal">Registrarse</button>
      </form>

      <!-- FORMULARIO DE INICIO DE SESIÓN -->
      <form v-else key="form-login" @submit.prevent="handleSubmit" class="formulario">
        <div class="campo">
          <label for="login-email">Correo electrónico</label>
          <input 
            id="login-email" 
            v-model="emailLogin" 
            type="email" 
            autocomplete="username"
            placeholder="correo@ejemplo.com" 
            required 
            @invalid="
              $event.target.validity.valueMissing 
                ? $event.target.setCustomValidity('Por favor completa este campo')
                : $event.target.setCustomValidity('Por favor ingresa una dirección de correo electrónico con \'@\'')
            "
            @input="$event.target.setCustomValidity('')"
          />
        </div>

        <div class="campo">
          <label for="login-password">Contraseña</label>
          <input 
            id="login-password" 
            v-model="passwordLogin" 
            type="password" 
            autocomplete="current-password"
            placeholder="••••••••" 
            required 
            @invalid="$event.target.setCustomValidity('Por favor completa este campo')"
            @input="$event.target.setCustomValidity('')"
          />
        </div>

        <button type="submit" class="btn-principal">Entrar</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.inicio-container {
  max-width: 500px;
  margin: 40px auto 0 auto;
  text-align: center;
}

.hero {
  background: #3c4a57;;
  border: 1px solid #e2e8f0;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 8px;
}

.hero p {
  font-size: 1rem;
  color: #cbd5e1;
  margin-bottom: 25px;
}

.alerta-error {
  background-color: #fef2f2;
  color: #921919;
  border: 1px solid #fecaca;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
}

.alerta-exito {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
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
  font-size: 0.85rem;
  font-weight: 600;
  color: #f1f5f9;
}

.campo input {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.campo input:focus {
  border-color: #b85141;
}

.btn-principal {
  margin-top: 10px;
  display: inline-block;
  background-color: #b85141;
  color: white;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
 
}

.btn-principal:hover {
  background-color: #7e1b1b;
}

.btn-principal:active {
  transform: scale(0.97);
}
</style>