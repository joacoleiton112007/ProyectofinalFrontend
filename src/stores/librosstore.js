import { defineStore } from 'pinia';
import { ref } from 'vue';
import datosLibros from '@/assets/datos.json'; 

export const useLibrosStore = defineStore('libros', () => {
  
  const lista = ref(datosLibros.libros || datosLibros);

  
  const obtenerPorIsbn = (isbn) => {
    return lista.value.find(libro => libro.isbn === isbn);
  };


  const filtrarPorGenero = (genero) => {
    if (genero === 'Todos') return lista.value;
    return lista.value.filter(libro => libro.genero.toLowerCase() === genero.toLowerCase());
  };

  
  const generosDisponibles = () => {
    const generos = lista.value.map(l => l.genero);
    return ['Todos', ...new Set(generos)];
  };

  return {
    lista,
    obtenerPorIsbn,
    filtrarPorGenero,
    generosDisponibles
  };
});