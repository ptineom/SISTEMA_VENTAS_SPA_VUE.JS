import axios from 'axios'

const ModCajaApertura = {
    namespaced: true,
    state: {
        modeloCajaApertura: null
    },
    mutations: {
        setModeloCajaApertura(state, payload){
            state.modeloCajaApertura = payload;
        }
    },
    actions: {
        verificarEstadoCaja(store, payload) {
            axios.get("/api/CajaApertura/GetStateBox").then((response) => {
                let data = response.data.Data;
                if(data != null){
                    store.dispatch('setModeloCajaApertura', data);
                }
            }).catch((error) => {
                console.error(error.response.data.Message);
            })
        },
        setModeloCajaApertura(store, payload){
            if(payload != null){
                store.commit("setModeloCajaApertura",{
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
                store.commit("setModeloCajaApertura", null);
            }
        }
    }
}

export default ModCajaApertura