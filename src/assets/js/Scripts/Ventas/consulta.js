import AlertSB from "@/components/Utilitarios/AlertSB";
import DlgBuscarCliente from '@/components/Dialogos/DlgBuscarCliente'
export default {
    components: {
        AlertSB,
        DlgBuscarCliente
    },
    data() {
        return {
            dialog: false,
            bDialogBuscarCliente:false,
            cliente: {
                idTipoDocumento: "",
                nroDocumento: "",
                idCliente: "",
                nomCliente: "",
            },
            comprobante: {
                idTipoComprobante: "",
                nroSerie: "",
                nroDocumento: "",
            },
            fechaInicial: "",
            fechaFinal: "",
            tipoFiltro: "rangoFechas",
            // fechaRango: this.inicializarRango(),
            fechaRango: ['2019-01-01','2020-11-30'],
            showRangoFechas: false,
            idEstado: 0,
            listadoVentas: [],
            headersConsulta: [
                { text: "", value: "seleccionar", align: "center" },
                { text: "Comprobante", value: "comprobante", align: "center" },
                { text: "Doc. cliente", value: "docCliente", align: "center" },
                { text: "Cliente", value: "nomCliente", align: "center" },
                { text: "Total", value: "totVenta", align: "center" },
                { text: "Fecha", value: "fecDocumento", align: "center" },
                { text: "Forma pago", value: "nomTipoCondicionPago", align: "center" },
                { text: "Estado", value: "nomEstado", align: "center" },
                { text: "Enviar", value: "email", align: "center" },
            ],
            resolve: null,
            reject: null
        };
    },
    watch: {
        tipoFiltro(newValue, oldValue) {
            let _self = this;
            _self.listadoVentas = [];
            switch (oldValue) {
                case "cliente":
                    _self.cliente.idTipoDocumento = '';
                    _self.cliente.nroDocumento = '';
                    break;
                case "comprobante":
                    _self.comprobante.idTipoComprobante = '';
                    _self.comprobante.nroSerie = '';
                    _self.comprobante.nroDocumento = '';
                    break
            }
        },
    },
    methods: {
        show(){
            this.dialog = true;
            return new Promise((resolve, reject)=>{
                this.resolve = resolve;
                this.reject = reject;
            })
        },
        obtenerVentaPorCodigo(item){
            this.resolve(item);
            this.dialog = false;
        },
        salir(){
            this.dialog = false;
            this.reject();
        },
        obtenerCliente(item) {
            this.cliente = {
                idCliente: item.idCliente,
                nomCliente: item.nomCliente,
                idTipoDocumento: item.idTipoDocumento,
                nroDocumento: item.nroDocumento
            }
        },
        obtenerClientePorDocumento() {
            let cliente = this.cliente;
            if (cliente.idTipoDocumento=="") {
                this.$refs.alerta.show("Debe de seleccionar el tipo de documento del cliente", {
                    absolute: true,
                    color: "warning",
                });
                return;
            }
            if (cliente.nroDocumento == "") {
                this.$refs.alerta.show("Debe de ingresar el número de documento del cliente", {
                    absolute: true,
                    color: "warning",
                });
                return;
            }
            let _self = this;
            this.overlayCliente = true;
            let parameteres = `${_self.cliente.idTipoDocumento}/${_self.cliente.nroDocumento}`;
            this.$axios.get("/api/Cliente/obtenerClientePorDocumentoAsync/" + parameteres).then((response) => {
                let data = response.data.data;
                Object.assign(_self.cliente, {
                    idCliente: data.idCliente,
                    nomCliente: data.nomCliente
                })
            }).catch((error) => {
                _self.$refs.alerta.show(error.response.data.Message, { color: "error", absolute: true })
            }).finally(() => {
                _self.overlayCliente = false;
            })
        },
        inicializarRango() {
            let fecha1 = this.$moment(new Date()).format("YYYY-MM-DD");
            let fecha2 = this.$moment(new Date()).subtract(7, 'days').format("YYYY-MM-DD");
            return [fecha2, fecha1];
        },
        getMaxDigitos() {
            let obj = this.arrDocumentos.find((x) => x.value == this.cliente.idTipoDocumento);
            return obj != undefined ? obj.maxDigitos : 25
        },
        seleccionarDocumento() {
            this.cliente.nroDocumento = "";
            this.cliente.nomCliente = "";
            this.$refs.txtNroDocumento.focus();
        },
        consultarVentas() {
            let _self = this;

            if (_self.tipoFiltro == "cliente") {
                if (_self.cliente.idTipoDocumento == '') {
                    _self.$refs.alerta.show("Debe de seleccionar el tipo de documento del cliente", {
                        absolute: true,
                        color: "warning",
                    });
                    return;
                }
                if (_self.cliente.nroDocumento == '') {
                    _self.$refs.alerta.show("Debe de ingresar el número de documento del cliente", {
                        absolute: true,
                        color: "warning",
                    });
                    return;
                }
                if (_self.cliente.idCliente == '') {
                    _self.$refs.alerta.show("No ha seleccionado ningún cliente", {
                        absolute: true,
                        color: "warning",
                    });
                    return;
                }
            } else if (_self.tipoFiltro == "comprobante") {
                if(_self.comprobante.idTipoComprobante == '' && _self.comprobante.nroSerie == '' && _self.comprobante.nroDocumento == '' ){
                    _self.$refs.alerta.show("Debe de seleccionar al menos algún parámetro para la búsqueda por comprobante.", {
                        absolute: true,
                        color: "warning",
                    });
                    return;
                }
            }
            let fechaInicial = _self.fechaRango[0];
            let fechaFinal = _self.fechaRango[1];
            if (_self.$moment(fechaInicial).isAfter(fechaFinal)) {
                _self.$refs.alerta.show("La fecha inicial no puede ser mayor a la fecha final", {
                    absolute: true,
                    color: "warning",
                });
                return;
            }
            _self.overlay = true;
            _self.listadoVentas = [];

            let parameters = {
                params: {
                    idCliente: _self.cliente.idCliente,
                    idTipoComprobante: _self.comprobante.idTipoComprobante,
                    nroSerie: _self.comprobante.nroSerie,
                    nroDocumento: _self.comprobante.nroDocumento == "" ? 0 : _self.comprobante.nroDocumento,
                    fechaInicio: _self.$moment(_self.fechaRango[0]).format("DD/MM/YYYY"),
                    fechaFinal: _self.$moment(_self.fechaRango[1]).format("DD/MM/YYYY"),
                    idEstado: _self.idEstado
                },
            };
            _self.$axios
                .get("/api/Venta/listaVentasAsync", parameters)
                .then((response) => {
                    let result = response.data;
                    if (!result.bResultado) {
                        _self.$refs.alerta.show(result.sMensaje, {
                            absolute: true,
                            color: "warning",
                        });
                        return;
                    }

                    _self.listadoVentas = result.data;
                })
                .catch((error) => {
                    let data = error.response.data;
                    _self.$refs.alerta.show(data.Message, {
                        absolute: true,
                        color: "warning",
                    });
                })
                .finally(() => {
                    _self.overlay = false;
                });
        },
        getColorEstado(estDocumento) {
            if (estDocumento == 1) return 'green'
            else if (estDocumento == 3) return 'red'
        },
        getColorFormaPago(flgEvaluaCredito) {
            if (flgEvaluaCredito) return 'warning'
            else return 'primary';
        },
    },
    props: ["value", "arrComprobantes", "arrDocumentos", "arrEstados"],
    computed: {
        dateRangeText() {
            //convertirá el array de fechas en una cadena separadas por ' ~ ', con formato "DD/MM/YYYY"
            return `${this.$moment(this.fechaRango[0]).format("DD/MM/YYYY")} - ${this.$moment(this.fechaRango[1]).format("DD/MM/YYYY")}`
        }
    },
    mounted() {
        this.idEstado = 1;
        let _self = this;
        window.addEventListener('keydown', (e)=>{
            if(!_self.dialog)return;

            if (e.defaultPrevented)return;

            var handled = false;

            if(e.key!=undefined){
                if(e.key=='Escape'){
                    _self.salir();
                }
            }
        })
    },

};