<script setup>
import { ref, onMounted } from 'vue';

const productos = ref([]);
const nuevoProducto = ref({
  nombre: '',
  precio: 0,
  categoria: 'Mujer'
});

// Cargar productos desde localStorage
const cargarProductos = () => {
  const guardados = localStorage.getItem('productos_mayorista');
  if (guardados) {
    productos.value = JSON.parse(guardados);
  } else {
    productos.value = [
      { id: 1, nombre: 'Remera Oversize', precio: 1200, categoria: 'Hombre' },
      { id: 2, nombre: 'Buzo Hoodie', precio: 2500, categoria: 'Mujer' }
    ];
    guardarEnStorage();
  }
};

const guardarEnStorage = () => {
  localStorage.setItem('productos_mayorista', JSON.stringify(productos.value));
};

// 1. AGREGAR PRODUCTO
const agregarProducto = () => {
  if (!nuevoProducto.value.nombre || nuevoProducto.value.precio <= 0) return;

  const item = {
    id: Date.now(),
    ...nuevoProducto.value
  };

  productos.value.push(item);
  guardarEnStorage();

  nuevoProducto.value = { nombre: '', precio: 0, categoria: 'Mujer' };
};

// 2. DUPLICAR PRODUCTO
const duplicarProducto = (prod) => {
  const clon = {
    ...prod,
    id: Date.now(),
    nombre: `${prod.nombre} `
  };
  productos.value.push(clon);
  guardarEnStorage();
};

// 3. BORRAR PRODUCTO
const eliminarProducto = (id) => {
  productos.value = productos.value.filter(p => p.id !== id);
  guardarEnStorage();
};

onMounted(() => {
  cargarProductos();
});
</script>

<template>
  <div class="panel-container">
    <h2>Panel de Control Mayorista</h2>

    <!-- Formulario Agregar -->
    <section class="form-seccion">
      <h3>Agregar Nuevo Producto</h3>
      <form @submit.prevent="agregarProducto" class="form-grid">
        <input v-model="nuevoProducto.nombre" type="text" placeholder="Nombre de la prenda" required />
        <input v-model.number="nuevoProducto.precio" type="number" placeholder="Precio ($)" required />
        <select v-model="nuevoProducto.categoria">
          <option value="Mujer">Mujer</option>
          <option value="Hombre">Hombre</option>
          <option value="Complementos">Complementos</option>
        </select>
        <button type="submit" class="btn-agregar">➕ Agregar</button>
      </form>
    </section>

    <!-- Tabla con Duplicar y Borrar -->
    <section class="tabla-seccion">
      <h3>Inventario de Productos</h3>
      <table class="tabla-productos">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th class="texto-centro">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productos" :key="prod.id">
            <td>{{ prod.nombre }}</td>
            <td>{{ prod.categoria }}</td>
            <td>${{ prod.precio.toLocaleString() }}</td>
            <td class="acciones texto-centro">
              <button @click="duplicarProducto(prod)" class="btn-duplicar">
                📋 Duplicar
              </button>
              <button @click="eliminarProducto(prod.id)" class="btn-borrar">
                🗑️ Borrar
              </button>
            </td>
          </tr>
          <tr v-if="productos.length === 0">
            <td colspan="4" class="texto-vacio">No hay productos en el inventario.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.panel-container {
  max-width: 850px;
  margin: 30px auto;
  font-family: system-ui, -apple-system, sans-serif;
}

h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.form-seccion, .tabla-seccion {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 25px;
}

.form-seccion h3, .tabla-seccion h3 {
  font-size: 1.1rem;
  color: #334155;
  margin-bottom: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
}

.form-grid input, .form-grid select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-agregar {
  background-color: #3a7d8c;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.tabla-productos th, .tabla-productos td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.texto-centro {
  text-align: center;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-duplicar {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-duplicar:hover {
  background-color: #e2e8f0;
}

.btn-borrar {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-borrar:hover {
  background-color: #fecaca;
}

.texto-vacio {
  text-align: center;
  color: #64748b;
  padding: 20px;
}
</style>