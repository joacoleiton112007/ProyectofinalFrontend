import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCarritoStore = defineStore('carrito', () => {
  // Carga inicial desde localStorage para que no se pierdan al navegar
  const datosGuardados = localStorage.getItem('prendas_carrito');
  const items = ref(datosGuardados ? JSON.parse(datosGuardados) : []);

  // Función para sincronizar los cambios
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

  const agregarAlCarrito = (prenda) => {
    if (!estaAutenticado()) {
      return { 
        exito: false, 
        mensaje: 'Debes iniciar sesión para agregar prendas al carrito.' 
      };
    }

    // Busca por isbn o por id para asegurar compatibilidad
    const idPrenda = prenda.isbn || prenda.id;
    const existe = items.value.find((item) => (item.isbn || item.id) === idPrenda);

    if (existe) {
      existe.cantidad++;
    } else {
      items.value.push({ ...prenda, cantidad: 1 });
    }

    guardarEnStorage(); // Guardo en el navegador

    return { 
      exito: true, 
      mensaje: 'Prenda agregada al carrito con éxito.' 
    };
  };

  const eliminarDelCarrito = (id) => {
    items.value = items.value.filter((item) => (item.isbn || item.id) !== id);
    guardarEnStorage(); // Actualizo almacenamiento
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