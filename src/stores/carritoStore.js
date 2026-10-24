import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const CANTIDAD_MIN = 10;
const CANTIDAD_MAX = 25;

export const useCarritoStore = defineStore('carrito', () => {
  // Carga inicial desde localStorage para persistencia
  const datosGuardados = localStorage.getItem('prendas_carrito');
  const items = ref(datosGuardados ? JSON.parse(datosGuardados) : []);

  // Función para sincronizar los cambios en el navegador
  const guardarEnStorage = () => {
    localStorage.setItem('prendas_carrito', JSON.stringify(items.value));
  };

  // Verificar autenticación estricta
  const estaAutenticado = () => {
    const usuario = localStorage.getItem('usuario_activo');

    if (!usuario || usuario === 'null' || usuario === 'undefined') {
      return false;
    }

    try {
      const parsed = JSON.parse(usuario);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return usuario.trim().length > 0;
    }
  };

  // Misma regla que el servidor: 10 = 20%, 20 = 30%, 25 = 35%
  const porcentajeDescuento = (cantidad) => {
    if (cantidad >= 25) return 35;
    if (cantidad >= 20) return 30;
    return 20;
  };

  // El precio guardado en la base es el del pack x10; el unitario sale de ahí
  const actualizarPreciosEspeciales = () => {
    items.value.forEach((item) => {
      if (!item.precio_pack) return;

      const descuento = porcentajeDescuento(item.cantidad);
      item.precio = Math.round((item.precio_pack / 10) * ((100 - descuento) / 100));
      item.descuentoAplicado = descuento;
    });
  };

  const agregarAlCarrito = (prenda) => {
    // Permite agregar prendas de forma anónima (el login se pide al finalizar)
    const idPrenda = prenda.isbn || prenda.id;
    const existe = items.value.find((item) => (item.isbn || item.id) === idPrenda);
    const cantidadASumar = Number(prenda.cantidad) || CANTIDAD_MIN;

    if (existe) {
      existe.cantidad = Math.min(CANTIDAD_MAX, existe.cantidad + cantidadASumar);
    } else {
      items.value.push({
        ...prenda,
        precio_pack: Number(prenda.precio_pack ?? prenda.precio_uyu ?? prenda.precio) || 0,
        cantidad: Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, cantidadASumar)),
      });
    }

    actualizarPreciosEspeciales();
    guardarEnStorage();

    return {
      exito: true,
      mensaje: 'Prenda agregada al carrito con éxito.'
    };
  };

  const ModificarCantidad = (id, nuevaCantidad) => {
    const item = items.value.find((item) => (item.isbn || item.id) === id);
    if (item) {
      if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
      } else {
        item.cantidad = Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, nuevaCantidad));
        actualizarPreciosEspeciales();
        guardarEnStorage();
      }
    }
  };

  const eliminarDelCarrito = (id) => {
    items.value = items.value.filter((item) => (item.isbn || item.id) !== id);
    guardarEnStorage();
  };

  const vaciarCarrito = () => {
    items.value = [];
    guardarEnStorage();
  };

  const total = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.precio || 0) * item.cantidad, 0);
  });

  const cantidadTotalItems = computed(() => {
    return items.value.reduce((acc, item) => acc + item.cantidad, 0);
  });

  return {
    items,
    agregarAlCarrito,
    ModificarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    total,
    cantidadTotalItems,
    estaAutenticado
  };
});