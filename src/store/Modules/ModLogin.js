import decode from 'jwt-decode'
import router from '../../router/index';

const ModLogin = {
    namespaced: true,
    state: {
        usuario: null,
        nameToken: 'tokenSPA_SistemaVentas',
        arrMenuItem: [],
        bCambiarSede: false,
        avatar: '',
        refreshToken: ''
    },
    mutations: {
        setUsuario(state, payload) {
            state.usuario = payload
        },
        setArrMenuItem(state, payload) {
            state.arrMenuItem = payload;
        },
        setBCambiarSede(state, payload) {
            state.bCambiarSede = payload;
        },
        setAvatar(state, payload) {
            state.avatar = payload;
        },
        setRefreshToken(state, payload) {
            state.refreshToken = payload;
        }
    },
    actions: {
        guardarInfo(store, payload) {
            let token = payload.token;
            let avatarB64 = payload.avatarB64;
            let menuItem = payload.menuItem;
            let refreshToken = payload.refreshToken;

            //decodificamos el token
            let decodeToken = decode(token);

            store.commit('setUsuario', decodeToken)
            store.commit("setBCambiarSede", false)
            store.commit("setAvatar", avatarB64);
            store.commit("setArrMenuItem", menuItem.Children);

            //Guardamos el token, avatar, menu, refreshToken en el localstorage
            localStorage.setItem(store.state.nameToken, token)
            localStorage.setItem("avatarB64", avatarB64);
            localStorage.setItem("arrMenuItem", JSON.stringify(menuItem.Children))
            localStorage.setItem("refreshToken", refreshToken)

            //Nos redijiremos al home despues de loguearnos correctamente.
            router.push({ name: "Home" })
        },
        autoLogin(store) {
            //Si ya tenemos un token, solo recuperamos la información.
            let token = localStorage.getItem(store.state.nameToken);
            if (token) {
                let decodeToken = decode(token);
                store.commit("setUsuario", decodeToken);

                if (localStorage.getItem("avatarB64"))
                    store.commit("setAvatar", localStorage.getItem("avatarB64"));

                if (localStorage.getItem("arrMenuItem"))
                    store.commit("setArrMenuItem", JSON.parse(localStorage.getItem("arrMenuItem")));

                if (localStorage.getItem("refreshToken"))
                    store.commit("setRefreshToken", localStorage.getItem("refreshToken"));

            }
        },
        cerrarSesion(store) {
            let token = localStorage.getItem(store.state.nameToken);
            if (token) {
                localStorage.removeItem(store.state.nameToken);
                store.commit("setUsuario", null);
                store.commit("setArrMenuItem", []);

                //Eliminamos el avatar y el menú.
                store.commit("setAvatar", null);
                localStorage.removeItem("avatarB64");
                store.commit("setArrMenuItem", []);
                localStorage.removeItem("arrMenuItem");
                store.commit("setRefreshToken", null);
                localStorage.removeItem("refreshToken");

                //Redirección al login.
                router.push({ name: "Login" })
            }
        },
        setBCambiarSede(store, payload) {
            store.commit('setBCambiarSede', payload);
        },
        guardarTokens(store, payload) {
            let token = payload.token;
            let refreshToken = payload.refreshToken;

            //AccessToken
            let decodeToken = decode(token);
            store.commit('setUsuario', decodeToken)
            localStorage.setItem(store.state.nameToken, token);

            //RefreshToken
            localStorage.setItem("refreshToken", refreshToken)
        }
    },
    getters: {
        isAuthenticated(state) {
            if (!!state.usuario)
                return true
            else
                return false
        },
        showLayout(state) {
            //Se mostrará el layout siempre que exista un token y no se haya seleccionado cambiar sede del componente logout.
            //Porque cuando es seleccionado la opción cambiar sede se redijirá al route: login
            if (!!state.usuario && !state.bCambiarSede)
                return true;

            return false;
        }
    }
}

export default ModLogin