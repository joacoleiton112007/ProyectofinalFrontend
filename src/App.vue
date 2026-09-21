<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import HeaderMayorista from '@/components/HeaderMayorista.vue';
import HeaderPublico from '@/components/HeaderPublico.vue';

const route = useRoute();

// Comprueba si la ruta actual pertenece al portal mayorista
const esRutaMayorista = computed(() => route.path.startsWith('/mayorista'));
</script>

<template>
  <div class="app-container">
    <!-- Switch dinámico entre Header Mayorista y Header Público -->
    <HeaderMayorista v-if="esRutaMayorista" />
    <HeaderPublico v-else />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #d9d0c9;
}

.content {
  padding: 30px 40px;
}
</style>