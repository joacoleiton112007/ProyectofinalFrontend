<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCarritoStore } from '@/stores/carritoStore';
import { useLibrosStore } from '@/stores/librosstore';

// Importamos la imagen para que Vite resuelva la ruta correctamente
import logoAbasto from '@/assets/images/AbastoLogo250x125.png';

const router = useRouter();
const route = useRoute();
const carritoStore = useCarritoStore();
const librosStore = useLibrosStore();

const usuarioActivo = ref(JSON.parse(localStorage.getItem('usuario_activo')) || null);
const mostrarMenuCuenta = ref(false);

const pestañaActual = computed(() => {
  if (route.path === '/listado') return 'catalogo';
  if (route.path === '/carrito') return 'carrito';
  return 'inicio';
});

const navegarAInicio = () => { router.push('/'); };
const navegarACatalogo = () => { router.push('/listado'); };
const navegarACarrito = () => { router.push('/carrito'); };

const manejarAccionCuenta = () => {
  if (usuarioActivo.value) {
    mostrarMenuCuenta.value = !mostrarMenuCuenta.value;
  } else {
    router.push('/');
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('usuario_activo');
  usuarioActivo.value = null;
  mostrarMenuCuenta.value = false;
  router.push('/');
};
</script>

<template>
  <div class="header-global-container">
    <!-- BARRA SUPERIOR (LOGO, BUSCADOR, BOTÓN CUENTA) -->
    <header class="header-top">
      <div class="logo-box" @click="navegarAInicio">
        <img 
          :src="logoAbasto" 
          alt="Abasto Logo" 
          class="logo-img" 
        />
      </div>

      <div class="search-bar-container">
        <input 
          type="text" 
          v-model="librosStore.textoBuscado" 
          placeholder="Buscar productos..." 
        />
      </div>

      <div class="header-actions cuenta-container">
        <button class="action-btn" @click="manejarAccionCuenta">
          <span class="icon">👤</span> 
          <span>{{ usuarioActivo ? usuarioActivo.nombre : 'Cuenta' }}</span>
        </button>

        <div v-if="usuarioActivo && mostrarMenuCuenta" class="dropdown-cuenta">
          <div class="dropdown-header">
            <p>Conectado como:<br/><strong>{{ usuarioActivo.email }}</strong></p>
          </div>
          <hr />
          <button @click="cerrarSesion" class="dropdown-item btn-salir">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- BARRA INFERIOR (NAVEGACIÓN Y CARRITO) -->
    <nav class="main-navbar">
      <div class="nav-links">
        <button 
          :class="{ active: pestañaActual === 'inicio' }" 
          @click="navegarAInicio"
        >
          Inicio
        </button>
        <button 
          :class="{ active: pestañaActual === 'catalogo' }" 
          @click="navegarACatalogo"
        >
          Ver Catálogo
        </button>
      </div>

      <div class="cart-shortcut" @click="navegarACarrito">
        <span class="icon">🛒</span>
        <span class="cart-total">
          ${{ Number(carritoStore.total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) }}
        </span>
        <span v-if="carritoStore.cantidadTotalItems > 0" class="badge-carrito">
          {{ carritoStore.cantidadTotalItems }}
        </span>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.header-global-container {
  width: 100%;
  background-color: #3C4A57 !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.header-top {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 40px !important;
  background-color: #3C4A57 !important;
}

.logo-box {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 90px !important; /* Aumentado de 55px/60px a 90px para que se vea bien grande */
  width: auto !important;
  max-width: 250px;
  display: block;
  object-fit: contain;
}


.search-bar-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-bar-container input {
  width: 100%;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff !important;
  color: #1e293b !important;
  font-size: 0.95rem;
  outline: none;
}

.search-bar-container input::placeholder {
  color: #94a3b8 !important;
}

.search-bar-container input:focus {
  border-color: #b85141;
  box-shadow: 0 0 0 2px rgba(184, 81, 65, 0.2);
}

.cuenta-container {
  position: relative;
}

.action-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #ffffff !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.18) !important;
}

.dropdown-cuenta {
  position: absolute;
  right: 0;
  top: 45px;
  background: #ffffff !important;
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 220px;
  z-index: 100;
  padding: 12px;
  color: #333333 !important;
}

.dropdown-header {
  padding: 4px 6px;
  font-size: 0.85rem;
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
  font-size: 0.9rem;
}

.btn-salir {
  color: #b53838 !important;
}

.main-navbar {
  background-color: #2e3943 !important;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-links {
  display: flex;
  gap: 6px;
}

.nav-links button {
  background: none;
  border: none;
  border-radius: 4px 4px 0 0;
  color: #cbd5e1 !important;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 14px;
  cursor: pointer;
}

.nav-links button.active {
  color: #ffffff !important;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.12) !important;
}

.cart-shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff !important;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px;
  padding: 4px 10px;
}

.badge-carrito {
  background-color: #b85141 !important;
  color: #ffffff !important;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}
</style>