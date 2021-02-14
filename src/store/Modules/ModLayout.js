import router from '../../router/index'
const ModLayout = {
    namespaced: true,
    state: {
        headerForm: {
            breadcrumbs: [{ 'text': 'Home', disabled: false }],
            titleForm: 'Home',
            iconForm: 'mdi-home',
            flgHome: true,
            subtitleForm: ''
        },
        bDialogoCambiarContrasenia: false
    },
    mutations: {
        setHeaderForm(state, payload) {
            state.headerForm = payload;
        },
        setDialogoCambiarContrasenia(state, payload){
            state.bDialogoCambiarContrasenia = payload;
        }
    },
    actions: {
        setHeaderForm(store, payload) {
            store.commit('setHeaderForm', payload);
        },
        abrirDialogoCambiarContrasenia(store, payload) {
            store.commit('setDialogoCambiarContrasenia', payload);
        }
    }
}
export default ModLayout