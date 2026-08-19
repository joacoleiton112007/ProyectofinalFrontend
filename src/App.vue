<script setup>
import { computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();


const pestañaActual = computed(() => {
  if (route.path === '/listado') return 'catalogo';
  return 'inicio';
});


const navegarAInicio = () => {
  router.push('/');
};

const navegarACatalogo = () => {
  router.push('/listado');
};
</script>

<template>
  <div class="app-container">

    <header class="navbar">
      <h1 class="logo"> Rendimiento Conceptual</h1>
      <nav class="nav-links">
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
      </nav>
    </header>

    
    <main class="content">
     
      <RouterView />
    </main>
  </div>
</template>

<style>

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 1.4rem;
  margin: 0;
  color: #0f172a;
}

.nav-links button {
  background: none;
  border: none;
  font-size: 1rem;
  padding: 8px 16px;
  margin-left: 10px;
  cursor: pointer;
  color: #64748b;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-links button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-links button.active {
  background-color: #e2e8f0;
  color: #b84941;
  font-weight: bold;
}

.content {
  padding: 20px;
}
</style>