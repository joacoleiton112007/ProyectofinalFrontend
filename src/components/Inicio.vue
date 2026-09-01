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
  <div class="pantalla-login">
    <!-- COLUMNA IZQUIERDA: INFORMACIÓN PARA EL MINORISTA -->
    <div class="panel-info">
      <span class="badge">Ventas al por Mayor</span>
      <h1>Abasto Uruguay</h1>
      <p class="descripcion-info">
        Tu proveedor de confianza. Accedé a nuestro catálogo exclusivo para comercios con precios mayoristas directos y stock actualizado.
      </p>

      <ul class="beneficios">
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Precios Directos:</strong> Sin intermediarios, asegurando el mejor margen para tu negocio.
          </div>
        </li>
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Gestión de Pedidos:</strong> Armá tu carrito en volumen y recibí confirmación inmediata.
          </div>
        </li>
        <li>
          <span class="icono">✓</span>
          <div>
            <strong>Envíos a todo el país:</strong> Coordinamos la entrega directamente en tu local comercial.
          </div>
        </li>
      </ul>
    </div>

    <!-- COLUMNA DERECHA: FORMULARIO DE ACCESO / REGISTRO -->
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

        <h2>{{ esLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2> 
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
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

/* CONTENEDOR PRINCIPAL DE 2 COLUMNAS */
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

/* COLUMNA IZQUIERDA: INFORMACIÓN DE LA TIENDA */
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

/* COLUMNA DERECHA: FORMULARIO */
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
  font-size: 1rem;
  color: #f1f5f9;
  margin-bottom: 25px;
  line-height: 1.4;
}

/* ALERTAS Y ESTILOS DEL FORMULARIO */
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

.btn-principal {
  margin-top: 10px;
  display: inline-block;
  background-color: #b85141;
  color: white;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-principal:hover {
  background-color: #7e1b1b;
}

.btn-principal:active {
  transform: scale(0.97);
}

/* RESPONSIVE */
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