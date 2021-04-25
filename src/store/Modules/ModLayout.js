/*headerForm_vx: Se almacenará los datos de la opcion del menú clicleado*/
const ModLayout = {
    namespaced: true,
    state: {
        headerForm_vx: {
            breadcrumbs: [{ 'text': 'Home', disabled: false }],
            titleForm: 'Home',
            iconForm: 'mdi-home',
            flgHome: true,
            subtitleForm: ''
        },
        bDialogoCambiarContrasenia_vx: false
    },
    mutations: {
        SET_HEADER_FORM(state, payload) {
            state.headerForm_vx = payload;
        },
        SET_DIALOGO_CAMBIAR_CONTRASENIA(state, payload){
            state.bDialogoCambiarContrasenia = payload;
        }
    },
    actions: {
        setHeaderForm_vx(store, payload) {
            store.commit('SET_HEADER_FORM', payload);
        },
        setAbrirDialogoCambiarContrasenia_vx(store, payload) {
            store.commit('SET_DIALOGO_CAMBIAR_CONTRASENIA', payload);
        }
    }
}
export default ModLayout