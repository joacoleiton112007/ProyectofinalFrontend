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
        <li 
          v-for="item in carritoStore.items" 
          :key="item.isbn || item.id" 
          class="item-carrito"
        >
          <div class="info-item">
            <h4>{{ item.titulo || item.nombre || 'Prenda sin título' }}</h4>
            <p v-if="item.autor || item.marca">
              Marca/Autor: <strong>{{ item.autor || item.marca }}</strong>
            </p>
            <p>Cantidad: <strong>{{ item.cantidad }}</strong></p>
          </div>

          <button 
            @click="carritoStore.eliminarDelCarrito(item.isbn || item.id)" 
            class="btn-eliminar"
          >
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

h2 {
  color: #2c3e50;
  border-bottom: 2px solid #b84141;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.alerta-sesion, .carrito-vacio {
  text-align: center;
  padding: 40px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.lista-items {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.item-carrito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.info-item h4 {
  margin: 0 0 6px 0;
  color: #1e293b;
}

.info-item p {
  margin: 2px 0;
  color: #64748b;
  font-size: 0.9rem;
}

.resumen {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f5f9;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.btn-login, .btn-comprar {
  background-color: #b84141;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
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