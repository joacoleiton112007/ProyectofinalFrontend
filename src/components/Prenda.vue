Sí, claro. Te lo mando **acá directamente en el chat**. Como el archivo es largo, te lo paso completo, manteniendo tu estructura y cambiando solo la parte necesaria de reseñas.

```vue
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

// ==========================================
// CANTIDAD
// ==========================================

const cantidad = ref(10);

// ==========================================
// IMÁGENES
// ==========================================

const imagenesAssets = import.meta.glob(
  '@/assets/images/*.{png,jpg,jpeg,svg,webp}',
  {
    eager: true,
    import: 'default'
  }
);

const obtenerImagen = (nombreArchivo) => {

  if (!nombreArchivo || typeof nombreArchivo !== 'string') {

    return 'https://placehold.co/300x300?text=Sin+Imagen';

  }

  const archivoClean = nombreArchivo.trim();

  // 1. URL absoluta

  if (
    archivoClean.startsWith('http://') ||
    archivoClean.startsWith('https://')
  ) {

    return archivoClean;

  }

  // 2. Coincidencia local

  const nombreSolo = archivoClean.replace(/^productos[\\/]+/, '');

  const claveEncontrada = Object.keys(imagenesAssets).find((key) => {

    const nombreEnRuta = key.split('/').pop();

    return nombreEnRuta.toLowerCase() === nombreSolo.toLowerCase();

  });

  if (claveEncontrada) {

    return imagenesAssets[claveEncontrada];

  }

  // 3. Servidor Laravel

  if (
    archivoClean.startsWith('/storage/') ||
    archivoClean.startsWith('storage/')
  ) {

    return `http://127.0.0.1:8000/${archivoClean.replace(/^\/+/, '')}`;

  }

  return `http://127.0.0.1:8000/storage/productos/${nombreSolo}`;

};

// ==========================================
// CARGAR PRODUCTO
// ==========================================

onMounted(async () => {

  try {

    const id = route.params.id;

    libro.value = await apiFetch(`/productos/${id}`);

    cargarResenas();

  } catch (error) {

    console.error('Error al cargar la prenda:', error);

  } finally {

    cargando.value = false;

  }

});

// ==========================================
// CANTIDAD MÍNIMA Y MÁXIMA
// ==========================================

watch(cantidad, (nuevoValor) => {

  if (nuevoValor > 25) {

    cantidad.value = 25;

  } else if (nuevoValor < 10 || !nuevoValor) {

    cantidad.value = 10;

  }

});

// ==========================================
// DESCUENTOS MAYORISTAS
// ==========================================

// 10 unidades = 20%

// 20 unidades = 30%

// 25 unidades = 35%

const porcentajeDescuento = computed(() => {

  if (cantidad.value >= 25) return 35;

  if (cantidad.value >= 20) return 30;

  if (cantidad.value >= 10) return 20;

  return 0;

});

// ==========================================
// PRECIOS
// ==========================================

const precioPorPrendaBase = computed(() => {

  if (!libro.value) return 0;

  const precioPack =
    Number(libro.value.precio || libro.value.precio_uyu) || 0;

  return precioPack / 10;

});

const precioUnitario = computed(() => {

  if (porcentajeDescuento.value > 0) {

    const factorDescuento =
      (100 - porcentajeDescuento.value) / 100;

    return Math.round(
      precioPorPrendaBase.value * factorDescuento
    );

  }

  return precioPorPrendaBase.value;

});

const totalCalculado = computed(() => {

  return precioUnitario.value * cantidad.value;

});

const totalSinDescuento = computed(() => {

  return precioPorPrendaBase.value * cantidad.value;

});

// ==========================================
// CARRITO
// ==========================================

const volverAlCatalogo = () => {

  router.push('/listado');

};

const agregarAlCarrito = () => {

  if (!libro.value) return;

  const prendaAñadir = {

    ...libro.value,

    // Se manda el precio del pack; el store calcula el unitario con el descuento
    precio_pack: Number(libro.value.precio || libro.value.precio_uyu) || 0,

    cantidad: cantidad.value

  };

  const resultado =
    carritoStore.agregarAlCarrito(prendaAñadir);

  if (!resultado?.exito) {

    alert(
      resultado?.mensaje ||
      'Error al agregar al carrito'
    );

  } else {

    alert(
      `Prenda(s) agregada(s) al carrito con éxito (${porcentajeDescuento.value}% OFF)`
    );

  }

};

// ==========================================
// USUARIO ACTIVO
// ==========================================

const obtenerUsuarioActivo = () => {

  const guardado = localStorage.getItem('usuario_activo');

  if (!guardado) return null;

  try {

    return JSON.parse(guardado);

  } catch (error) {

    console.error('Error al leer el usuario activo:', error);

    return null;

  }

};

// ==========================================
// RESEÑAS
// ==========================================

const resenas = ref([]);

const nuevaPuntuacion = ref(5);

const nuevoComentario = ref('');

const nombreResenador = ref('');

// ------------------------------------------
// CLAVE DE LOCALSTORAGE
// ------------------------------------------

const claveResenas = computed(() => {

  if (!libro.value) return null;

  return `resenas_producto_${libro.value.id}`;

});

// ------------------------------------------
// CARGAR RESEÑAS
// ------------------------------------------

const cargarResenas = () => {

  if (!claveResenas.value) return;

  const guardadas =
    localStorage.getItem(claveResenas.value);

  if (guardadas) {

    try {

      resenas.value = JSON.parse(guardadas);

    } catch (error) {

      console.error(
        'Error al cargar las reseñas:',
        error
      );

      resenas.value = [];

    }

  } else {

    resenas.value = [];

  }

};

// ------------------------------------------
// PROMEDIO
// ------------------------------------------

const promedioEstrellas = computed(() => {

  if (resenas.value.length === 0) {

    return 0;

  }

  const suma = resenas.value.reduce(

    (total, resena) =>
      total + Number(resena.puntuacion),

    0

  );

  return suma / resenas.value.length;

});

// ------------------------------------------
// ESTRELLAS ENTERAS
// ------------------------------------------

const estrellasPromedio = computed(() => {

  return Math.round(promedioEstrellas.value);

});

// ------------------------------------------
// AGREGAR RESEÑA
// ------------------------------------------

const agregarResena = () => {

  const usuario = obtenerUsuarioActivo();

  if (!usuario) {

    alert('Tenés que iniciar sesión para publicar una reseña.');

    router.push('/login');

    return;

  }

  if (!nombreResenador.value.trim()) {

    alert('Por favor, ingresá tu nombre.');

    return;

  }

  if (!nuevoComentario.value.trim()) {

    alert('Por favor, escribí un comentario.');

    return;

  }

  const nuevaResena = {

    id: Date.now(),

    nombre: nombreResenador.value.trim(),

    comentario: nuevoComentario.value.trim(),

    puntuacion: nuevaPuntuacion.value,

    fecha: new Date().toLocaleDateString('es-UY'),

    usuario_id:
      usuario.id ??
      usuario.usuario_id ??
      usuario.user_id ??
      null,

    usuario_email:
      usuario.email ??
      usuario.correo ??
      null

  };

  resenas.value.unshift(nuevaResena);

  localStorage.setItem(

    claveResenas.value,

    JSON.stringify(resenas.value)

  );

  nombreResenador.value = '';

  nuevoComentario.value = '';

  nuevaPuntuacion.value = 5;

};

// ------------------------------------------
// COMPROBAR SI LA RESEÑA ES DEL USUARIO
// ------------------------------------------

const esMiResena = (resena) => {

  const usuario = obtenerUsuarioActivo();

  if (!usuario) return false;

  const usuarioId =
    usuario.id ??
    usuario.usuario_id ??
    usuario.user_id ??
    null;

  const usuarioEmail =
    usuario.email ??
    usuario.correo ??
    null;

  if (
    usuarioId !== null &&
    resena.usuario_id !== undefined &&
    resena.usuario_id !== null
  ) {

    return (
      String(resena.usuario_id) ===
      String(usuarioId)
    );

  }

  if (
    usuarioEmail &&
    resena.usuario_email
  ) {

    return (
      String(resena.usuario_email).toLowerCase() ===
      String(usuarioEmail).toLowerCase()
    );

  }

  return false;

};

// ------------------------------------------
// ELIMINAR RESEÑA
// ------------------------------------------

const eliminarResena = (resena) => {

  if (!esMiResena(resena)) {

    alert('No podés eliminar esta reseña.');

    return;

  }

  if (!confirm('¿Seguro que querés eliminar tu reseña?')) {

    return;

  }

  resenas.value = resenas.value.filter(

    (item) => item.id !== resena.id

  );

  localStorage.setItem(

    claveResenas.value,

    JSON.stringify(resenas.value)

  );

};

// ------------------------------------------
// ESTRELLAS PARA EL FORMULARIO
// ------------------------------------------

const seleccionarPuntuacion = (estrella) => {

  nuevaPuntuacion.value = estrella;

};

// ------------------------------------------
// GENERAR ESTRELLAS VISUALES
// ------------------------------------------

const estrellas = [1, 2, 3, 4, 5];

</script>

<template>

  <div class="detalle-container">

    <!-- VOLVER -->

    <button
      @click="volverAlCatalogo"
      class="btn-volver"
    >

      ← Volver al Catálogo

    </button>

    <!-- PRODUCTO -->

    <div
      v-if="libro"
      class="tarjeta-completa"
    >

      <!-- IMAGEN -->

      <div class="imagen-detalle-container">

        <img
          :src="obtenerImagen(libro.imagen)"
          :alt="libro.nombre"
          class="imagen-detalle"
        />

      </div>

      <!-- CATEGORÍA -->

      <span
        v-if="libro.categoria"
        class="categoria-tag-link"
      >

        {{ libro.categoria.nombre }}

      </span>

      <!-- NOMBRE -->

      <h2>

        {{ libro.nombre }}

      </h2>

      <!-- DESCRIPCIÓN -->

      <p
        v-if="libro.descripcion"
        class="editorial"
      >

        {{ libro.descripcion }}

      </p>

      <!-- =====================================
           RESUMEN DE ESTRELLAS
      ====================================== -->

      <div class="resumen-resenas">

        <div class="estrellas-promedio">

          <span
            v-for="estrella in estrellas"
            :key="estrella"
            class="estrella"
            :class="{
              activa: estrella <= estrellasPromedio
            }"
          >

            ★

          </span>

        </div>

        <div class="texto-promedio">

          <strong>

            {{ promedioEstrellas.toFixed(1) }}

          </strong>

          <span>

            / 5

          </span>

          <span class="cantidad-resenas">

            ({{ resenas.length }}

            {{ resenas.length === 1
              ? 'reseña'
              : 'reseñas' }})

          </span>

        </div>

      </div>

      <!-- PRECIO -->

      <div class="pie-tarjeta">

        <div class="precio-container">

          <span
            v-if="porcentajeDescuento > 0"
            class="precio-anterior"
          >

            $U

            {{ totalSinDescuento.toLocaleString('es-UY') }}

          </span>

          <span class="precio">

            $U

            {{ totalCalculado.toLocaleString('es-UY') }}

          </span>

        </div>

      </div>

      <!-- ACCIONES -->

      <div class="bloque-acciones">

        <div class="selector-cantidad">

          <label>

            Cantidad (Mín. 10 - Máx. 25 Uds):

          </label>

          <!-- CONTADOR -->

          <div class="controles">

            <button
              type="button"
              @click="
                cantidad > 10
                  ? cantidad--
                  : null
              "
              :disabled="cantidad <= 10"
            >

              -

            </button>

            <input
              type="number"
              v-model.number="cantidad"
              min="10"
              max="25"
            />

            <button
              type="button"
              @click="
                cantidad < 25
                  ? cantidad++
                  : null
              "
              :disabled="cantidad >= 25"
            >

              +

            </button>

          </div>

          <!-- PACK 10 -->

          <button
            type="button"
            @click="cantidad = 10"
            class="btn-pack"
          >

            Pack 10 (20% OFF)

          </button>

          <!-- PACK 20 -->

          <button
            type="button"
            @click="cantidad = 20"
            class="btn-pack"
          >

            Pack 20 (30% OFF)

          </button>

          <!-- PACK 25 -->

          <button
            type="button"
            @click="cantidad = 25"
            class="btn-pack"
          >

            Pack 25 (35% OFF)

          </button>

        </div>

        <!-- AVISO DESCUENTO -->

        <p
          v-if="porcentajeDescuento > 0"
          class="aviso-mayorista"
        >

          🔥 ¡{{ porcentajeDescuento }}% OFF aplicado!

          ($U

          {{ precioUnitario.toLocaleString('es-UY') }}

          c/u)

        </p>

        <p
          v-else
          class="aviso-tip"
        >

          💡 Llevá 10 unidades para un 20% OFF,

          20 unidades para un 30% OFF

          y hasta 25 unidades para un 35% OFF.

        </p>

        <!-- BOTÓN CARRITO -->

        <div class="botones-compra">

          <button
            @click="agregarAlCarrito"
            class="btn-agregar"
          >

            🛒 Agregar al Carrito

          </button>

        </div>

      </div>

    </div>

    <!-- =====================================
         SECCIÓN RESEÑAS
    ====================================== -->

    <section
      v-if="libro"
      class="seccion-resenas"
    >

      <h3>

        ⭐ Opiniones de clientes

      </h3>

      <!-- FORMULARIO -->

      <div class="formulario-resena">

        <h4>

          Dejá tu opinión

        </h4>

        <!-- NOMBRE -->

        <input
          v-model="nombreResenador"
          type="text"
          placeholder="Tu nombre"
          class="input-resena"
        />

        <!-- ESTRELLAS -->

        <div class="selector-estrellas">

          <span
            v-for="estrella in estrellas"
            :key="estrella"
            class="estrella-formulario"
            :class="{
              seleccionada:
                estrella <= nuevaPuntuacion
            }"
            @click="
              seleccionarPuntuacion(estrella)
            "
          >

            ★

          </span>

        </div>

        <!-- COMENTARIO -->

        <textarea
          v-model="nuevoComentario"
          placeholder="Escribí tu comentario sobre esta prenda..."
          class="textarea-resena"
          rows="4"
        ></textarea>

        <!-- ENVIAR -->

        <button
          @click="agregarResena"
          class="btn-enviar-resena"
        >

          Publicar reseña

        </button>

      </div>

      <!-- LISTADO DE RESEÑAS -->

      <div
        v-if="resenas.length > 0"
        class="lista-resenas"
      >

        <article
          v-for="resena in resenas"
          :key="resena.id"
          class="resena"
        >

          <div class="resena-cabecera">

            <div>

              <strong>

                {{ resena.nombre }}

              </strong>

              <div class="estrellas-resena">

                <span
                  v-for="estrella in estrellas"
                  :key="estrella"
                  :class="{
                    activa:
                      estrella <= resena.puntuacion
                  }"
                >

                  ★

                </span>

              </div>

            </div>

            <div class="resena-derecha">

              <small>

                {{ resena.fecha }}

              </small>

              <button
                v-if="esMiResena(resena)"
                type="button"
                class="btn-eliminar-resena"
                @click="eliminarResena(resena)"
              >

                🗑️ Eliminar

              </button>

            </div>

          </div>

          <p>

            {{ resena.comentario }}

          </p>

        </article>

      </div>

      <!-- SIN RESEÑAS -->

      <div
        v-else
        class="sin-resenas"
      >

        <p>

          Todavía no hay reseñas para esta prenda.

        </p>

        <span>

          ¡Sé el primero en dejar una opinión!

        </span>

      </div>

    </section>

    <!-- SIN RESULTADOS -->

    <div
      v-else-if="!cargando"
      class="sin-resultados"
    >

      <p>

        No se encontró la prenda seleccionada.

      </p>

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

  transition: all 0.2s;

}

.btn-pack:hover {

  background-color: #cbd5e1;

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

.btn-agregar {

  width: 100%;

  padding: 12px;

  border: none;

  border-radius: 6px;

  font-weight: bold;

  cursor: pointer;

  transition: background 0.2s;

  background-color: #334155;

  color: white;

}

.btn-agregar:hover {

  background-color: #1e293b;

}

/* ==========================================
   RESEÑAS
========================================== */

.resumen-resenas {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-top: 10px;

  margin-bottom: 5px;

}

.estrellas-promedio {

  display: flex;

  gap: 2px;

}

.estrella {

  color: #cbd5e1;

  font-size: 1.35rem;

}

.estrella.activa {

  color: #f59e0b;

}

.texto-promedio {

  color: #475569;

  font-size: 0.95rem;

}

.texto-promedio strong {

  color: #1e293b;

  font-size: 1rem;

}

.cantidad-resenas {

  margin-left: 5px;

  color: #64748b;

}

/* ==========================================
   SECCIÓN DE RESEÑAS
========================================== */

.seccion-resenas {

  margin-top: 30px;

  background: white;

  border: 1px solid #e2e8f0;

  border-radius: 10px;

  padding: 25px;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

}

.seccion-resenas h3 {

  margin: 0 0 20px 0;

  color: #1e293b;

  font-size: 1.4rem;

}

.formulario-resena {

  background-color: #f8fafc;

  border: 1px solid #e2e8f0;

  border-radius: 8px;

  padding: 18px;

  margin-bottom: 25px;

}

.formulario-resena h4 {

  margin: 0 0 15px 0;

  color: #334155;

}

.input-resena {

  width: 100%;

  box-sizing: border-box;

  padding: 10px 12px;

  border: 1px solid #cbd5e1;

  border-radius: 6px;

  margin-bottom: 12px;

  font-family: inherit;

  outline: none;

}

.input-resena:focus {

  border-color: #64748b;

}

.selector-estrellas {

  display: flex;

  gap: 4px;

  margin-bottom: 12px;

}

.estrella-formulario {

  font-size: 1.8rem;

  color: #cbd5e1;

  cursor: pointer;

  transition: color 0.15s;

}

.estrella-formulario:hover,

.estrella-formulario.seleccionada {

  color: #f59e0b;

}

.textarea-resena {

  width: 100%;

  box-sizing: border-box;

  padding: 10px 12px;

  border: 1px solid #cbd5e1;

  border-radius: 6px;

  resize: vertical;

  font-family: inherit;

  margin-bottom: 12px;

  outline: none;

}

.textarea-resena:focus {

  border-color: #64748b;

}

.btn-enviar-resena {

  background-color: #334155;

  color: white;

  border: none;

  border-radius: 6px;

  padding: 10px 18px;

  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s;

}

.btn-enviar-resena:hover {

  background-color: #1e293b;

}

/* ==========================================
   LISTADO DE RESEÑAS
========================================== */

.lista-resenas {

  display: flex;

  flex-direction: column;

  gap: 15px;

}

.resena {

  border-bottom: 1px solid #e2e8f0;

  padding-bottom: 15px;

}

.resena:last-child {

  border-bottom: none;

}

.resena-cabecera {

  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 10px;

}

.resena-cabecera strong {

  color: #1e293b;

}

.resena-cabecera small {

  color: #94a3b8;

  font-size: 0.8rem;

}

.resena-derecha {

  display: flex;

  align-items: center;

  gap: 10px;

}

.btn-eliminar-resena {

  border: none;

  background: transparent;

  color: #b91c1c;

  font-size: 0.8rem;

  cursor: pointer;

  padding: 3px 0;

}

.btn-eliminar-resena:hover {

  text-decoration: underline;

}

.estrellas-resena {

  display: flex;

  gap: 1px;

  margin-top: 3px;

}

.estrellas-resena span {

  color: #cbd5e1;

  font-size: 1rem;

}

.estrellas-resena span.activa {

  color: #f59e0b;

}

.resena p {

  margin: 8px 0 0 0;

  color: #475569;

  line-height: 1.5;

}

.sin-resenas {

  text-align: center;

  padding: 20px;

  color: #64748b;

}

.sin-resenas p {

  margin-bottom: 5px;

}

.sin-resenas span {

  font-size: 0.9rem;

}

/* ==========================================
   SIN RESULTADOS
========================================== */

.sin-resultados {

  text-align: center;

  color: #64748b;

}

</style>
```
