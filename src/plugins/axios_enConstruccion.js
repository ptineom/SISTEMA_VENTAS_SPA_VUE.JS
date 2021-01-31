import axios from 'axios'
import ModLogin from '@/store/Modules/ModLogin';

axios.defaults.baseURL = "http://localhost:51691/"
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["content-type"] = "application/x-www-form-urlencoded";

axios.interceptors.request.use((config) => {

})

axios.interceptors.response.use((config) => {
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
    alert("error en el interceptor");
    let originalRequest = error.config;
    let url = originalRequest.url;
    let urlRefreshToken = "/api/Login/generarTokenWithRefreshTokenAsync";
    //Si el error es unauthorized
    if (error.response.status == 401) {
        //Si el error viene despues de haber querido generar un nuevo accesToken con el refreshToken
        if (url == urlRefreshToken) {
            return Promise.reject(error);
        }

        if (!originalRequest._retry) {
            originalRequest._retry = true;
            //Generamos un nuevo accessToken con el refreshToken
            let usuario = ModLogin.state.usuario;
            let parameters = {
                idRefreshToken: localStorage.getItem("refreshToken"),
                idUsuario: usuario.idUsuario,
                nomUsuario: usuario.fullName,
                nomRol: usuario["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                idSucursal: usuario.idSucursal,
                nomSucursal: usuario.nomSucursal,
                flgCtrlTotal: usuario.flgCtrlTotal
            }
            axios.post(urlRefreshToken, parameters).then((response) => {
                store.dispatch("ModLogin/saveAccessToken", response.data.token);
                store.dispatch("ModLogin/saveRefreshToken", response.data.refreshToken);

                originalRequest.headers['Authorization'] = "Bearer " + response.data.token;
                return axios.request(originalRequest);

                // originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
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
    }
    return Promise.reject(error);
})

export default axios