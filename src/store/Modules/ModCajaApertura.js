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
                    store.commit("setModeloCajaApertura", {
                        idCaja: data.IdCaja,
                        correlativo: data.Correlativo,
                        fechaApertura: data.FechaApertura,
                        montoApertura: data.MontoApertura,
                        idMoneda: data.IdMoneda,
                        sgnMoneda: data.SgnMoneda,
                        flgReaperturado: data.FlgReaperturado,
                        item: data.Item,
                    });
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
                    sgnMoneda: payload.SgnMoneda
                });
            }else{
                store.commit("setModeloCajaApertura", null);
            }
 
        }
    }
}

export default ModCajaApertura