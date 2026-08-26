<script setup>
import { useRouter } from 'vue-router'
import { useMayoristaStore } from '@/stores/mayoristaStore'

const router = useRouter()
const mayoristaStore = useMayoristaStore()

const cerrarSesion = () => {
  mayoristaStore.logout()
  router.push('/mayorista/acceso')
}
</script>

<template>
  <div class="panel-container">
    <header class="panel-header">
      <div class="header-info">
        <h2>Panel Mayorista</h2>
        <p class="empresa-nombre">
          Empresa: <strong>{{ mayoristaStore.mayoristaActual?.razonSocial || 'Distribuidor' }}</strong>
        </p>
      </div>
      <button @click="cerrarSesion" class="btn-logout">Cerrar Sesión</button>
    </header>

    <main class="panel-content">
      <div class="card-bienvenida">
        <h3>Bienvenido/a al Área Privada</h3>
        <p>Catálogo y gestión comercial habilitada para compras al por mayor.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.panel-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.header-info h2 {
  margin: 0;
  color: #0f172a;
}

.empresa-nombre {
  margin: 5px 0 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.btn-logout {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.card-bienvenida {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 30px;
  border-radius: 8px;
  margin-top: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-bienvenida h3 {
  margin-top: 0;
  color: #1e293b;
}

.card-bienvenida p {
  color: #475569;
  margin-bottom: 0;
}
</style>