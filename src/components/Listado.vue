<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiFetch } from '@/services/api.js';
import { useLibrosStore } from '@/stores/librosstore'; // <--- Importante
import TarjetaPrenda from './TarjetaPrenda.vue';

const librosStore = useLibrosStore(); // <--- Usamos el store global
const productos = ref([]);
const generoSeleccionado = ref('Todos');

// Cargar productos desde la API de Laravel al montar el componente
onMounted(async () => {
  try {
    const res = await apiFetch('/productos', { requerirAuth: false });
    console.log('--- RESPUESTA API ---', res);
    productos.value = res;
  } catch (error) {
    console.error('Error al cargar productos:', error.message);
  }
});

// Extraer categorías dinámicamente desde la respuesta de Laravel
const generosDisponibles = computed(() => {
  const categorias = productos.value
    .map(p => p.categoria?.nombre || p.genero)
    .filter(Boolean);
  return ['Todos', ...new Set(categorias)];
});

// Filtrar por categoría y buscador (leyendo desde librosStore.textoBuscado)
const librosFiltrados = computed(() => {
  if (!productos.value.length) return [];
  
  const termino = (librosStore.textoBuscado || '').toLowerCase().trim();

  return productos.value.filter(producto => {
    const catNombre = producto.categoria?.nombre || producto.genero;
    const coincideGenero = generoSeleccionado.value === 'Todos' || catNombre === generoSeleccionado.value;
    const nombre = (producto.nombre || producto.titulo || '').toLowerCase();
    const descripcion = (producto.descripcion || '').toLowerCase();
    const coincideTexto = !termino || nombre.includes(termino) || descripcion.includes(termino);

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
    </div>

    <!-- Mensaje sin resultados -->
    <div v-if="librosFiltrados.length === 0" class="sin-resultados">
      <p>No se encontraron prendas que coincidan con la búsqueda.</p>
    </div>

    <!-- Grilla de Productos usando el id único de Laravel -->
    <div class="grilla-productos">
      <TarjetaPrenda 
        v-for="libro in librosFiltrados" 
        :key="libro.id || libro.isbn" 
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

.sin-resultados {
  text-align: center;
  color: #888888;
  font-size: 0.95rem;
  padding: 50px 0;
}

.grilla-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px 20px;
}
</style>