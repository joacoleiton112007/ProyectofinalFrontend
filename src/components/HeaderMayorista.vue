<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const usuarioActivo = ref(
  JSON.parse(localStorage.getItem('usuario_activo')) || null
);

const mostrarMenuCuenta = ref(false);

const actualizarUsuario = () => {
  usuarioActivo.value =
    JSON.parse(localStorage.getItem('usuario_activo')) || null;
};

onMounted(() => {
  window.addEventListener('storage', actualizarUsuario);
});

onUnmounted(() => {
  window.removeEventListener('storage', actualizarUsuario);
});

const irAlSitioPublico = () => {
  router.push('/');
};

const toggleMenuCuenta = () => {
  if (usuarioActivo.value) {
    mostrarMenuCuenta.value = !mostrarMenuCuenta.value;
  } else {
    router.push('/mayorista/login');
  }
};

const cerrarSesionMayorista = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario_activo');
  localStorage.removeItem('mayorista_desbloqueado');

  usuarioActivo.value = null;
  mostrarMenuCuenta.value = false;

  window.dispatchEvent(new Event('storage'));

  router.push('/mayorista/login');
};
</script>

<template>
  <header class="header-mayorista-wrapper">

    <!-- Nivel 1: Marca B2B y Gestión de Cuenta -->
    <div class="header-top-mayorista">

      <div class="brand-area" @click="irAlSitioPublico">
        <img
          src="/src/assets/images/AbastoLogo250x125.png"
          alt="Abasto Logo"
          width="200"
          height="83"
          class="logo-img"
        />

        <span class="badge-b2b">
          PORTAL MAYORISTA
        </span>
      </div>

      <div class="cuenta-container">

        <button
          class="action-btn-mayorista"
          @click="toggleMenuCuenta"
        >
          <span>🏢</span>

          {{
            usuarioActivo
              ? (usuarioActivo.nombre || usuarioActivo.email)
              : 'Acceso Mayorista'
          }}
        </button>

        <div
          v-if="usuarioActivo && mostrarMenuCuenta"
          class="dropdown-cuenta"
        >

          <div class="dropdown-header">
            <p>
              Conectado como:<br />
              <strong>{{ usuarioActivo.email }}</strong>
            </p>
          </div>

          <hr />

          <button
            @click="irAlSitioPublico"
            class="dropdown-item"
          >
            🌐 Volver a Tienda
          </button>

          <button
            @click="cerrarSesionMayorista"
            class="dropdown-item btn-salir"
          >
            🚪 Cerrar Sesión
          </button>

        </div>

      </div>

    </div>

    <!-- Nivel 2: Barra de navegación -->
    <nav class="main-navbar-mayorista">

      <div class="tienda-link" @click="irAlSitioPublico">
        <span>← Volver al e-Commerce</span>
      </div>

    </nav>

  </header>
</template>

<style scoped>
.header-top-mayorista {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
  background-color: #3C4A57;
  border-bottom: 2px solid #b85141;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
}

.logo-img {
  object-fit: contain;
}

.badge-b2b {
  background-color: #b85141;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.action-btn-mayorista {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.action-btn-mayorista:hover {
  border-color: #ffffff;
  background-color: rgba(255, 255, 255, 0.18);
}

.cuenta-container {
  position: relative;
}

.dropdown-cuenta {
  position: absolute;
  right: 0;
  top: 48px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  width: 230px;
  z-index: 100;
  padding: 12px;
  color: #333333;
}

.dropdown-header {
  padding: 4px 6px;
  font-size: 0.85rem;
  line-height: 1.3;
}

.dropdown-cuenta hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  color: #333333;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.btn-salir {
  color: #b53838;
  font-weight: 600;
}

.btn-salir:hover {
  background-color: #fdf2f2;
}

.main-navbar-mayorista {
  background-color: #2e3943;
  padding: 0 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 46px;
}

.tienda-link {
  color: #cbd5e1;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.tienda-link:hover {
  color: #ffffff;
}
</style>