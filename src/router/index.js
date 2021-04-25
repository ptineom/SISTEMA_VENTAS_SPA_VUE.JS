import Vue from 'vue'
import VueRouter from 'vue-router'
import ModLogin from '../store/Modules/ModLogin'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      bLibre: true
    }
  },
  {
    path: '/empresa_Sede',
    name: 'Empresa_Sede',
    component: () => import('../views/Empresa_Sede.vue')
  },
  {
    path: '/articulo',
    name: 'Articulo',
    component: () => import('../views/Articulo.vue')
  },
  {
    path: '/prueba',
    name: 'Prueba',
    component: () => import('../views/Prueba.vue')
  },
  {
    path: '/recuperarContrasenia/:id',
    name: 'RecuperarContrasenia',
    component: () => import('../views/RecuperarContrasenia.vue'),
    meta: {
      bLibre: true
    }
  },
  {
    path: '/facturacion',
    name: 'Facturacion',
    component: () => import('../views/Ventas/Facturacion.vue'),
    meta:{
      pruebita: true
    }
  },
  {
    path:'/reaperturarCaja',
    name:'ReaperturarCaja',
    component: () => import('../views/ReaperturarCaja.vue')
  },
  {
    path:'/cobranza',
    name:'Cobranza',
    component:() =>import('../views/Cobranza.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes

})

router.beforeEach((to, from, next) => {
  let token = localStorage.getItem('tokenSPA_SistemaVentas');

  //Evalua si es que no necesita autenticacion
  if (to.matched.some((record) => record.meta.bLibre)) {
    //Si se elige la opción cambiar sede del componente logout.
    if (ModLogin.state.bCambiarSede) {
      next();
    } else {
      if (token) {
        next({ name: "Home" })
      } else {
        next()
      }
    }
  } else {
    if (token) {
      next();
    } else {
      next({ name: "Login" })
    }
  }
})

export default router
