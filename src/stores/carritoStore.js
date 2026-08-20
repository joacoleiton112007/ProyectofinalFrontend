import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref([]);

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
      // Si la clave no era JSON pero tiene texto válido
      return usuario.trim().length > 0;
    }
  };

  const agregarAlCarrito = (prenda) => {
    if (!estaAutenticado()) {
      return { 
        exito: false, 
        mensaje: 'Debes iniciar sesión para agregar prendas al carrito.' 
      };
    }

    const existe = items.value.find((item) => item.isbn === prenda.isbn);
    if (existe) {
      existe.cantidad++;
    } else {
      items.value.push({ ...prenda, cantidad: 1 });
    }

    return { 
      exito: true, 
      mensaje: 'Prenda agregada al carrito con éxito.' 
    };
  };

  const eliminarDelCarrito = (isbn) => {
    items.value = items.value.filter((item) => item.isbn !== isbn);
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
    eliminarDelCarrito, 
    total, 
    cantidadTotalItems, 
    estaAutenticado 
  };
});