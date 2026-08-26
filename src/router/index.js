import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '@/components/Inicio.vue'
import ListadoView from '@/components/Listado.vue'
import GeneroView from '@/components/Genero.vue'
import PrendaView from '@/components/Prenda.vue'
import CarritoView from '@/components/Carrito.vue'
import MayoristaAuth from '@/components/MayoristaAuth.vue'
import MayoristaPanel from '@/components/MayoristaPanel.vue'
import { useMayoristaStore } from '@/stores/mayoristaStore'

const RUTA_SECRET_MAYORISTA = '/LACACADEBRUNODEAXELDEERNESTODEJOACO54321'

const routes = [
  { path: '/', name: 'inicio', component: InicioView },
  { path: '/listado', name: 'listado', component: ListadoView },
  { path: '/genero/:nombreGenero', name: 'genero', component: GeneroView },
  { path: '/libro/:isbn', name: 'libro', component: PrendaView },
  { path: '/carrito', name: 'carrito', component: CarritoView },
  
  // Ruta secreta de acceso directo
  { path: RUTA_SECRET_MAYORISTA, name: 'mayorista-secreto', component: MayoristaAuth },
  
  // Rutas estándar de mayorista
  { path: '/mayorista/acceso', name: 'mayorista-acceso', component: MayoristaAuth },
  {
    path: '/mayorista/panel',
    name: 'mayorista-panel',
    component: MayoristaPanel,
    meta: { requiereMayorista: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const mayoristaStore = useMayoristaStore()

  // Si entra a través de la URL secreta, autoriza el acceso permanente en el equipo
  if (to.path === RUTA_SECRET_MAYORISTA) {
    localStorage.setItem('mayorista_desbloqueado', 'true')
    return next('/mayorista/acceso')
  }

  // Protección de las rutas /mayorista
  if (to.path.startsWith('/mayorista')) {
    const desbloqueado = localStorage.getItem('mayorista_desbloqueado') === 'true'

    if (!desbloqueado) {
      return next('/')
    }

    if (to.meta.requiereMayorista && !mayoristaStore.estaAutenticado()) {
      return next('/mayorista/acceso')
    }
  }

  next()
})

export default router