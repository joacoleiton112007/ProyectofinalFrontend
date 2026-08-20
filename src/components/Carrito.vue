<script setup>
import { useCarritoStore } from '@/stores/carritoStore';
import { useRouter } from 'vue-router';

const carritoStore = useCarritoStore();
const router = useRouter();

const irAInicio = () => {
  router.push('/inicio');
};
</script>

<template>
  <div class="carrito-container">
    <h2>Tu Carrito de Compras</h2>

    <!-- Si no inició sesión -->
    <div v-if="!carritoStore.estaAutenticado()" class="alerta-sesion">
      <p>Debes iniciar sesión para ver y gestionar tu carrito.</p>
      <button @click="irAInicio" class="btn-login">Ir a Iniciar Sesión</button>
    </div>

    <!-- Si inició sesión pero el carrito está vacío -->
    <div v-else-if="carritoStore.items.length === 0" class="carrito-vacio">
      <p>Tu carrito está vacío.</p>
    </div>

    <!-- Lista de prendas agregadas -->
    <div v-else class="contenido-carrito">
      <ul class="lista-items">
        <li v-for="item in carritoStore.items" :key="item.isbn" class="item-carrito">
          <div class="info-item">
            <h4>{{ item.titulo }}</h4>
            <p>Cantidad: {{ item.cantidad }}</p>
          </div>
          <button @click="carritoStore.eliminarDelCarrito(item.isbn)" class="btn-eliminar">
            Eliminar
          </button>
        </li>
      </ul>

      <div class="resumen">
        <h3>Total: ${{ carritoStore.total }}</h3>
        <button class="btn-comprar">Finalizar Compra</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carrito-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

.alerta-sesion, .carrito-vacio {
  text-align: center;
  padding: 40px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.item-carrito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.btn-login, .btn-comprar {
  background-color: #b85141;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-eliminar {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>