import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '@/components/Inicio.vue'
import ListadoView from '@/components/Listado.vue'
import GeneroView from '@/components/Genero.vue'
import PrendaView from '@/components/Prenda.vue'
import CarritoView from '@/components/Carrito.vue'

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
      component: PrendaView

        
    },
    {
      // Ruta dinámica para ver el detalle por ISBN
      path: '/carrito',
      name: 'Carrito',
      component: CarritoView

    }
  ],
})

export default router