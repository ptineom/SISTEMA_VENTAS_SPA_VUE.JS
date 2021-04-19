import {rowMarked} from '@/assets/js/Mixins/utilidades'
export default {
    name: "ReaperturarCaja",
    mixins:[rowMarked],
    data() {
        return {
            overlay:false,
            dialog: false,
            showRangoFechas: false,
            fechaRango: this.inicializarRangoFechas(),
            listaCajaApertura: [],
            listaCaja:[],
            listaUsuario:[],
            headersConsulta: [
                { text: "", value: "" },
                { text: "Descripción", value: "nomCaja" },
                { text: "Usuario de caja", value: "nomUsuario" },
                { text: "Fecha apertura", value: "fechaApertura" },
                { text: "Fecha cierre", value: "fechaCierre" },
                { text: "Monto apertura", value: "montoApertura" },
                { text: "Monto total", value: "montoTotal" },
                { text: "Estado", value: "flgCierre" }
            ],
            idUsuario:"",
            idCaja: ""
        }
    },
    methods: {
        inicializarRangoFechas() {
            let fecha1 = this.$dayjs().format("YYYY-MM-DD");
            let fecha2 = this.$dayjs().subtract(700, 'days').format("YYYY-MM-DD");
            return [fecha2, fecha1];
        },
        getColorEstadoCaja(flgCerrado) {
            if (flgCerrado) return 'red'
            else return 'success';
        },
        consultar(){
            let _self = this;

            _self.overlay = true;
            _self.listaCajaApertura = [];

            let parameters = {
                params: {
                    idCaja: _self.idCaja,
                    idUsuario: _self.idUsuario,
                    fechaInicial: _self.$dayjs(_self.fechaRango[0]).format("DD/MM/YYYY"),
                    fechaFinal: _self.$dayjs(_self.fechaRango[1]).format("DD/MM/YYYY")
                },
            };
            _self.$axios
                .get("/api/CajaApertura/GetAllByFilters", parameters)
                .then((response) => {
                    let result = response.data;
                    if (!result.Resultado) {
                        _self.$root.$alertSB(result.Message, {
                            type: "warning"
                        });
                        return;
                    }

                    _self.listaCajaApertura = result.Data.map((x) => {
                        return {
                            nomUsuario: x.NomUsuario,
                            nomCaja: x.NomCaja,
                            fechaApertura: x.FechaApertura,
                            fechaCierre: x.FechaCierre,
                            montoApertura: x.MontoApertura,
                            montoTotal: x.MontoTotal,
                            sgnMoneda: x.SgnMoneda,
                            idUsuario: x.IdUsuario,
                            idCaja: x.IdCaja,
                            correlativo: x.Correlativo,
                            flgReaperturado: x.FlgReaperturado,
                            flgCierre: x.FlgCierre
                        };
                    });
                })
                .catch((error) => {
                    _self.$root.$alertSB(error.response.data.Message, {
                        type: "warning"
                    });
                })
                .finally(() => {
                   _self.overlay = false;
                });
        },
        reaperturarCaja(modelo){
            let _self = this;

            _self.rowSelected(modelo.correlativo);

            let titulo = "Reapertura de caja";
            let pregunta = "¿Desea reaperturar la caja seleccionada?";

            _self.$root.$confirm(titulo, pregunta).then(() => {
                let parameters = {
                    IdCaja: modelo.idCaja,
                    IdUsuario: modelo.idUsuario,
                    Correlativo: modelo.correlativo
                  };
      
                  _self.overlay = true;

                _self.$axios
                  .post("/api/CajaApertura/ReopenBox", parameters)
                  .then((response) => {
                    let data = response.data;

                    if(data.Resultado){
                        _self.$root.$alertSB("Se reaperturó la caja seleccionada exitosamente.", {
                            type: "success",
                          });
                    }
                  }).catch((error) => {
                    _self.$root.$alertSB(error.response.data.Message, {
                      type: "warning",
                    });
                  }).finally(() => {
                    _self.overlay = false;
                  });
            }).catch(()=>{
                _self.rowSelected(modelo.correlativo);
            });
        }
    },
    computed: {
        dateRangeText() {
            //convertirá el array de fechas en una cadena separadas por ' ~ ', con formato "DD/MM/YYYY"
            return `${this.$dayjs(this.fechaRango[0]).format("DD/MM/YYYY")} - ${this.$dayjs(this.fechaRango[1]).format("DD/MM/YYYY")}`
        }
    },
    mounted() {
        let _self = this;
        _self.overlay = true;

        _self.$axios.get('/api/CajaApertura/GetDataQuerys').then((response) => {
            let data = response.data.Data;
            let listaUsuario = data.ListaUsuario;
            let listaCaja = data.ListaCaja;

            listaUsuario.forEach((elem) => {
                _self.listaUsuario.push({
                    text: elem.NomUsuario,
                    value: elem.IdUsuario,
                });
            });

            listaCaja.forEach((elem) => {
                _self.listaCaja.push({
                    text: elem.NomCaja,
                    value: elem.IdCaja,
                });
            });

        }).catch((error) => {
            _self.$root.$alertSB(error.response.data.Message, {
                type: "warning"
            });
        }).finally(() => {
            _self.overlay = false;
        })
    },
}