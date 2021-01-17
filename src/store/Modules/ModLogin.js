import decode from 'jwt-decode'
import router from '../../router/index';

const ModLogin = {
    namespaced: true,
    state: {
        token: null,
        usuario: null,
        nameToken: 'tokenSPA_SistemaVentas',
        arrMenuItem: [],
        bCambiarSede: false,
        avatar:'',
        refreshToken: ''
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
        setUsuario(state, usuario) {
            state.usuario = usuario
        },
        setArrMenuItem(state, arr) {
            state.arrMenuItem = arr;
        },
        setBCambiarSede(state, payload) {
            state.bCambiarSede = payload;
        },
        setAvatar(state, payload){
            state.avatar = payload;
        },
        setRefreshToken(state, payload){
            state.refreshToken = payload;
        }
    },
    actions: {
        guardarToken(store, token) {
            let decodeToken = decode(token);
            store.commit('setToken', token);
            store.commit('setUsuario', decodeToken)
            localStorage.setItem(store.state.nameToken, token)

            store.commit("setBCambiarSede", false)
            router.push({ name: "Home" })
 
        },
        autoLogin(store) {
            //Si ya tenemos un token, solo recuepramos la información.
            let token = localStorage.getItem(store.state.nameToken);
            if (token) {
                let decodeToken = decode(token);
                store.commit("setToken", token);
                store.commit("setUsuario", decodeToken);


                if(localStorage.getItem("avatarB64")){
                    store.commit("setAvatar", localStorage.getItem("avatarB64"));
                }
                if(localStorage.getItem("arrMenuItem")){
                    store.commit("setArrMenuItem", JSON.parse(localStorage.getItem("arrMenuItem")));
                }
                if(localStorage.getItem("refreshToken")){
                    store.commit("setRefreshToken", localStorage.getItem("refreshToken"));
                }
            }
        },
        cerrarSesion(store) {
            let token = localStorage.getItem(store.state.nameToken);
            if (token) {
                localStorage.removeItem(store.state.nameToken);
                store.commit("setToken", null);
                store.commit("setUsuario", null);
                store.commit("setArrMenuItem", []);

                //Eliminamos el avatar y le menú.
                store.commit("setAvatar", null);
                localStorage.removeItem("avatarB64");
                store.commit("setArrMenuItem", []);
                localStorage.removeItem("arrMenuItem");
                store.commit("setRefreshToken", null);
                localStorage.removeItem("refreshToken");
                router.push({ name: "Login" })
            }
        },
        setBCambiarSede(store, payload) {
            store.commit('setBCambiarSede', payload);
        },
        saveAvatar(store, payload){
            store.commit("setAvatar", payload);
            localStorage.setItem("avatarB64", payload);
        },
        saveArrMenuItem(store, payload){
            //Obtenemos las lista de menu.
            let menuItem = payload;
            store.commit("setArrMenuItem", menuItem.children);
            localStorage.setItem("arrMenuItem", JSON.stringify(menuItem.children))
        },
        saveAccessToken(store,payload){
            let decodeToken = decode(payload);
            store.commit('setToken', payload);
            store.commit('setUsuario', decodeToken)
            localStorage.setItem(store.state.nameToken, payload)
        },
        saveRefreshToken(store, payload){
            localStorage.setItem("refreshToken", payload)
        }
    },
    getters: {
        isAuthenticated(state) {
            return !!state.token
        },
        showLayout(state){
            //Se mostrará el layout siempre que exista un token y no se haya seleccionado cambiar sede del componente logout.
            //Porque cuando es seleccionado la opción cambiar sede se redijirá al route: login
            if(!!state.token && !state.bCambiarSede){
                return true;
            }
            return false;
        }
    }
}

export default ModLogin