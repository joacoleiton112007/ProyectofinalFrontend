<script setup>
import { ref, computed } from 'vue';
import { useLibrosStore } from '@/stores/librosstore';

import TarjetaPrenda from './TarjetaPrenda.vue';

const store = useLibrosStore();

const textoBuscado = ref('');
const generoSeleccionado = ref('Todos');

const generosDisponibles = computed(() => {
  return store.generosDisponibles();
});

const librosFiltrados = computed(() => {
  if (!store.lista) return [];
  
  return store.lista.filter(libro => {
    const coincideGenero = generoSeleccionado.value === 'Todos' || libro.genero === generoSeleccionado.value;
    const coincideTexto = libro.titulo.toLowerCase().includes(textoBuscado.value.toLowerCase()) ||
                          libro.autor.toLowerCase().includes(textoBuscado.value.toLowerCase());
    return coincideGenero && coincideTexto;
  });
});
</script>

<template>
  <div class="catalogo-container">
    <!-- Filtros de categoría estilo tabs -->
    <div class="filtros-seccion">
      <div class="categoria-tabs">
        <button 
          v-for="genero in generosDisponibles" 
          :key="genero"
          :class="{ activo: generoSeleccionado === genero }"
          @click="generoSeleccionado = genero"
        >
          {{ genero }}
        </button>
      </div>
// algo
      
    </div>

    <!-- Mensaje sin resultados -->
    <div v-if="librosFiltrados.length === 0" class="sin-resultados">
      <p>No se encontraron prendas que coincidan con la búsqueda.</p>
    </div>

    <!-- Grilla de Productos -->
    <div class="grilla-productos">
      <TarjetaPrenda 
        v-for="libro in librosFiltrados" 
        :key="libro.isbn" 
        :libro="libro"
      />
    </div>
  </div>
</template>

<style scoped>
.catalogo-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 10px 20px 40px;
}

/* Filtros y Búsqueda */
.filtros-seccion {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 15px;
}

@media (min-width: 768px) {
  .filtros-seccion {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.categoria-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.categoria-tabs button {
  background-color: transparent;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555555;
  transition: all 0.4s ease;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.categoria-tabs button:hover {
  border-color: #b53838;
  color: #b53838;
}

.categoria-tabs button.activo {
  background-color: #b53838;
  border-color: #b53838;
  color: #ffffff;
  font-weight: 600;
}

.busqueda-interna {
  max-width: 300px;
  width: 100%;
}

.input-busqueda {
  padding: 8px 12px;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
  background-color: #fcfcfc;
}

.input-busqueda:focus {
  outline: none;
  border-color: #b53838;
  background-color: #ffffff;
}

.sin-resultados {
  text-align: center;
  color: #888888;
  font-size: 0.95rem;
  padding: 50px 0;
}

/* Grilla de productos estilo e-commerce */
.grilla-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px 20px;
}
</style>