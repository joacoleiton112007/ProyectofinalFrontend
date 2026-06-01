import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '@/components/Inicio.vue'
import ListadoView from '@/components/Listado.vue'
import GeneroView from '@/components/Genero.vue'
import LibroView from '@/components/Libro.vue'
import TarjetaLibroView from '@/components/TarjetaLibro.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: InicioView
    },
    {
      path: '/listado',
      name: 'listado',
      component: ListadoView

      },
    {
      // Ruta dinámica para filtrar por género
      path: '/genero/:nombreGenero',
      name: 'genero',
      component: GeneroView
    },
    {
      // Ruta dinámica para ver el detalle por ISBN
      path: '/libro/:isbn',
      name: 'libro',
      component: LibroView
    }
  ],
})

export default router


