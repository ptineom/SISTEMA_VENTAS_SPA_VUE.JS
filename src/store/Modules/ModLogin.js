import decode from 'jwt-decode'
import router from '../../router/index';

const ModLogin = {
    namespaced: true,
    state: {
        usuario_vx: null,
        nameToken_vx: 'tokenSPA_SistemaVentas',
        arrMenuItem_vx: [],
        bCambiarSede_vx: false,
        avatar_vx: '',
        refreshToken_vx: ''
    },
    mutations: {
        SET_USUARIO(state, payload) {
            state.usuario_vx = payload
        }, 
        SET_ARR_MENU_ITEM(state, payload) {
            state.arrMenuItem_vx = payload;
        },
        SET_BCAMBIAR_SEDE(state, payload) {
            state.bCambiarSede_vx = payload;
        },
        SET_AVATAR(state, payload) {
            state.avatar_vx = payload;
        },
        SET_REFRESH_TOKEN(state, payload) {
            state.refreshToken_vx = payload;
        }
    },
    actions: {
        guardarInfo_vx(store, payload) {
            let token = payload.token;
            let avatarB64 = payload.avatarB64;
            let menuItem = payload.menuItem;
            let refreshToken = payload.refreshToken;

            //decodificamos el token
            let decodeToken = decode(token);

            store.commit('SET_USUARIO', decodeToken)
            store.commit("SET_BCAMBIAR_SEDE", false)
            store.commit("SET_AVATAR", avatarB64);
            store.commit("SET_ARR_MENU_ITEM", menuItem.Children);

            //Guardamos el token, avatar, menu, refreshToken en el localstorage
            localStorage.setItem(store.state.nameToken_vx, token)
            localStorage.setItem("avatarB64", avatarB64);
            localStorage.setItem("arrMenuItem", JSON.stringify(menuItem.Children))
            localStorage.setItem("refreshToken", refreshToken)

            //Nos redijiremos al home despues de loguearnos correctamente.
            router.push({ name: "Home" })
        },
        autoLogin_vx(store) {
            //Si ya tenemos un token, solo recuperamos la información.
            let token = localStorage.getItem(store.state.nameToken_vx);
            if (token) {
                let decodeToken = decode(token);
                store.commit("SET_USUARIO", decodeToken);

                if (localStorage.getItem("avatarB64"))
                    store.commit("SET_AVATAR", localStorage.getItem("avatarB64"));

                if (localStorage.getItem("arrMenuItem"))
                    store.commit("SET_ARR_MENU_ITEM", JSON.parse(localStorage.getItem("arrMenuItem")));

                if (localStorage.getItem("refreshToken"))
                    store.commit("SET_REFRESH_TOKEN", localStorage.getItem("refreshToken"));

            }
        },
        cerrarSesion_vx(store) {
            let token = localStorage.getItem(store.state.nameToken_vx);
            if (token) {
                localStorage.removeItem(store.state.nameToken_vx);
                store.commit("SET_USUARIO", null);
                store.commit("SET_ARR_MENU_ITEM", []);

                //Eliminamos el avatar y el menú.
                store.commit("SET_AVATAR", null);
                localStorage.removeItem("avatarB64");
                store.commit("SET_ARR_MENU_ITEM", []);
                localStorage.removeItem("arrMenuItem");
                store.commit("SET_REFRESH_TOKEN", null);
                localStorage.removeItem("refreshToken");

                //Redirección al login.
                router.push({ name: "Login" })
            }
        },
        setBCambiarSede_vx(store, payload) {
            store.commit('SET_BCAMBIAR_SEDE', payload);
        },
        guardarTokens_vx(store, payload) {
            let token = payload.token;
            let refreshToken = payload.refreshToken;

            //AccessToken
            let decodeToken = decode(token);
            store.commit('SET_USUARIO', decodeToken)
            localStorage.setItem(store.state.nameToken_vx, token);

            //RefreshToken
            localStorage.setItem("refreshToken", refreshToken)
        }
    },
    getters: {
        isAuthenticated_vx(state) {
            if (!!state.usuario_vx)
                return true
            else
                return false
        },
        showLayout_vx(state) {
            //Se mostrará el layout siempre que exista un token y no se haya seleccionado cambiar sede del componente logout.
            //Porque cuando es seleccionado la opción cambiar sede se redijirá al route: login
            if (!!state.usuario_vx && !state.bCambiarSede_vx)
                return true;

            return false;
        }
    }
}

export default ModLogin