
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMayoristaStore = defineStore('mayorista', () => {
  const datosGuardados = localStorage.getItem('mayorista_sesion')
  const mayoristaActual = ref(datosGuardados ? JSON.parse(datosGuardados) : null)

  // GESTIÓN DE PRODUCTOS / INVENTARIO
  const productosGuardados = localStorage.getItem('productos_mayorista')
  const productos = ref(productosGuardados ? JSON.parse(productosGuardados) : [
    { id: 1, nombre: 'Remera Oversize', precio: 1200, categoria: 'Hombre' },
    { id: 2, nombre: 'Buzo Hoodie', precio: 2500, categoria: 'Mujer' }
  ])

  const guardarProductosEnStorage = () => {
    localStorage.setItem('productos_mayorista', JSON.stringify(productos.value))
  }

  const agregarProducto = (nuevo) => {
    const item = {
      id: Date.now(),
      ...nuevo
    }
    productos.value.push(item)
    guardarProductosEnStorage()
  }

  const duplicarProducto = (prod) => {
    const clon = {
      ...prod,
      id: Date.now(),
      nombre: `${prod.nombre} (Copia)`
    }
    productos.value.push(clon)
    guardarProductosEnStorage()
  }

  const eliminarProducto = (id) => {
    productos.value = productos.value.filter(p => p.id !== id)
    guardarProductosEnStorage()
  }

  // AUTENTICACIÓN
  const obtenerUsuariosRegistrados = () => {
    const usuarios = localStorage.getItem('mayoristas_db')
    return usuarios ? JSON.parse(usuarios) : []
  }

  const registrarMayorista = (datos) => {
    const usuarios = obtenerUsuariosRegistrados()
    const existe = usuarios.find(u => u.rut === datos.rut || u.email === datos.email)
    if (existe) {
      return { exito: false, mensaje: 'El RUT o email ya está registrado.' }
    }

    usuarios.push(datos)
    localStorage.setItem('mayoristas_db', JSON.stringify(usuarios))
    return { exito: true, mensaje: 'Registro exitoso. Ahora puedes iniciar sesión.' }
  }

  const loginMayorista = (email, password) => {
    const usuarios = obtenerUsuariosRegistrados()
    const usuario = usuarios.find(u => u.email === email && u.password === password)

    if (!usuario) {
      return { exito: false, mensaje: 'Credenciales incorrectas.' }
    }

    mayoristaActual.value = usuario
    localStorage.setItem('mayorista_sesion', JSON.stringify(usuario))
    return { exito: true, mensaje: 'Acceso correcto.' }
  }

  const logout = () => {
    mayoristaActual.value = null
    localStorage.removeItem('mayorista_sesion')
  }

  const estaAutenticado = () => mayoristaActual.value !== null

  return { 
    mayoristaActual, 
    productos,
    agregarProducto,
    duplicarProducto,
    eliminarProducto,
    registrarMayorista, 
    loginMayorista, 
    logout, 
    estaAutenticado 
  }
})