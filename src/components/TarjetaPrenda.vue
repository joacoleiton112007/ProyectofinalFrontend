<script setup>
defineProps({
  libro: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="tarjeta-libro">
    <div class="categoria-tag">{{ libro.genero }}</div>
    <h3>{{ libro.titulo }}</h3>
    <p class="autor">Marca: <strong>{{ libro.autor }}</strong></p>
    
    <router-link :to="'/libro/' + libro.isbn" class="btn-detalles">
      Ver detalle de prenda →
    </router-link>
  </div>
</template>

<style scoped>
.tarjeta-libro {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.categoria-tag {
  align-self: flex-start;
  background-color: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.tarjeta-libro h3 {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.autor {
  margin: 4px 0;
  font-size: 0.95rem;
  color: #64748b;
}

.btn-detalles {
  display: inline-block;
  margin-top: 15px;
  color: #b84141;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
}

.btn-detalles:hover {
  color: #35495e;
}
</style>