<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibrosStore } from '@/stores/librosstore';
import { useCarritoStore } from '@/stores/carritoStore';

const route = useRoute();
const router = useRouter();
const store = useLibrosStore();
const carritoStore = useCarritoStore();

const libro = computed(() => store.obtenerPorIsbn(route.params.isbn));

// Cantidad de prendas (Límite estricto: 1 a 25)
const cantidad = ref(1);

watch(cantidad, (nuevoValor) => {
  if (nuevoValor > 25) {
    cantidad.value = 25;
  } else if (nuevoValor < 1 || !nuevoValor) {
    cantidad.value = 1;
  }
});

// 1. Escala por tramos de descuento mayorista
const porcentajeDescuento = computed(() => {
  if (cantidad.value >= 20) {
    return 40; // De 20 a 25 unidades -> 40% OFF
  } else if (cantidad.value >= 10) {
    return 30; // De 10 a 19 unidades -> 30% OFF
  }
  return 0; // De 1 a 9 unidades -> Sin descuento (0%)
});

// 2. Precio unitario base real sin ningún descuento aplicado
const precioUnitarioBase = computed(() => {
  if (!libro.value) return 0;

  // Tomamos el valor de la prenda directo si existe
  if (libro.value.precio_unitario) {
    return libro.value.precio_unitario;
  }

  // Si el objeto viene con precio total de lote/pack, calculamos el precio individual base
  const totalLote = libro.value.precio_uyu || libro.value.precio || 0;
  const unidadesPack = libro.value.pack_unidades || 10;
  return Math.round(totalLote / unidadesPack);
});

// 3. Precio unitario final según el tramo de descuento actual
const precioUnitario = computed(() => {
  if (!libro.value) return 0;

  if (porcentajeDescuento.value > 0) {
    const factorDescuento = (100 - porcentajeDescuento.value) / 100;
    return Math.round(precioUnitarioBase.value * factorDescuento);
  }

  return precioUnitarioBase.value;
});

// 4. Totales calculados para la interfaz
const totalCalculado = computed(() => precioUnitario.value * cantidad.value);
const totalSinDescuento = computed(() => precioUnitarioBase.value * cantidad.value);

const imagenes = import.meta.glob('../assets/images/*', { eager: true, import: 'default' });

const obtenerImagen = (nombreArchivo) => {
  if (!nombreArchivo) return 'https://via.placeholder.com/300';
  const claveEncontrada = Object.keys(imagenes).find(key => key.endsWith(nombreArchivo));
  return claveEncontrada ? imagenes[claveEncontrada] : 'https://via.placeholder.com/300';
};

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

  if (!resultado.exito) {
    alert(resultado.mensaje);
    router.push('/inicio');
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
        <div class="precio-container">
          <span v-if="porcentajeDescuento > 0" class="precio-anterior">
            $U {{ totalSinDescuento.toLocaleString('es-UY') }}
          </span>
          <span class="precio">$U {{ totalCalculado.toLocaleString('es-UY') }}</span>
        </div>
      </div>

      <div class="bloque-acciones">
        <div class="selector-cantidad">
          <label>Cantidad (Máx. 25 Uds):</label>
          <div class="controles">
            <button @click="cantidad > 1 ? cantidad-- : null" :disabled="cantidad <= 1">-</button>
            <input type="number" v-model.number="cantidad" min="1" max="25" />
            <button @click="cantidad < 25 ? cantidad++ : null" :disabled="cantidad >= 25">+</button>
          </div>
          <button type="button" @click="cantidad = 10" class="btn-pack">
            Pack 10 (30% OFF)
          </button>
          <button type="button" @click="cantidad = 20" class="btn-pack">
            Pack 20 (40% OFF)
          </button>
        </div>

        <p v-if="porcentajeDescuento > 0" class="aviso-mayorista">
          🔥 ¡{{ porcentajeDescuento }}% OFF aplicado! ($U {{ precioUnitario }} c/u)
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
  gap: 12px;
}

.selector-cantidad label {
  font-weight: 600;
  color: #475569;
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

.controles input {
  width: 45px;
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