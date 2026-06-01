<script setup>

// Recibimos la función de navegación desde el componente padre (App.vue)

defineProps({

  alHacerClicEnVer: {

    type: Function,

    required: true

  }

});

</script>



<template>

  <div class="inicio-container">

    <section class="hero">

      <h2>Libreria Melo </h2>

      <p>Descubrí nuestra colección completa de libros y publicaciones.</p>

     

      <!-- Al hacer clic ejecuta la función recibida de App.vue -->

      <router-link to="/listado" class="btn-principal">
        Ver Libros
      </router-link>
    </section>
  </div>
</template>



<style scoped>

.inicio-container {

  max-width: 800px;

  margin: 60px auto 0 auto;

  text-align: center;

}



.hero {

  background: #ffffff;

  border: 1px solid #e2e8f0;

  padding: 60px 40px;

  border-radius: 12px;

  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

}



.hero h2 {

  font-size: 2.5rem;

  color: #0f172a;

  margin-bottom: 15px;

}



.hero p {

  font-size: 1.2rem;

  color: #475569;

  margin-bottom: 35px;

}



.btn-principal {

display: inline-block;
text-decoration: none;

  background-color: #41b883;

  color: white;

  border: none;

  font-size: 1.2rem;

  font-weight: bold;

  padding: 14px 40px;

  border-radius: 8px;

  cursor: pointer;

  box-shadow: 0 4px 6px -1px rgba(65, 184, 131, 0.2);

  transition: background-color 0.2s, transform 0.1s;

}



.btn-principal:hover {

  background-color: #35495e;

}



.btn-principal:active {

  transform: scale(0.97);

}

</style> 

