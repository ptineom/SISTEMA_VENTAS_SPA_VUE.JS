import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import vuetify from './plugins/vuetify';

import axios from 'axios';
import moment from 'moment';
import pluginsUtilidades from './plugins/utilidades'


//import axios from './plugins/axios'
Vue.config.productionTip = false

//Configurando alguna propiedades par la inicialización de axios.
axios.defaults.baseURL = "http://localhost:53568/"
axios.defaults.headers.common["Accept"] = "application/json";
// axios.defaults.headers.post["content-type"] = "application/x-www-form-urlencoded";

//Interceptores de axios
axios.interceptors.request.use(function (config) {
  if (!!localStorage.getItem("tokenSPA_SistemaVentas")) {
    config.headers.common["Authorization"] = "Bearer " + localStorage.getItem("tokenSPA_SistemaVentas");
  }

  return config;
}, function (error) {
  return Promise.reject(error);
})

axios.interceptors.response.use(function (config) {
  return config;
}, function (error) {
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }
  let originalRequest = error.config;
  let url = originalRequest.url;
  let urlRefreshToken = "/api/Login/generarTokenWithRefreshTokenAsync";

  //Si el error es unauthorized
  //Si el error viene despues de haber querido generar un nuevo accesToken con el refreshToken
  if (url == urlRefreshToken) {
    return Promise.reject(error);
  }

  // Si _retry es diferente a true, generará el refrescará el token.
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    //Generamos un nuevo accessToken con el refreshToken
    let parameters = {
      idRefreshToken: localStorage.getItem("refreshToken")
    }
    axios.post(urlRefreshToken, parameters).then((response) => {
      //Lo almacenamos con vuex y localstorage
      store.dispatch("ModLogin/guardarTokens", new {
        token: response.data.token,
        refreshToken: response.data.refreshToken
      });

      originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
      return axios.request(originalRequest);

      //return axios(originalRequest);

      //
      // return new Promise((resolve, reject) => {
      //   axios.request(originalRequest).then(response => {
      //     debugger;
      //     resolve(response);
      //   }).catch((error) => {
      //     reject(error);
      //   })
      // });

    }).catch((error) => {
      // alert("Su sesión ha terminado. Inicie sesíon nuevamente si desea continuar.");
      Promise.reject(error);
    })
  }
  // debugger;
  // return Promise.reject(error);
})

//Agregando valores globales para poder usarse en toda la app.
Vue.prototype.$appName = "Sistemas de ventas y compras";
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;

//Agregando plugin de utilidades.
Vue.use(pluginsUtilidades);
// Vue.use(axios);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
