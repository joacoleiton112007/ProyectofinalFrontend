<script setup>
import { ref, computed } from 'vue';
import { useLibrosStore } from '@/stores/librosstore';

import TarjetaLibro from './TarjetaLibro.vue';

const store = useLibrosStore();


const catalogoVisible = ref(false);


const textoBuscado = ref('');
const generoSeleccionado = ref('Todos');

const mostrarCatalogo = () => {
  catalogoVisible.value = true;
};

const generosDisponibles = computed(() => {
  return store.generosDisponibles();
});


const librosFiltrados = computed(() => {
  if (!catalogoVisible.value || !store.lista) return [];
  
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
    
    <div v-if="!catalogoVisible" class="bton-disparador-container">
      <button @click="mostrarCatalogo" class="btn-principal">
        Ver Catálogo
      </button>
    </div>

    <div v-else>
      <h2>Nuestro Catálogo</h2>

      <div class="busqueda-seccion">
        <input 
          v-model="textoBuscado" 
          type="text" 
          placeholder="Buscar por título o autor..." 
          class="input-busqueda"
        />

        <div class="botones-genero">
          <button 
            v-for="genero in generosDisponibles" 
            :key="genero"
            :class="{ activo: generoSeleccionado === genero }"
            @click="generoSeleccionado = genero"
          >
            {{ genero }}
          </button>
        </div>
      </div>

      <p v-if="librosFiltrados.length === 0" class="sin-resultados">
        No se encontraron libros que coincidan con tu búsqueda.
      </p>

      <div class="grilla-libros">
        <TarjetaLibro 
          v-for="libro in librosFiltrados" 
          :key="libro.isbn" 
          :libro="libro"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>

.catalogo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.bton-disparador-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.btn-principal {
  background-color: #41b883;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, background-color 0.2s;
}

.btn-principal:hover {
  background-color: #35495e;
  transform: translateY(-2px);
}

h2 {
  color: #2c3e50;
  border-bottom: 2px solid #41b883;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.busqueda-seccion {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-busqueda {
  padding: 12px;
  font-size: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}

.input-busqueda:focus {
  border-color: #41b883;
}

.botones-genero {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.botones-genero button {
  background-color: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
}

.botones-genero button:hover {
  background-color: #cbd5e1;
}

.botones-genero button.activo {
  background-color: #41b883;
  color: white;
}

.sin-resultados {
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
  margin-top: 40px;
}

.grilla-libros {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}
</style>;