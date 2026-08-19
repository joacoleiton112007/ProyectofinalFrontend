<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibrosStore } from '@/stores/librosstore';
import TarjetaLibro from './TarjetaLibro.vue'; 

const route = useRoute();
const router = useRouter();
const store = useLibrosStore();

const librosFiltrados = computed(() => {
  return store.filtrarPorGenero(route.params.nombreGenero);
});

const volverAlCatalogo = () => {
  router.push('/listado');
};
</script>

<template>
  <div class="catalogo-container">
    <h2>Libros del género: <span class="genero-titulo">{{ route.params.nombreGenero }}</span></h2>
    
    <button @click="volverAlCatalogo" class="btn-volver">
      ← Volver al Catálogo Completo
    </button>

    <p v-if="librosFiltrados.length === 0" class="sin-resultados">
      No se encontro la prenda.
    </p>

    <div class="grilla-libros" style="margin-top: 30px;">
      <TarjetaLibro 
        v-for="libro in librosFiltrados" 
        :key="libro.isbn" 
        :libro="libro" 
      />
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

h2 {
  color: #2c3e50;
  border-bottom: 2px solid #b84141;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.genero-titulo {
  color: #b84141;
}

.btn-volver {
  background: none;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-volver:hover {
  background-color: #f1f5f9;
  color: #0f172a;
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
</style>