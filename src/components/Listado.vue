<script setup>

import { ref, computed, onMounted } from 'vue';

import { apiFetch } from '@/services/api.js';

import { useLibrosStore } from '@/stores/librosstore';

import TarjetaPrenda from './TarjetaPrenda.vue';


const librosStore = useLibrosStore();

const productos = ref([]);

const generoSeleccionado = ref('Todos');


// ==========================================
// CARGAR PRODUCTOS DESDE LARAVEL
// ==========================================

onMounted(async () => {

  try {

    const res = await apiFetch('/productos', {
      requerirAuth: false
    });

    console.log('--- RESPUESTA API ---', res);

    productos.value = res;

  } catch (error) {

    console.error(
      'Error al cargar productos:',
      error.message
    );

  }

});


// ==========================================
// CATEGORÍAS DISPONIBLES
// ==========================================

const generosDisponibles = computed(() => {

  const categorias = productos.value

    .map(
      p => p.categoria?.nombre || p.genero
    )

    .filter(Boolean);


  return [

    'Todos',

    ...new Set(categorias)

  ].map(categoria =>

    categoria.toLowerCase() === 'buzos'

      ? 'Abrigos'

      : categoria

  );

});


// ==========================================
// FILTRAR PRODUCTOS
// ==========================================

const librosFiltrados = computed(() => {

  if (!productos.value.length) {

    return [];

  }


  const termino = (
    librosStore.textoBuscado || ''
  )
    .toLowerCase()
    .trim();


  return productos.value.filter(producto => {

    const catNombre =
      producto.categoria?.nombre ||
      producto.genero;


    // ======================================
    // CAMBIO VISUAL:
    // Buzos -> Abrigos
    // ======================================

    const categoriaVisual =
      catNombre?.toLowerCase() === 'buzos'

        ? 'Abrigos'

        : catNombre;


    const coincideGenero =
      generoSeleccionado.value === 'Todos' ||

      categoriaVisual ===
      generoSeleccionado.value;


    const nombre = (
      producto.nombre ||
      producto.titulo ||
      ''
    )
      .toLowerCase();


    const descripcion = (
      producto.descripcion ||
      ''
    )
      .toLowerCase();


    const coincideTexto =
      !termino ||

      nombre.includes(termino) ||

      descripcion.includes(termino);


    return (
      coincideGenero &&
      coincideTexto
    );

  });

});

</script>


<template>

  <div class="catalogo-container">

    <!-- =====================================
         FILTROS DE CATEGORÍA
    ====================================== -->

    <div class="filtros-seccion">

      <div class="categoria-tabs">

        <button

          v-for="genero in generosDisponibles"

          :key="genero"

          :class="{
            activo:
              generoSeleccionado === genero
          }"

          @click="
            generoSeleccionado = genero
          "

        >

          {{ genero }}

        </button>

      </div>

    </div>


    <!-- =====================================
         SIN RESULTADOS
    ====================================== -->

    <div

      v-if="librosFiltrados.length === 0"

      class="sin-resultados"

    >

      <p>

        No se encontraron prendas que
        coincidan con la búsqueda.

      </p>

    </div>


    <!-- =====================================
         GRILLA DE PRODUCTOS
    ====================================== -->

    <div class="grilla-productos">

      <TarjetaPrenda

        v-for="libro in librosFiltrados"

        :key="
          libro.id ||
          libro.isbn
        "

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

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(200px, 1fr)
    );

  gap: 25px 20px;

}

</style>