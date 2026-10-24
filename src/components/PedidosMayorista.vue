<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/services/api';

const pedidos = ref([]);
const cargando = ref(true);
const error = ref('');
const abierto = ref(null);

const formatoMonto = (valor) =>
  Number(valor || 0).toLocaleString('es-UY', { maximumFractionDigits: 0 });

const numeroPedido = (id) => String(id).padStart(6, '0');

const formatoFecha = (fecha) =>
  new Date(fecha).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' });

const cargarPedidos = async () => {
  cargando.value = true;
  error.value = '';

  try {
    pedidos.value = await apiFetch('/pedidos');
  } catch (e) {
    error.value = e.message || 'No se pudieron cargar los pedidos.';
  } finally {
    cargando.value = false;
  }
};

const alternar = (id) => {
  abierto.value = abierto.value === id ? null : id;
};

onMounted(cargarPedidos);
</script>

<template>
  <section class="pedidos-card">
    <div class="pedidos-cabecera">
      <h3>Pedidos Recibidos</h3>
      <button class="btn-actualizar" @click="cargarPedidos" :disabled="cargando">
        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <p v-if="error" class="pedidos-error">{{ error }}</p>

    <p v-else-if="!cargando && pedidos.length === 0" class="pedidos-vacio">
      Todavía no hay pedidos.
    </p>

    <div v-else class="lista-pedidos">
      <article v-for="pedido in pedidos" :key="pedido.id" class="pedido">
        <button class="pedido-resumen" @click="alternar(pedido.id)">
          <div>
            <strong>Pedido #{{ numeroPedido(pedido.id) }}</strong>
            <span class="pedido-cliente">
              {{ pedido.usuario?.nombre }} {{ pedido.usuario?.apellido }}
            </span>
          </div>
          <div class="pedido-derecha">
            <small>{{ formatoFecha(pedido.created_at) }}</small>
            <strong class="pedido-total">${{ formatoMonto(pedido.total) }}</strong>
          </div>
        </button>

        <div v-if="abierto === pedido.id" class="pedido-detalle">
          <p v-if="pedido.usuario?.email" class="pedido-email">
            {{ pedido.usuario.email }}
          </p>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in pedido.detalles" :key="d.id">
                <td>{{ d.producto?.nombre }}</td>
                <td>{{ d.cantidad }}</td>
                <td>${{ formatoMonto(d.precio_unitario) }}</td>
                <td>${{ formatoMonto(d.precio_unitario * d.cantidad) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.pedidos-card {
  background: white;
  border-radius: 12px;
  padding: 30px 35px;
  margin-top: 40px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.pedidos-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.pedidos-cabecera h3 {
  margin: 0;
  color: #1e293b;
}

.btn-actualizar {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
}

.btn-actualizar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pedidos-error {
  color: #b91c1c;
}

.pedidos-vacio {
  color: #64748b;
  text-align: center;
  padding: 20px;
}

.lista-pedidos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pedido {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.pedido-resumen {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border: none;
  padding: 14px 18px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.pedido-resumen:hover {
  background: #f1f5f9;
}

.pedido-cliente {
  display: block;
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 3px;
}

.pedido-derecha {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pedido-derecha small {
  color: #94a3b8;
}

.pedido-total {
  color: #b84141;
  font-size: 1.05rem;
}

.pedido-detalle {
  padding: 14px 18px;
  border-top: 1px solid #e2e8f0;
}

.pedido-email {
  margin: 0 0 10px 0;
  color: #64748b;
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

th {
  color: #64748b;
  font-weight: 600;
}
</style>