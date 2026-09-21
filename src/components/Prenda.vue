<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiFetch } from '@/services/api.js';
import { useCarritoStore } from '@/stores/carritoStore';

const route = useRoute();
const router = useRouter();
const carritoStore = useCarritoStore();

const libro = ref(null);
const cargando = ref(true);

// Mínimo 10 prendas
const cantidad = ref(10);

// Carga de imágenes locales desde Vite
const imagenesAssets = import.meta.glob('@/assets/images/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' });

const obtenerImagen = (nombreArchivo) => {
  if (!nombreArchivo || typeof nombreArchivo !== 'string') {
    return 'https://placehold.co/300x300?text=Sin+Imagen';
  }

  const archivoClean = nombreArchivo.trim();

  // 1. URL absoluta
  if (archivoClean.startsWith('http://') || archivoClean.startsWith('https://')) {
    return archivoClean;
  }

  // 2. Coincidencia local en src/assets/images
  const nombreSolo = archivoClean.replace(/^productos\//, '');
  const claveEncontrada = Object.keys(imagenesAssets).find(key => {
    const nombreEnRuta = key.split('/').pop();
    return nombreEnRuta.toLowerCase() === nombreSolo.toLowerCase();
  });

  if (claveEncontrada) {
    return imagenesAssets[claveEncontrada];
  }

  // 3. Servidor Laravel
  if (archivoClean.startsWith('/storage/') || archivoClean.startsWith('storage/')) {
    return `http://127.0.0.1:8000/${archivoClean.replace(/^\//, '')}`;
  }

  return `http://127.0.0.1:8000/storage/productos/${nombreSolo}`;
};

onMounted(async () => {
  try {
    // Si la ruta en router es /libro/:id o /producto/:id
    const id = route.params.id;
    libro.value = await apiFetch(`/productos/${id}`);
  } catch (error) {
    console.error('Error al cargar la prenda:', error);
  } finally {
    cargando.value = false;
  }
});

// Limitar cantidad entre 10 y 25 unidades
watch(cantidad, (nuevoValor) => {
  if (nuevoValor > 25) {
    cantidad.value = 25;
  } else if (nuevoValor < 10 || !nuevoValor) {
    cantidad.value = 10;
  }
});

// Lógica de descuentos requerida: 20% base (10 u), 30% (20 u) y 35% (25 u)
const porcentajeDescuento = computed(() => {
  if (cantidad.value >= 25) return 35;
  if (cantidad.value >= 20) return 30;
  if (cantidad.value >= 10) return 20;
  return 0;
});

// Precio base unitario (dividido 10)
const precioPorPrendaBase = computed(() => {
  if (!libro.value) return 0;
  const precioPack = Number(libro.value.precio || libro.value.precio_uyu) || 0;
  return precioPack / 10;
});

const precioUnitario = computed(() => {
  if (porcentajeDescuento.value > 0) {
    const factorDescuento = (100 - porcentajeDescuento.value) / 100;
    return Math.round(precioPorPrendaBase.value * factorDescuento);
  }
  return precioPorPrendaBase.value;
});

const totalCalculado = computed(() => precioUnitario.value * cantidad.value);
const totalSinDescuento = computed(() => precioPorPrendaBase.value * cantidad.value);

const volverAlCatalogo = () => {
  router.push('/listado');
};

const agregarAlCarrito = () => {
  if (!libro.value) return;

  const prendaAñadir = {
    ...libro.value,
    precio: precioUnitario.value,
    cantidad: cantidad.value,
    descuentoAplicado: porcentajeDescuento.value
  };

  const resultado = carritoStore.agregarAlCarrito(prendaAñadir);

  if (!resultado?.exito) {
    alert(resultado?.mensaje || 'Error al agregar al carrito');
  } else {
    alert(`Prenda(s) agregada(s) al carrito con éxito (${porcentajeDescuento.value}% OFF)`);
  }
};

const comprarAhora = () => {
  agregarAlCarrito();
  if (carritoStore.estaAutenticado()) {
    router.push('/carrito');
  }
};
</script>

<template>
  <div class="detalle-container">
    <button @click="volverAlCatalogo" class="btn-volver">
      ← Volver al Catálogo
    </button>

    <div v-if="libro" class="tarjeta-completa">
      <div class="imagen-detalle-container">
        <img 
          :src="obtenerImagen(libro.imagen)" 
          :alt="libro.nombre" 
          class="imagen-detalle" 
        />
      </div>

      <span v-if="libro.categoria" class="categoria-tag-link">
        {{ libro.categoria.nombre }}
      </span>
      
      <h2>{{ libro.nombre }}</h2>
      <p v-if="libro.descripcion" class="editorial">
        {{ libro.descripcion }}
      </p>
      
      <div class="pie-tarjeta">
        <div class="precio-container">
          <span v-if="porcentajeDescuento > 0" class="precio-anterior">
            $U {{ totalSinDescuento.toLocaleString('es-UY') }}
          </span>
          <span class="precio">$U {{ totalCalculado.toLocaleString('es-UY') }}</span>
        </div>
      </div>

      <div class="bloque-acciones">
        <div class="selector-cantidad">
          <label>Cantidad (Mín. 10 - Máx. 25 Uds):</label>
          <div class="controles">
            <button type="button" @click="cantidad > 10 ? cantidad-- : null" :disabled="cantidad <= 10">-</button>
            <input type="number" v-model.number="cantidad" min="10" max="25" />
            <button type="button" @click="cantidad < 25 ? cantidad++ : null" :disabled="cantidad >= 25">+</button>
          </div>
          <button type="button" @click="cantidad = 10" class="btn-pack">
            Pack 10 (30% OFF)
          </button>
          <button type="button" @click="cantidad = 20" class="btn-pack">
            Pack 20 (40% OFF)
          </button>
        </div>

        <p v-if="porcentajeDescuento > 0" class="aviso-mayorista">
          🔥 ¡{{ porcentajeDescuento }}% OFF aplicado! ($U {{ precioUnitario.toLocaleString('es-UY') }} c/u)
        </p>
        <p v-else class="aviso-tip">
          💡 Llevá 10 unidades para un 30% OFF o 20 unidades para un 40% OFF.
        </p>

        <div class="botones-compra">
          <button @click="agregarAlCarrito" class="btn-agregar">
            🛒 Agregar al Carrito
          </button>
          <button @click="comprarAhora" class="btn-comprar">
            ⚡ Comprar Ahora
          </button>
        </div>
      </div>
    </div>
    
    <div v-else-if="!cargando" class="sin-resultados">
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

.editorial {
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

.precio-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.precio-anterior {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 1rem;
}

.precio {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0f172a;
  background-color: #f1f5f9;
  padding: 5px 15px;
  border-radius: 6px;
}

.bloque-acciones {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.selector-cantidad {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.selector-cantidad label {
  font-weight: 600;
  color: #475569;
  width: 100%;
}

.controles {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.controles button {
  background: #f8fafc;
  border: none;
  padding: 6px 12px;
  font-weight: bold;
  cursor: pointer;
}

.controles button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.controles input {
  width: 50px;
  text-align: center;
  border: none;
  font-weight: bold;
}

.btn-pack {
  background-color: #e2e8f0;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
}

.aviso-mayorista {
  color: #16a34a;
  font-size: 0.85rem;
  font-weight: bold;
  margin: 0;
}

.aviso-tip {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.botones-compra {
  display: flex;
  gap: 12px;
}

.btn-agregar, .btn-comprar {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-agregar {
  background-color: #334155;
  color: white;
}

.btn-agregar:hover {
  background-color: #1e293b;
}

.btn-comprar {
  background-color: #b84141;
  color: white;
}

.btn-comprar:hover {
  background-color: #963232;
}

.sin-resultados {
  text-align: center;
  color: #64748b;
} 
</style>