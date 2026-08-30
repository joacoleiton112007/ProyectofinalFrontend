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
        <h2>NemBless</h2>
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
  background-color: #3C4A57;
}

.logo {
  cursor: pointer;
}

.logo h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #BAB3B3;
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
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-bar-container input:focus {
  outline: none;
  background-color: #ffffff;
  border-color: #7b7878;
}

.header-actions {
  display: flex;
  gap: 20px;
}

/* 1. Botón Cuenta con borde */
.action-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Barra Oscura de Navegación */
.main-navbar {
  background-color: #3c4a57;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-links {
  display: flex;
  gap: 8px;
}

/* 2. Botones de Navegación con borde */
.nav-links button {
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #cccccc;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-links button:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-links button.active {
  color: #ffffff;
  font-weight: 700;
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.1);
}

/* 3. Acceso rápido al Carrito con borde */
.cart-shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.cart-shortcut:hover {
  border-color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
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