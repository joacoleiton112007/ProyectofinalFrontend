<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCarritoStore } from '@/stores/carritoStore';

const props = defineProps({
  libro: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const router = useRouter();
const carritoStore = useCarritoStore();

// Cargar mapa de assets de Vite
const imagenesAssets = import.meta.glob('@/assets/images/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' });

const obtenerImagen = (nombreArchivo) => {
  // 0. Si viene null, undefined o vacío, devolvemos una imagen por defecto
  if (!nombreArchivo || typeof nombreArchivo !== 'string') {
    return 'https://placehold.co/300x300?text=Sin+Imagen';
  }

  const archivoClean = nombreArchivo.trim();

  // 1. Si viene con URL completa
  if (archivoClean.startsWith('http://') || archivoClean.startsWith('https://')) {
    return archivoClean;
  }

  // 2. Buscar primero en assets locales de Vue (src/assets/images)
  const nombreSolo = archivoClean.replace(/^productos\//, '');
  const claveEncontrada = Object.keys(imagenesAssets).find(key => {
    const nombreEnRuta = key.split('/').pop();
    return nombreEnRuta.toLowerCase() === nombreSolo.toLowerCase();
  });

  if (claveEncontrada) {
    return imagenesAssets[claveEncontrada];
  }

  // 3. Si es una ruta explícita que apunta a storage o images de Laravel
  if (archivoClean.startsWith('/storage/') || archivoClean.startsWith('/images/')) {
    return `http://127.0.0.1:8000${archivoClean}`;
  }

  // 4. Si es subida desde la PC a Laravel (Storage)
  if (archivoClean.includes('_') || archivoClean.includes('productos/')) {
    const pathLimpio = archivoClean.replace(/^productos\//, '');
    return `http://127.0.0.1:8000/storage/productos/${pathLimpio}`;
  }

  // 5. Caso por defecto: carpeta public/images de Laravel
  return `http://127.0.0.1:8000/images/${archivoClean}`;
};

const agregarAlCarrito = () => {
  if (!props.libro) return;

  const prendaConPrecio = {
    ...props.libro,
    precio: props.libro.precio || props.libro.precio_uyu || 0
  };

  const resultado = carritoStore.agregarAlCarrito(prendaConPrecio);

  if (!resultado?.exito) {
    alert(resultado?.mensaje || 'Error al agregar al carrito');
    router.push('/inicio');
  } else {
    alert('Prenda agregada al carrito con éxito');
  }
};

const tituloProducto = computed(() => props.libro?.nombre || props.libro?.titulo || '');
const generoProducto = computed(() => props.libro?.categoria?.nombre || props.libro?.genero || '');
const precioProducto = computed(() => props.libro?.precio ?? props.libro?.precio_uyu ?? 0);
const idProducto = computed(() => props.libro?.id || props.libro?.isbn);
</script>

<template>
  <div class="product-card" v-if="libro">
    <span v-if="libro?.descuento" class="product-badge-discount">
      -{{ libro.descuento }}%
    </span>

    <div class="product-image-container">
      <img :src="obtenerImagen(libro?.imagen)" :alt="tituloProducto" />
    </div>

    <div class="product-info">
      <span class="product-category">{{ generoProducto }}</span>
      <h3 class="product-title">{{ tituloProducto }}</h3>
      
      <div class="product-price-box">
        <span v-if="libro?.precioAnterior" class="product-price-old">
          $U {{ libro.precioAnterior }}
        </span>
        <span class="product-price-current">
          $U {{ Number(precioProducto).toLocaleString('es-UY') }}
        </span>
      </div>

      <div class="product-actions">
        <router-link :to="'/libro/' + idProducto" class="btn-detalles">
          Ver detalle →
        </router-link>

        <button type="button" @click="agregarAlCarrito" class="btn-agregar">
          Agregar al Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #ffffff;
  padding: 10px;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-badge-discount {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #b53838;
  color: #ffffff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
}

.product-image-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.product-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-category {
  font-size: 0.72rem;
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.product-title {
  font-size: 0.88rem;
  color: #333333;
  line-height: 1.3;
  margin: 0 0 8px 0;
  font-weight: 400;
}

.product-price-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.product-price-old {
  font-size: 0.8rem;
  color: #999999;
  text-decoration: line-through;
}

.product-price-current {
  font-size: 0.95rem;
  font-weight: 700;
  color: #b53838;
}

.product-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-detalles {
  color: #666666;
  text-decoration: none;
  font-size: 0.78rem;
}

.btn-detalles:hover {
  color: #b53838;
}

.btn-agregar {
  width: 100%;
  background-color: #b53838;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-agregar:hover {
  background-color: #962c2c;
}
</style>