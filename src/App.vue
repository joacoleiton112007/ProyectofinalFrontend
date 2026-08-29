<script setup>
import { computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useCarritoStore } from '@/stores/carritoStore';

const router = useRouter();
const route = useRoute();
const carritoStore = useCarritoStore();

const pestañaActual = computed(() => {
  if (route.path === '/listado') return 'catalogo';
  if (route.path === '/carrito') return 'carrito';
  return 'inicio';
});

const navegarAInicio = () => {
  router.push('/');
};

const navegarACatalogo = () => {
  router.push('/listado');
};

const navegarACarrito = () => {
  router.push('/carrito');
};
</script>

<template>
  <div class="app-container">
    <!-- Nivel 1: Header superior blanco con buscador -->
    <header class="header-top">
      <div class="logo" @click="navegarAInicio">
        <h2>Rendimiento Conceptual</h2>
      </div>

      <div class="search-bar-container">
        <input type="text" placeholder="Buscar productos..." />
      </div>

      <div class="header-actions">
        
        <button class="action-btn">
          <span>👤</span> Cuenta
        </button>
      </div>
    </header>

    <!-- Nivel 2: Barra de navegación oscura estilo e-commerce -->
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
        <button @click="navegarACatalogo">Mujer</button>
        <button @click="navegarACatalogo">Hombre</button>
        <button @click="navegarACatalogo">Complementos</button>
      </div>

      <div class="cart-shortcut" @click="navegarACarrito">
        <span>🛒</span>
        <span class="cart-total">$0,00</span>
        <span v-if="carritoStore.cantidadTotalItems > 0" class="badge-carrito">
          {{ carritoStore.cantidadTotalItems }}
        </span>
      </div>
    </nav>

    <!-- Contenido dinámico -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #d9d0c9;
}

/* Header Superior Blanco */
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  background-color: #ffffff;
}

.logo {
  cursor: pointer;
}

.logo h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
  letter-spacing: -0.5px;
}

.search-bar-container {
  flex: 1;
  max-width: 550px;
  margin: 0 30px;
}

.search-bar-container input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-bar-container input:focus {
  outline: none;
  background-color: #584949;
  border-color: #b53838;
}

.header-actions {
  display: flex;
  gap: 20px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Barra Oscura de Navegación */
.main-navbar {
  background-color: #3c4a57;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-links button {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 8px 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-links button:hover {
  color: #ffffff;
}

.nav-links button.active {
  color: #ffffff;
  font-weight: 700;
}

/* Carrito en la Barra Oscura */
.cart-shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  position: relative;
}

.badge-carrito {
  background-color: #b53838;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}

.content {
  padding: 30px 40px;
}
</style>