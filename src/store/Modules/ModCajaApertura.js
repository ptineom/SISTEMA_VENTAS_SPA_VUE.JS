import axios from 'axios'

const ModCajaApertura = {
    namespaced: true,
    state: {
        modeloCajaApertura_vx: null
    },
    mutations: {
        SET_MODELO_CAJA_APERTURA(state, payload){
            state.modeloCajaApertura_vx = payload;
        }
    },
    actions: {
        verificarEstadoCaja_vx(store, payload) {
            axios.get("/api/CajaApertura/GetStateBox").then((response) => {
                let data = response.data.Data;
                if(data != null){
                    store.dispatch('setModeloCajaApertura_vx', data);
                }
            }).catch((error) => {
                console.error(error.response.data.Message);
            })
        },
        setModeloCajaApertura_vx(store, payload){
            if(payload != null){
                store.commit("SET_MODELO_CAJA_APERTURA",{
                    idCaja: payload.IdCaja,
                    correlativo: payload.Correlativo,
                    fechaApertura: payload.FechaApertura,
                    montoApertura: payload.MontoApertura,
                    idMoneda: payload.IdMoneda,
                    sgnMoneda: payload.SgnMoneda,
                    flgReaperturado: payload.FlgReaperturado,
                    item: payload.Item,
                    nomCaja: payload.NomCaja,
                    flgCierreDiferido: payload.FlgCierreDiferido == undefined ? false: payload.FlgCierreDiferido,
                    fechaCierre: payload.FechaCierre == undefined ? null: payload.FechaCierre,
                    horaCierre: payload.HoraCierre == undefined ? '': payload.HoraCierre
                });
            }else{
                store.commit("SET_MODELO_CAJA_APERTURA", null);
            }
        }
    },
    getters:{
        cajaAbierta_vx(state){
            if (state.modeloCajaApertura_vx != null) return true;
            else return false;
        }
    }
}

export default ModCajaApertura