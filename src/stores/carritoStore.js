import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCarritoStore = defineStore('carrito', () => {
  // Carga inicial desde localStorage para persistencia
  const datosGuardados = localStorage.getItem('prendas_carrito');
  const items = ref(datosGuardados ? JSON.parse(datosGuardados) : []);

  // Función para sincronizar los cambios en el navegador
  const guardarEnStorage = () => {
    localStorage.setItem('prendas_carrito', JSON.stringify(items.value));
  };

  // Verificar autenticación estricta (Mantenida por si la usás en otras vistas o futuro checkout)
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

  const agregarAlCarrito = (prenda) => {
    // Nota: Quitamos el bloque de `if (!estaAutenticado())` para permitir 
    // que el usuario agregue prendas al carrito de forma anónima.

    // Busca por isbn o por id
    const idPrenda = prenda.isbn || prenda.id;
    const existe = items.value.find((item) => (item.isbn || item.id) === idPrenda);
    const cantidadASumar = prenda.cantidad || 1;

    if (existe) {
      existe.cantidad += cantidadASumar;
    } else {
      items.value.push({ 
        ...prenda, 
        cantidad: cantidadASumar 
      });
    }

    // Actualiza precios con descuento si corresponde por volumen
    actualizarPreciosEspeciales();

    guardarEnStorage();

    return { 
      exito: true, 
      mensaje: 'Prenda agregada al carrito con éxito.' 
    };
  };

  // Recalcula el precio unitario si el ítem individual alcanza/supera las 10 unidades
  const actualizarPreciosEspeciales = () => {
    items.value.forEach(item => {
      const precioBase = item.precio_uyu || item.precio_original || item.precio;
      if (!item.precio_original) item.precio_original = precioBase;

      if (item.cantidad >= 10) {
        item.precio = item.precio_unitario || Math.round(precioBase * 0.7); // 30% OFF Mayorista
        item.descuentoAplicado = 30;
      } else {
        item.precio = item.precio_original;
        item.descuentoAplicado = 0;
      }
    });
  };

  const ModificarCantidad = (id, nuevaCantidad) => {
    const item = items.value.find((item) => (item.isbn || item.id) === id);
    if (item) {
      if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
      } else {
        item.cantidad = nuevaCantidad;
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