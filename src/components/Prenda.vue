<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibrosStore } from '@/stores/librosstore';

const route = useRoute();
const router = useRouter();
const store = useLibrosStore();

const libro = computed(() => store.obtenerPorIsbn(route.params.isbn));

const imagenes = import.meta.glob('../assets/images/*', { eager: true, import: 'default' });

const obtenerImagen = (nombreArchivo) => {
  if (!nombreArchivo) return 'https://via.placeholder.com/300';
  const claveEncontrada = Object.keys(imagenes).find(key => key.endsWith(nombreArchivo));
  return claveEncontrada ? imagenes[claveEncontrada] : 'https://via.placeholder.com/300';
};

const volverAlCatalogo = () => {
  router.push('/listado');
};
</script>

<template>
  <div class="detalle-container">
    <button @click="volverAlCatalogo" class="btn-volver">
      ← Volver al Catálogo
    </button>

    <div v-if="libro" class="tarjeta-completa">
      <div class="imagen-detalle-container">
        <img :src="obtenerImagen(libro.imagen)" :alt="libro.titulo" class="imagen-detalle" />
      </div>

      <router-link :to="'/genero/' + libro.genero" class="categoria-tag-link">
        {{ libro.genero }}
      </router-link>
      
      <h2>{{ libro.titulo }}</h2>
      <p class="autor">Marca / Origen: <strong>{{ libro.autor }}</strong></p>
      <p class="editorial">Categoría: <strong>{{ libro.editorial }}</strong></p>
      
      <div class="pie-tarjeta">
        <span class="anio">Año: {{ libro.anio_publicacion }}</span>
        <span class="precio">$U {{ libro.precio_uyu }}</span>
      </div>
    </div>
    
    <div v-else class="sin-resultados">
      <p>No se encontró la prenda seleccionada.</p>
    </div>
  </div>
</template>

<style scoped>
.detalle-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
}

.btn-volver {
  background: none;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.btn-volver:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.tarjeta-completa {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.imagen-detalle-container {
  width: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.imagen-detalle {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.categoria-tag-link {
  align-self: flex-start;
  display: inline-block;
  background-color: #e2e8f0;
  color: #475569;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 15px;
  text-decoration: none;
}

.categoria-tag-link:hover {
  background-color: #b84b41;
  color: white;
}

h2 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.autor, .editorial {
  margin: 8px 0;
  font-size: 1.05rem;
  color: #64748b;
}

.pie-tarjeta {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}

.anio {
  color: #94a3b8;
  font-size: 0.95rem;
}

.precio {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0f172a;
  background-color: #f1f5f9;
  padding: 5px 15px;
  border-radius: 6px;
}

.sin-resultados {
  text-align: center;
  color: #64748b;
}
</style>