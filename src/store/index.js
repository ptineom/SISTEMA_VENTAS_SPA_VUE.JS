import Vue from 'vue'
import Vuex from 'vuex'

import ModLogin from '../store/Modules/ModLogin.js'
import ModLayout from '../store/Modules/ModLayout.js'
import ModCajaApertura from '../store/Modules/ModCajaApertura.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  getters: {
  },
  modules: {
    ModLogin,
    ModLayout,
    ModCajaApertura
  }
})
