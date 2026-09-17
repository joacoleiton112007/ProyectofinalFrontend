<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/services/api.js';

const productos = ref([]);
const categorias = ref([]);
const cargando = ref(false);

// Control para alternar entre imagen local o archivo subido
const origenImagen = ref('lista'); // 'lista' o 'archivo'
const archivoSeleccionado = ref(null);

// Imágenes predefinidas disponibles en el catálogo
const imagenesDisponibles = [
  'Camisa.png',
  'Musculosa.png',
  'MangaLarga.png',
  'Short.png',
  'Pántalon.png',
  'Vestido.png',
  'Zapatilla.png',
  'Zapatos.png',
  'Saco.png',
  'Medias.png',
  'Falda.png',
  'Prendas_1.png',
  'Prendas_2.png'
];

const nuevoProducto = ref({
  nombre: '',
  precio: 0,
  categoria_id: null,
  descripcion: '',
  imagen: 'Camisa.png'
});

// Cargar productos y categorías desde la API
const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [resProds, resCats] = await Promise.all([
      apiFetch('/productos', { requerirAuth: false }),
      apiFetch('/categorias', { requerirAuth: false })
    ]);
    productos.value = resProds;
    categorias.value = resCats;

    if (categorias.value.length > 0) {
      nuevoProducto.value.categoria_id = categorias.value[0].id;
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    cargando.value = false;
  }
};

const manejarArchivo = (e) => {
  archivoSeleccionado.value = e.target.files[0] || null;
};

// 1. AGREGAR PRODUCTO A LA BD (Soporta lista o archivo subido)
const agregarProducto = async () => {
  if (!nuevoProducto.value.nombre || nuevoProducto.value.precio <= 0 || !nuevoProducto.value.categoria_id) return;

  try {
    const formData = new FormData();
    formData.append('nombre', nuevoProducto.value.nombre);
    formData.append('precio', nuevoProducto.value.precio);
    formData.append('categoria_id', nuevoProducto.value.categoria_id);
    formData.append('descripcion', nuevoProducto.value.descripcion || `Pack de ${nuevoProducto.value.nombre}`);

    if (origenImagen.value === 'archivo' && archivoSeleccionado.value) {
      formData.append('imagen_file', archivoSeleccionado.value);
    } else {
      formData.append('imagen', nuevoProducto.value.imagen);
    }

    // Petición POST con FormData
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const resRaw = await fetch('http://127.0.0.1:8000/api/productos', {
      method: 'POST',
      headers,
      body: formData
    });

    const res = await resRaw.json();

    if (res.producto) {
      productos.value.push(res.producto);
      nuevoProducto.value = {
        nombre: '',
        precio: 0,
        categoria_id: categorias.value[0]?.id || null,
        descripcion: '',
        imagen: 'Camisa.png'
      };
      archivoSeleccionado.value = null;
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
  }
};

// 2. DUPLICAR PRODUCTO EN LA BD
const duplicarProducto = async (prod) => {
  try {
    const clon = {
      nombre: `${prod.nombre} (Copia)`,
      precio: prod.precio,
      categoria_id: prod.categoria_id,
      descripcion: prod.descripcion,
      imagen: prod.imagen
    };

    const res = await apiFetch('/productos', {
      method: 'POST',
      body: JSON.stringify(clon)
    });

    if (res.producto) {
      productos.value.push(res.producto);
    }
  } catch (error) {
    console.error('Error al duplicar producto:', error);
  }
};

// 3. BORRAR PRODUCTO DE LA BD
const eliminarProducto = async (id) => {
  if (!confirm('¿Seguro que querés eliminar este producto?')) return;

  try {
    await apiFetch(`/productos/${id}`, {
      method: 'DELETE'
    });
    productos.value = productos.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
};

onMounted(() => {
  cargarDatos();
});
</script>

<template>
  <div class="panel-container">
    <h2>Panel de Control Mayorista</h2>

    <!-- Formulario Agregar -->
    <section class="form-seccion">
      <h3>Agregar Nuevo Producto al Catálogo</h3>
      <form @submit.prevent="agregarProducto" class="form-stack">
        <div class="form-grid">
          <input 
            v-model="nuevoProducto.nombre" 
            type="text" 
            placeholder="Nombre de la prenda/pack" 
            required 
          />
          
          <input 
            v-model.number="nuevoProducto.precio" 
            type="number" 
            placeholder="Precio UYU ($)" 
            required 
          />
          
          <select v-model="nuevoProducto.categoria_id" required>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>

          <!-- Toggle de tipo de imagen -->
          <div class="control-imagen">
            <div class="radio-group">
              <label>
                <input type="radio" v-model="origenImagen" value="lista" /> Lista
              </label>
              <label>
                <input type="radio" v-model="origenImagen" value="archivo" /> Archivo
              </label>
            </div>

            <select v-if="origenImagen === 'lista'" v-model="nuevoProducto.imagen" required>
              <option v-for="img in imagenesDisponibles" :key="img" :value="img">
                {{ img }}
              </option>
            </select>

            <input v-else type="file" @change="manejarArchivo" accept="image/*" required class="input-file" />
          </div>

          <button type="submit" class="btn-agregar">➕ Agregar</button>
        </div>
      </form>
    </section>

    <!-- Tabla de Productos -->
    <section class="tabla-seccion">
      <h3>Inventario del Catálogo Cliente</h3>
      
      <div v-if="cargando" class="texto-vacio">Cargando inventario...</div>

      <table v-else class="tabla-productos">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th class="texto-centro">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productos" :key="prod.id">
            <td>
              <span class="badge-imagen">{{ prod.imagen || 'Sin Imagen' }}</span>
            </td>
            <td>{{ prod.nombre }}</td>
            <td>{{ prod.categoria?.nombre || '-' }}</td>
            <td>$U {{ Number(prod.precio).toLocaleString() }}</td>
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
            <td colspan="5" class="texto-vacio">No hay productos en el inventario.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.panel-container {
  max-width: 950px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.form-grid input[type="text"],
.form-grid input[type="number"],
.form-grid select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.9rem;
  flex: 1 1 150px;
}

.control-imagen {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 2 1 250px;
}

.radio-group {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: #475569;
}

.input-file {
  font-size: 0.85rem;
}

.btn-agregar {
  background-color: #3a7d8c;
  color: white;
  border: none;
  padding: 9px 16px;
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

.badge-imagen {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
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