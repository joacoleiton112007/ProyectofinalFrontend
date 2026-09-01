<script setup>
import { useRouter } from 'vue-router';
import { useCarritoStore } from '@/stores/carritoStore';

const props = defineProps({
  libro: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const carritoStore = useCarritoStore();

// Carga todas las imágenes de src/assets/images/
const imagenes = import.meta.glob('../assets/images/*', { eager: true, import: 'default' });

const obtenerImagen = (nombreArchivo) => {
  if (!nombreArchivo) return 'https://via.placeholder.com/200';
  
  // Busca la clave que termine exactamente con el nombre de archivo del JSON
  const claveEncontrada = Object.keys(imagenes).find(key => key.endsWith(nombreArchivo));
  return claveEncontrada ? imagenes[claveEncontrada] : 'https://via.placeholder.com/200';
};

const agregarAlCarrito = () => {
  // Creamos la propiedad 'precio' leyendo 'precio_uyu'
  const prendaConPrecio = {
    ...props.libro,
    precio: props.libro.precio_uyu || props.libro.precio || 0
  };

  const resultado = carritoStore.agregarAlCarrito(prendaConPrecio);

  if (!resultado.exito) {
    alert(resultado.mensaje);
    router.push('/inicio');
  } else {
    alert('Prenda agregada al carrito con éxito');
  }
};
</script>
<template>
  <div class="product-card">
    <!-- Badge de Descuento si existe -->
    <span v-if="libro.descuento" class="product-badge-discount">
      -{{ libro.descuento }}%
    </span>

    <!-- Imagen de la prenda -->
    <div class="product-image-container">
      <img :src="obtenerImagen(libro.imagen)" :alt="libro.titulo" />
    </div>

    <!-- Info del producto -->
    <div class="product-info">
      <span class="product-category">{{ libro.genero }}</span>
      <h3 class="product-title">{{ libro.titulo }}</h3>
      
      <div class="product-price-box">
        <span v-if="libro.precioAnterior" class="product-price-old">
          $U {{ libro.precioAnterior }}
        </span>
        <span class="product-price-current">
          $U {{ libro.precio_uyu }}
        </span>
      </div>

      <!-- Acciones sencillas -->
      <div class="product-actions">
        <router-link :to="'/libro/' + libro.isbn" class="btn-detalles">
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