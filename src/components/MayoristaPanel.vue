<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/services/api.js'

const productos = ref([])
const categorias = ref([])
const cargando = ref(false)

const origenImagen = ref('lista')
const archivoSeleccionado = ref(null)

const imagenesDisponibles = [
  'Camisa.png', 'Musculosa.png', 'MangaLarga.png', 'Short.png',
  'Pántalon.png', 'Vestido.png', 'Zapatilla.png', 'Zapatos.png',
  'Saco.png', 'Medias.png', 'Falda.png', 'Prendas_1.png', 'Prendas_2.png'
]

const nuevoProducto = ref({
  nombre: '',
  precio: 0,
  categoria_id: null,
  descripcion: '',
  imagen: 'Camisa.png'
})

const cargarDatos = async () => {
  cargando.value = true
  try {
    const [resProds, resCats] = await Promise.all([
      apiFetch('/productos', { requerirAuth: false }),
      apiFetch('/categorias', { requerirAuth: false })
    ])
    productos.value = resProds || []
    categorias.value = resCats || []

    if (categorias.value.length > 0) {
      nuevoProducto.value.categoria_id = categorias.value[0].id
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    cargando.value = false
  }
}

const manejarArchivo = (e) => {
  archivoSeleccionado.value = e.target.files[0] || null
}

const agregarProducto = async () => {
  if (!nuevoProducto.value.nombre || nuevoProducto.value.precio <= 0 || !nuevoProducto.value.categoria_id) return

  try {
    let res

    if (origenImagen.value === 'archivo' && archivoSeleccionado.value) {
      const formData = new FormData()
      formData.append('nombre', nuevoProducto.value.nombre)
      formData.append('precio', nuevoProducto.value.precio)
      formData.append('categoria_id', nuevoProducto.value.categoria_id)
      formData.append('descripcion', nuevoProducto.value.descripcion || `Pack de ${nuevoProducto.value.nombre}`)
      formData.append('imagen_file', archivoSeleccionado.value)

      const token = localStorage.getItem('token')
      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const resRaw = await fetch('http://127.0.0.1:8000/api/productos', {
        method: 'POST',
        headers,
        body: formData
      })

      res = await resRaw.json()
    } else {
      const payload = {
        nombre: nuevoProducto.value.nombre,
        precio: nuevoProducto.value.precio,
        categoria_id: nuevoProducto.value.categoria_id,
        descripcion: nuevoProducto.value.descripcion || `Pack de ${nuevoProducto.value.nombre}`,
        imagen: nuevoProducto.value.imagen || 'Camisa.png'
      }

      res = await apiFetch('/productos', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }

    if (res && res.producto) {
      productos.value.push(res.producto)
      nuevoProducto.value = {
        nombre: '',
        precio: 0,
        categoria_id: categorias.value[0]?.id || null,
        descripcion: '',
        imagen: 'Camisa.png'
      }
      archivoSeleccionado.value = null
    }
  } catch (error) {
    console.error('Error al agregar producto:', error)
  }
}

const duplicarProducto = async (prod) => {
  try {
    const clon = {
      nombre: `${prod.nombre} (Copia)`,
      precio: prod.precio,
      categoria_id: prod.categoria_id,
      descripcion: prod.descripcion,
      imagen: prod.imagen
    }

    const res = await apiFetch('/productos', {
      method: 'POST',
      body: JSON.stringify(clon)
    })

    if (res && res.producto) {
      productos.value.push(res.producto)
    }
  } catch (error) {
    console.error('Error al duplicar producto:', error)
  }
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Seguro que querés eliminar este producto?')) return

  try {
    await apiFetch(`/productos/${id}`, { method: 'DELETE' })
    productos.value = productos.value.filter(p => p.id !== id)
  } catch (error) {
    console.error('Error al eliminar producto:', error)
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="panel-container">
    <div class="encabezado-panel">
      <h2>Gestión de Inventario</h2>
      <p>Administrá el catálogo de productos y precios asignados al canal mayorista.</p>
    </div>

    <!-- FORMULARIO DE AGREGAR PRODUCTO -->
    <section class="tarjeta-panel">
      <h3>Agregar Nuevo Producto al Catálogo</h3>
      <form @submit.prevent="agregarProducto">
        <div class="form-grid">
          <div class="grupo-campo">
            <label>Nombre del Producto / Pack</label>
            <input 
              v-model="nuevoProducto.nombre" 
              type="text" 
              placeholder="Ej: Camisa Lino Lote x10" 
              required 
            />
          </div>

          <div class="grupo-campo">
            <label>Precio Mayorista ($U)</label>
            <input 
              v-model.number="nuevoProducto.precio" 
              type="number" 
              placeholder="0" 
              required 
            />
          </div>

          <div class="grupo-campo">
            <label>Categoría</label>
            <select v-model="nuevoProducto.categoria_id" required>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>

          <div class="grupo-campo control-imagen">
            <label>Imagen</label>
            <div class="radio-selector">
              <label><input type="radio" v-model="origenImagen" value="lista" /> Catálogo</label>
              <label><input type="radio" v-model="origenImagen" value="archivo" /> Subir archivo</label>
            </div>

            <select v-if="origenImagen === 'lista'" v-model="nuevoProducto.imagen" required>
              <option v-for="img in imagenesDisponibles" :key="img" :value="img">
                {{ img }}
              </option>
            </select>

            <input v-else type="file" @change="manejarArchivo" accept="image/*" required class="input-file" />
          </div>
        </div>

        <button type="submit" class="btn-guardar">➕ Agregar Producto</button>
      </form>
    </section>

    <!-- TABLA DE INVENTARIO -->
    <section class="tarjeta-panel">
      <h3>Inventario Activo</h3>

      <div v-if="cargando" class="texto-cargando">Cargando catálogo mayorista...</div>

      <table v-else class="tabla-custom">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio Unitario</th>
            <th class="texto-centro">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productos" :key="prod.id">
            <td>
              <span class="badge-imagen">{{ prod.imagen || 'Sin Imagen' }}</span>
            </td>
            <td><strong>{{ prod.nombre }}</strong></td>
            <td>{{ prod.categoria?.nombre || '-' }}</td>
            <td class="precio-destacado">$U {{ Number(prod.precio).toLocaleString() }}</td>
            <td class="acciones texto-centro">
              <button @click="duplicarProducto(prod)" class="btn-accion btn-clonar">📋 Duplicar</button>
              <button @click="eliminarProducto(prod.id)" class="btn-accion btn-eliminar">🗑️ Borrar</button>
            </td>
          </tr>
          <tr v-if="productos.length === 0">
            <td colspan="5" class="texto-cargando">No hay productos registrados en el sistema.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.panel-container {
  max-width: 1050px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.encabezado-panel {
  margin-bottom: 25px;
}

.encabezado-panel h2 {
  font-family: 'Lora', Georgia, serif;
  font-size: 2.2rem;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.encabezado-panel p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.tarjeta-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  margin-bottom: 30px;
}

.tarjeta-panel h3 {
  font-family: 'Lora', Georgia, serif;
  font-size: 1.3rem;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.grupo-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.grupo-campo label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.grupo-campo input,
.grupo-campo select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.grupo-campo input:focus,
.grupo-campo select:focus {
  border-color: #b85141;
}

.radio-selector {
  display: flex;
  gap: 12px;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 4px;
}

.btn-guardar {
  background-color: #b85141;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-guardar:hover {
  background-color: #7e1b1b;
}

.tabla-custom {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.92rem;
}

.tabla-custom th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.tabla-custom td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.badge-imagen {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.8rem;
}

.precio-destacado {
  font-weight: bold;
  color: #0f172a;
}

.texto-centro {
  text-align: center;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-accion {
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clonar {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
}

.btn-clonar:hover {
  background-color: #e2e8f0;
}

.btn-eliminar {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.btn-eliminar:hover {
  background-color: #fecaca;
}

.texto-cargando {
  text-align: center;
  color: #64748b;
  padding: 30px;
}
</style>