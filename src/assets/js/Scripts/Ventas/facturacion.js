import DlgBuscarCliente from '@/components/Dialogos/DlgBuscarCliente'
import DlgRegistrarCliente from '@/components/Dialogos/DlgCliente'
import DlgBuscarArticulo from '@/components/Dialogos/DlgBuscarArticulo'
import Registro from '@/views/Compras/Registro'
import DlgAbonarCredito from '@/components/Dialogos/DlgAbonarCredito'
import DlgPago from '@/views/Ventas/DlgPago'
import Consulta from '@/views/Ventas/Consulta'
import CurrencyInput from '@/components/Utilitarios/CurrencyInput'

export default {
    name: "Facturacion",
    components: {
        DlgBuscarCliente,
        DlgRegistrarCliente,
        DlgBuscarArticulo,
        Registro,
        DlgAbonarCredito,
        DlgPago,
        Consulta,
        CurrencyInput
    },
    data() {
        return {
            maxlengthDocumento: 25,
            fieldSearchBarcode: '',
            bDialogBuscarCliente: false,
            bDialogBuscarArticulo: false,
            bDialogBuscarVenta: false,
            modelo: {
                idTipoComprobante: '',
                idMoneda: '',
                abono: 0,
                saldo: 0,
                idTipoPago: 'EFE',
                idTipoCondicionPago: this.inicializarFormapago(),
                observacion: '',
                fechaEmision: this.getFechaActual(),
                horaEmision: null,
                fechaVencimiento: this.getFechaActual(),
            },
            cliente: {
                idTipoDocumento: '',
                nroDocumento: '',
                idCliente: '',
                nomCliente: '',
            },
            arrComprobantes: [],
            arrDocumentos: [],
            arrMonedas: [],
            arrTipoPagos: [],
            arrFormapagos: [],
            arrEstados: [],
            arrDocumentosConsulta: [],
            arrDepartamentos:[],
            fecEmiFormatted: this.$dayjs(this.getFechaActual()).format("DD/MM/YYYY"),
            fecVenFormatted: this.$dayjs(this.getFechaActual()).format("DD/MM/YYYY"),
            showFecEmi: false,
            showHorEmi: false,
            showFecVen: false,
            chkHorEmi: false,
            headersDetalle: [
                { text: "Cód.Barra/Id", value: "codigo", align: "center", sortable: false },
                { text: "Descripción", value: "descripcion", width: "380px", align: "center", sortable: false },
                { text: "U.M.", value: "unidadMedida", align: "center", sortable: false, width: "120px" },
                { text: "Factor", value: "factor", align: "center", sortable: false },
                { text: "P. Unitario", value: "precioUnitario", width: "120px", align: "center", sortable: false },
                { text: "Cantidad", value: "cantidad", width: "120px", align: "center", sortable: false },
                { text: "Desc.%", value: "descuento1", width: "105px", align: "center", sortable: false },
                { text: "Importe", value: "importe", align: "center", sortable: false, width: "140px" },
                { text: "Opciones", value: "opciones", align: "center", sortable: false }
            ],
            detalle: [],
            overlay: false,
            overlayCliente: false,
            totales: {
                subTotal: 0,
                tasaDscto: 0,
                totalDescuento: 0,
                totalIgv: 0,
                total: 0,
                redondeo: 0,
                totalPagar: 0
            },
            empresa: {},
            showPanelCredito: false,
            estadoTab: "mantenimiento",
            bSeleccionarComprobante: false
        }
    },
    watch: {
        chkHorEmi(newValue) {
            if (newValue) {
                this.showHorEmi = true;
            } else {
                this.modelo.horaEmision = null;
            }
        },
        showHorEmi(newValue) {
            if (!newValue && this.modelo.horaEmision == null) {
                this.chkHorEmi = false;
            }
        },
        "modelo.fechaEmision"(val) {
            this.fecEmiFormatted = this.$dayjs(val).format("DD/MM/YYYY");

            if(this.$dayjs(this.modelo.fechaVencimiento).isBefore(this.modelo.fechaEmision)){
                this.modelo.fechaVencimiento = this.modelo.fechaEmision;
            }
        },
        "modelo.fechaVencimiento"(val) {
            this.fecVenFormatted = this.$dayjs(val).format("DD/MM/YYYY")
        },
        "totales.tasaDscto"() {
            this.calcularTotales();
        },
        "totales.total"(val) {
            if (val == 0)
                this.totales.tasaDscto = 0;

            //Si esta marcado como credito, se limpiará el panel de crédito.
            if (this.modelo.idTipoCondicionPago != "" && this.evaluaCredito()) {
                this.modelo.idTipoCondicionPago = this.inicializarFormapago();
                this.showPanelCredito = false;
            }
        },
        showPanelCredito(val) {
            if (!val) {
                this.modelo.abono = 0;
                this.modelo.saldo = 0;
                this.modelo.fechaVencimiento = this.$dayjs(new Date()).format("YYYY-MM-DD");
            }
        }
    },
    computed: {
        totalPagarFormateado() {
            return `${this.getMoneda()} ${this.$formatoMiles(this.totales.totalPagar, 2)}`
        },
        getMaxDigitos() {
            let obj = this.arrDocumentos.find((x) => x.value == this.cliente.idTipoDocumento);
            return obj != undefined ? obj.maxDigitos : 25
        }
    },
    methods: {
        abrirDlgRegistrarCliente(){
            let _self = this;

            _self.$refs.dlgRegistrarCliente.show().then((response)=>{
                _self.obtenerCliente(response);
            }).catch((error)=>{
                
            })
        },
        obtenerCliente(item) {
            this.cliente = {
                idCliente: item.idCliente,
                nomCliente: this.$capitalize(item.nomCliente),
                idTipoDocumento: item.idTipoDocumento,
                nroDocumento: item.nroDocumento
            };

            //Si el el tipo doc. del cliente(consulta, registro) seleccionado esta desabilitado en el combo tipo doc.
            //de ventas, habilitamos todos los documento y limpiamos el comprobante.
            let disabled = this.arrDocumentos.find(x => x.value == item.idTipoDocumento).disabled;
            if(disabled){
                this.arrDocumentos.forEach(y=> y.disabled=false);
                this.modelo.idTipoComprobante = "";
            }
        },
        getFechaActual: function () {
            return this.$dayjs(new Date()).format("YYYY-MM-DD");
        },
        getHoraActual() {
            return this.$dayjs(new Date()).format("HH:mm");
        },
        getIgv: function () {
            return (this.empresa.Igv / 100);
        },
        getMoneda: function () {
            return this.arrMonedas.length > 0 ? this.arrMonedas.find(x => x.flgLocal).sgnMoneda : '';
        },
        quitarItem(idArticulo) {
            let index = this.detalle.findIndex(x => x.idArticulo == idArticulo);
            //Quitar fila de la grilla
            this.detalle.splice(index, 1);
            this.calcularTotales();
        },
        allowedDatesFechaEmision(val) {
            //Solo se habilitarán fechas menor o igual a la fecha actual.
            return this.$dayjs(val).isSameOrBefore(new Date());
        },
        allowedDatesFechaVencimiento(val) {
            //Solo se habilitarán fechas mayor o igual a la fecha de emisión.
            return this.$dayjs(val).isSameOrAfter(this.$dayjs(this.modelo.fechaEmision));
        },
        parseDate(date) {
            if (!date) return null
            const [day, month, year] = date.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        },
        documentosXComprobante() {
            let _self = this;
            let cboTipDoc = _self.$refs.cboTipDoc;

            if (this.modelo.idTipoComprobante == "") return;

            let nomTipoComprobante = _self.arrComprobantes.find(x => x.value == _self.modelo.idTipoComprobante).text;

            //Si selecciona FACTURA y el documento no es ruc
            if (nomTipoComprobante.slice(0, 3).toUpperCase() == "FAC" && !!_self.cliente.idTipoDocumento) {
                let flgRuc = _self.arrDocumentos.find(x => x.value == _self.cliente.idTipoDocumento).flgRuc;
                if (!flgRuc)
                    _self.limpiarCliente();
            }

            //Habilitamos solo los documentos según el comprobante seleccionado.
            _self.arrDocumentos.forEach((elem) => {

                elem.disabled = true;
                //Si es factura entonces se habilitaran solo los documento con el flagRuc.
                if (nomTipoComprobante.slice(0, 3).toUpperCase() == "FAC") {
                    if (elem.flgRuc) {
                        elem.disabled = false;
                        _self.cliente.idTipoDocumento = elem.value;
                    }
                } else {
                    elem.disabled = false;
                }
            });

            cboTipDoc.focus();
        },
        limpiarCliente() {
            this.cliente = Object.assign(this.cliente, {
                idTipoDocumento: '',
                idCliente: '',
                nomCliente: '',
                nroDocumento: ''
            });
        },
        seleccionarTipoDocumento(idTipoDocumento) {
            this.cliente = Object.assign(this.cliente, {
                idCliente: '',
                nomCliente: '',
                nroDocumento: ''
            });

            this.$refs.txtNroDoc.focus();
        },
        obtenerClientePorDocumento() {
            let cliente = this.cliente;
            if (!(!!cliente.idTipoDocumento)) {
                this.$root.$alertSB(`Debe de seleccionar un tipo de documento`, { type: "warning" });
                return;
            }

            if (!(!!cliente.nroDocumento)) {
                let nomTipoDocumento = this.arrDocumentos.find(x => x.value == cliente.idTipoDocumento).text;
                this.$root.$alertSB(`Debe de ingresar el ${nomTipoDocumento}`, { type: "warning" });
                return;
            }
            
            let _self = this;
            this.overlayCliente = true;
            let parameteres = `${_self.cliente.idTipoDocumento}/${_self.cliente.nroDocumento}`;
            
            this.$axios.get("/api/Cliente/GetByDocument/" + parameteres).then((response) => {
                let data = response.data.Data;

                Object.assign(_self.cliente, {
                    idCliente: data.IdCliente,
                    nomCliente: data.NomCliente
                })
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
            }).finally(() => {
                _self.overlayCliente = false;
            })
        },
        validarIngreso(_dscto) {
            let dscto = 0;
            if (!!_dscto) {
                //Esto es solo porque a veces estando el numero 100 y apretamos una tecla numerica
                if (_dscto.length == 4) {
                    _dscto = _dscto.slice(0, 3);
                } else {
                    if (_dscto > 100)
                        _dscto = _dscto.slice(0, 2);
                }
                dscto = _dscto;
            }
            //Cuando se va actualizar al mismo control que estas editando deberas hacer un nextTick
            this.$nextTick(function () {
                this.totales.tasaDscto = dscto == 0 ? '' : dscto;
            })
        },
        calcularTotales() {
            let subTotal = 0, cuotaDscto = 0, cuotaIgv = 0, total = 0, totalPagar = 0, decimalRestara = 0, bruto = 0;
            let igv = this.getIgv();

            //Realizamos la suma total del campo importe del detalle.
            let sumTotal = this.detalle.reduce((accumulator, current) => accumulator + current.importe, 0);

            if (sumTotal > 0) {
                //Para un cálculo mas perfecto se redondeará el subtotal en 2 decimales
                subTotal = parseFloat((sumTotal / (1 + igv)).toFixed(2));

                if (this.totales.tasaDscto > 0) {
                    cuotaDscto = (subTotal * (this.totales.tasaDscto / 100));
                    bruto = (subTotal - cuotaDscto);
                    cuotaIgv = (bruto * igv);
                    total = (bruto + cuotaIgv);
                } else {
                    cuotaIgv = (subTotal * igv);
                    total = sumTotal;
                }

                totalPagar = ((parseInt(total.toFixed(2) * 10)) / 10);
                decimalRestara = (total.toFixed(2) - totalPagar).toFixed(2);
            }

            this.totales = {
                subTotal: subTotal,
                tasaDscto: this.totales.tasaDscto,
                totalDescuento: cuotaDscto,
                totalIgv: cuotaIgv,
                total: total,
                redondeo: decimalRestara > 0 ? (decimalRestara * (-1)) : 0,
                totalPagar: totalPagar
            }

        },
        editColumn: function (item, indexColumn, indexRow) {
            //let importe = parseFloat(item.importe.toString().replace(/,/g, ''));
            let precioXFactorXCan = 0, igv = this.getIgv();

            //Al modificar el importe, se calculará el descuento.
            if (indexColumn == 7) {
                precioXFactorXCan = item.precioBase * (item.nroFactor * item.cantidad);
                //Quitamos el IGV del importe. Dejamos como importe bruto.
                let montoBrutoConDscto = (item.importe / (1 + igv));
                //Fórmula para hallar la diferencia, para luego convertirlo en porcentaje.
                let dif = (precioXFactorXCan - montoBrutoConDscto);
                let porc = ((dif / precioXFactorXCan) * 100).toFixed(2);
                item.descuento1 = porc;
            } else {
                //Seleccionar UM.
                if (indexColumn == 2) {
                    let modeloUm = item.listaUm.find((x) => (x.value == item.idUm));
                    item.nroFactor = modeloUm.nroFactor;
                    item.descuento1 = modeloUm.descuento1;
                    item.cantidad = 1;

                    this.$refs.cantidad_x[indexRow].focus();
                }
                precioXFactorXCan = item.precioBase * (item.nroFactor * item.cantidad);

                let precioBruto = precioXFactorXCan - (precioXFactorXCan * (item.descuento1 / 100));
                item.importe = parseFloat((precioBruto + (precioBruto * igv)).toFixed(2));
            }
            //Calcular totales
            this.calcularTotales();
        },
        getArticuloModal(item){
            let modelo = {
                idArticulo: item.idArticulo,
                descripcion: item.nomArticulo,
                idUm: item.idUm,
                nroFactor: item.nroFactor,
                precioUnitario: this.$formatoMiles(item.precioVenta, 2),
                cantidad: 1,
                descuento1: item.descuento1,
                importe: item.precioVentaFinal,
                listaUm: item.listaUm.map((x) => {
                    return {
                        text: x.nomUm,
                        value: x.idUm,
                        descuento1: x.descuento1,
                        nroFactor: x.nroFactor,
                        precioVenta: x.precioVenta,
                        precioVentaFinal: x.precioVentaFinal
                    }
                }),
                precioBase: item.precioBase,
                codigo: item.codigo
            }
            this.agregarArticulo(modelo);
        },
        agregarArticulo(item) {
            this.detalle.push(item);
            this.calcularTotales();
        },
        buscarXcodigoBarra() {
            let value = this.fieldSearchBarcode;
            if (!(!!value)) {
                this.$root.$alertSB("Debe de ingresar el código de barra", {
                    type: "warning",
                });
                return;
            }

            //Validar que aún no se haya ingresado al detalle.
            if (this.detalle.length > 0) {

                let index = this.detalle.findIndex(
                    (x) => x.codigo == value
                );

                if (index != -1) {
                    this.$root.$alertSB("Código de barra ya ingresado", {
                        type: "warning",
                        timeout: 3000,
                    });
                    return;
                }
            }
            let _self = this;
            let parameters = {
                params: {
                    tipoFiltro: '',
                    filtro: value,
                    accion: 'Bar'
                }
            };

            this.$axios.get("/api/Articulo/GetAllByFiltersHelper", parameters).then((response) => {

                let result = response.data;
                if (!result.Resultado) {
                    _self.$refs.alerta.show(result.Mensaje, {
                        type: "warning",
                    });
                    return;
                }
                //Agregamos el artículo encontrado al detalle.
                let item = result.Data[0];
                let modelo = {
                    idArticulo: item.IdArticulo,
                    descripcion: item.NomArticulo,
                    idUm: item.IdUm,
                    nroFactor: item.NroFactor,
                    precioUnitario: this.$formatoMiles(item.PrecioVenta, 2),
                    cantidad: 1,
                    descuento1: item.Descuento1,
                    importe: item.PrecioVentaFinal,
                    listaUm: item.ListaUm.map((x) => {
                        return {
                            text: x.NomUm,
                            value: x.IdUm,
                            descuento1: x.Descuento1,
                            nroFactor: x.NroFactor,
                            precioVenta: x.PrecioVenta,
                            precioVentaFinal: x.PrecioVentaFinal
                        }
                    }),
                    precioBase: item.PrecioBase,
                    codigo: item.Codigo
                }
                _self.agregarArticulo(modelo);
                _self.fieldSearchBarcode = "";
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
            }).finally(() => {
                _self.overlayCliente = false;
            })
        },
        abrirDialogoAbonarCredito(bEditar) {
            this.$refs.dlgAbonarCredito.show({
                abono: this.modelo.abono,
                totalPagar: this.totales.totalPagar,
                fechaVencimiento: this.modelo.fechaVencimiento,
                editar: bEditar
            }).then((modelo) => {
                this.modelo.abono = modelo.abono;
                this.modelo.saldo = modelo.saldo;
                this.modelo.fechaVencimiento = modelo.fechaVencimiento;
                //Si no es edición
                if (!bEditar) {
                    this.showPanelCredito = true;
                }
            }).catch((sw) => {
                //Si no es edición
                if (!bEditar) {
                    this.modelo.idTipoCondicionPago = "";
                }
            })
        },
        evaluaCredito() {
            return this.arrFormapagos.find(x => x.value == this.modelo.idTipoCondicionPago).flgEvaluaCredito;
        },
        inicializarFormapago() {
            if (this.arrFormapagos == undefined)
                return '';

            //Forma de pago al contado
            return this.arrFormapagos.find(x => x.flgEvaluaCredito == false).value;
        },
        nombreFormaPago() {
            let obj = this.arrFormapagos.find(x => x.value == this.modelo.idTipoCondicionPago);
            return obj == undefined ? '' : obj.text;
        },
        nombreComprobante() {
            let obj = this.arrComprobantes.find(x => x.value == this.modelo.idTipoComprobante);
            return obj == undefined ? '' : obj.text;
        },
        seleccionarFormaPago() {
            this.$nextTick(function () {
                this.showPanelCredito = false;
                if (this.evaluaCredito()) {
                    let mensaje = "";
                    let error = false;
                    if (this.cliente.idCliente == "") {
                        this.modelo.idTipoCondicionPago = "";
                        mensaje = "Debe de seleccionar un cliente para realizar el crédito.";
                        error = true;
                    }
                    if (!error && this.detalle.length == 0) {
                        this.modelo.idTipoCondicionPago = "";
                        mensaje = "No ha seleccionado ningún artículo para la venta.";
                        error = true;
                    }
                    if (error) {
                        this.$root.$alertSB(mensaje, {
                            type: "warning",
                            timeout: 5000,
                        });
                        return;
                    }
                    this.abrirDialogoAbonarCredito();
                }
            });

        },
        nuevo() {
            this.modelo = Object.assign(this.modelo, {
                idTipoComprobante: "",
                nroSerie: '',
                nroDocumento: '',
                fechaEmision: this.getFechaActual(),
                horaEmision: null,
                fechaVencimiento: this.getFechaActual(),
                idTipoPago: 'EFE',
                idTipoCondicionPago: this.inicializarFormapago(),
                observacion: ''
            })
            this.chkHorEmi = false;
            this.fieldSearchBarcode = '';
            this.cliente = {
                idCliente: '',
                nomCliente: '',
                idTipoCliente: '',
                nroDocumento: '',
            };
            this.detalle = [];
            this.totales = {
                subTotal: 0,
                tasaDscto: 0,
                totalDescuento: 0,
                totalIgv: 0,
                total: 0,
                redondeo: 0,
                totalPagar: 0
            };
            this.bSeleccionarComprobante = false;

            //Desabilitamos los documentos.
            this.arrDocumentos.forEach(x => x.disabled = false);
        },
        validForm() {
            let _self = this;
            return new Promise((resolve, reject) => {
                if (this.modelo.idTipoComprobante == "") {
                    return reject({ error: true, mensaje: "Debe de seleccionar el tipo de comprobante" })
                };
                if (this.modelo.idTipoDocumento == "") {
                    return reject({ error: true, mensaje: "Debe de seleccionar el tipo de documento" })
                };
                if (this.modelo.idTipoPago == "") {
                    return reject({ error: true, mensaje: "Debe de seleccionar el tipo de pago" })
                };
                if (this.modelo.idTipoCondicionPago == "") {
                    return reject({ error: true, mensaje: "Debe de seleccionar la forma de pago" });
                };
                if (_self.detalle == 0) {
                    return reject({ error: true, mensaje: "No existe ningún producto seleccionado para realizar la venta." });
                };
                let modeloError = null;
                for (let i = 0; i < _self.detalle.length; i++) {
                    if (_self.detalle[i].cantidad == 0) {
                        modeloError = { error: true, mensaje: `Debe de ingresar la cantidad mayor a cero en ${_self.detalle[i].descripcion}` };
                        break;
                    }
                    if (_self.detalle[i].descuento1 < 0 || _self.detalle[i].descuento1 > 100) {
                        modeloError = { error: true, mensaje: `El descuento debe de oscilar entre el 0 al 100 en ${_self.detalle[i].descripcion}` };
                        break;
                    }
                    if (_self.detalle[i].importe == 0) {
                        modeloError = { error: true, mensaje: `Debe de ingresar el importe mayor a cero en ${_self.detalle[i].descripcion}` };
                        break;
                    }
                }
                if (modeloError != null) {
                    return reject(modeloError);
                }
                return resolve({ error: false })
            })
        },
        grabar() {
            let _self = this;

            //Detalle de la venta
            let detalle = _self.detalle.map(x => {
                return {
                    IdArticulo: x.idArticulo, PrecioBase: x.precioBase, IdUm: x.idUm, Cantidad: x.cantidad,
                    TasDescuento: x.descuento1, TasIgv: _self.empresa.Igv, NroFactor: x.nroFactor, Importe: x.importe
                }
            })

            let parameters = {
                Accion: "INS",
                IdTipoComprobante: _self.modelo.idTipoComprobante,
                IdCliente: _self.cliente.idCliente,
                IdMoneda: _self.modelo.idMoneda,
                FecDocumento: _self.fecEmiFormatted,
                HorDocumento: _self.modelo.horaEmision,
                FecVencimiento: _self.fecVenFormatted,

                TotBruto: _self.totales.subTotal,
                TasDescuento: _self.totales.tasaDscto == '' ? 0 : _self.totales.tasaDscto,
                TotDescuento: _self.totales.totalDescuento == '' ? 0 : _self.totales.totalDescuento,
                TotImpuesto: _self.totales.totalIgv,
                TotVenta: _self.totales.total,

                IdTipoPago: _self.modelo.idTipoPago,
                IdTipoCondicionPago: _self.modelo.idTipoCondicionPago,
                ObsVenta: _self.modelo.observacion,
                Abono: _self.modelo.abono,
                Saldo: _self.modelo.saldo,
                IdCajaCa: "01",
                CorrelativoCa: 134,
                DetalleVenta: detalle
            }

            _self.overlay = true;

            _self.$axios.post("api/Venta/Register", parameters).then((reponse) => {

                let resultado = reponse.data;
                if (!resultado.Resultado) {
                    _self.$root.$alertSB(resultado.Mensaje, {
                        type: "warning",
                    });
                }
                let mensaje = `Se generó el/la ${_self.nombreComprobante()}: ${resultado.Data.serie}-${resultado.Data.documento}`
                _self.$root.$alertSB(mensaje, {
                    type: "success",
                    timeout: 5000,
                    fontSize: 'text-h6'
                });
                _self.modelo.nroSerie = resultado.Data.serie;
                _self.modelo.nroDocumento = resultado.Data.documento;
                _self.bSeleccionarComprobante = true;
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
            }).finally(() => {
                _self.overlay = false;
            })
        },
        pagar() {
            let _self = this;
            //validamos los datos del formulario
            _self.validForm().then((resultado) => {
                let abono = _self.modelo.abono == 0 ? 0 : _self.modelo.abono;

                if (_self.modelo.idTipoPago == "EFE") {
                    //Abrir dialogo mostrando el total e ingresar el monto de efectivo.
                    _self.$refs.dlgPago.show({
                        montoTotal: _self.totales.totalPagar,
                        abono, nombreFormaPago: _self.nombreFormaPago()
                    }).then((siEmitirComprobante) => {
                        if (siEmitirComprobante) {
                            _self.grabar();
                        }
                    }).catch(() => {

                    })
                } else {
                    this.$root.$confirm("Facturación", "¿Desea emitir el comprobante?").then(() => {
                        _self.grabar();
                    }).catch(() => {
                        //Si selecciona "no" en el dialogo de confirmación, no hace nada.
                    });
                }
            }).catch((error) => {
                _self.$root.$alertSB(error.mensaje, {
                    type: "warning",
                });
                return;
            });
        },
        bindingVenta(item) {
            let cabecera = item.Cabecera;
            let detalle = item.Detalle;

            this.modelo.idTipoComprobante = cabecera.IdTipoComprobante;
            this.modelo.nroSerie = cabecera.NroSerie;
            this.modelo.nroDocumento = cabecera.NroDocumento;
            this.modelo.fechaEmision = this.$dayjs(cabecera.FecDocumento, 'DD/MM/YYYY').format('YYYY-MM-DD');
            this.modelo.fechaVencimiento = this.$dayjs(cabecera.FecVencimiento, 'DD/MM/YYYY').format('YYYY-MM-DD');
            this.modelo.idMoneda = cabecera.IdMoneda;
            this.modelo.idTipoPago = cabecera.IdTipoPago;
            this.modelo.idTipoCondicion = cabecera.IdTipoCondicion;
            this.modelo.observacion = cabecera.ObsVenta;

            this.cliente.idCliente = cabecera.ICliente;
            this.cliente.nomCliente = cabecera.NomCliente;
            this.cliente.idTipoDocumento = cabecera.IdTipoDocumento;
            this.cliente.nroDocumento = cabecera.NroDocumentoCliente;

            this.totales.subTotal = cabecera.TotBruto;
            this.totales.tasaDscto = cabecera.TasDescuento;
            this.totales.totalDescuento = cabecera.TotDescuento;
            this.totales.totalIgv = cabecera.TotImpuesto;
            this.totales.total = cabecera.TotVenta;
            let redondeo = (cabecera.TotVenta - cabecera.TotVentaRedondeo);
            this.totales.totalPagar = cabecera.TotVentaRedondeo;
            this.totales.redondeo = redondeo > 0 ? (redondeo * (-1)) : 0;

            this.detalle = [];
            detalle.forEach((elem) => {
                this.detalle.push({
                    idArticulo: elem.IdArticulo,
                    descripcion: elem.NomArticulo,
                    idUm: elem.IdUm,
                    nroFactor: elem.NroFactor,
                    precioUnitario: this.$formatoMiles(elem.PrecioUnitario, 2),
                    cantidad: elem.Cantidad,
                    descuento1: elem.TasDescuento,
                    importe: elem.Importe,
                    listaUm: [{ value: elem.IdUm, text: elem.NomUm }],
                    codigo: elem.Codigo
                });
            });
            this.bSeleccionarComprobante = true;
        },
        buscarVenta() {
            let _self = this;
            _self.$refs.dlgBuscarVenta.show().then((response) => {
                _self.overlay = true;
                let parameters = {
                    params: {
                        idTipoComprobante: response.idTipoComprobante,
                        nroSerie: response.nroSerie,
                        nroDocumento: response.nroDocumento
                    }
                };

                _self.$axios.get("/api/Venta/GetById", parameters).then((response) => {
                    let result = response.data;
                    if (!result.Resultado) {
                        _self.$root.$alertSB(result.Mensaje, {
                            type: "warning",
                        });
                        return;
                    }
                    //Agregamos el artículo encontrado al detalle.
                    _self.bindingVenta(result.Data);
                }).catch((error) => {
                    _self.$root.$alertSB(error.response.data.Message, {
                        type: "warning"
                    });
                }).finally(() => {
                    _self.overlay = false;
                })
            }).catch((error) => { })
        }
    },
    mounted() {
        let _self = this;
        _self.overlay = true;
        
        _self.$axios.get('/api/Venta/GetData').then((response) => {
            let data = response.data.Data.Listas;
            let listaTipoDocumento = data.ListaTipoDocumento;
            let listaTipoComprobante = data.ListaTipoComprobante;
            let listaMoneda = data.ListaMoneda;
            let listaTipoPago = data.ListaTipoPago;
            let listaTipoCondicion = data.ListaTipoCondicion;
            let listaEstado = data.ListaEstado;
            let listaDepartamento = data.ListaDepartamento;

            _self.empresa = response.data.Data.Empresa;

            listaTipoComprobante.forEach((elem) => {
                _self.arrComprobantes.push({
                    text: elem.NomTipoComprobante,
                    value: elem.IdTipoComprobante,
                });

            });

            listaDepartamento.forEach((elem) => {
                _self.arrDepartamentos.push({
                    text: elem.NomDepartamento,
                    value: elem.IdDepartamento,
                });
            });

            listaTipoDocumento.forEach((elem) => {
                _self.arrDocumentos.push({
                    text: elem.Abreviatura,
                    value: elem.IdTipoDocumento,
                    disabled: false,
                    maxDigitos: elem.MaxDigitos,
                    flgRuc: elem.FlgRuc
                });
                _self.arrDocumentosConsulta.push({
                    text: elem.Abreviatura,
                    value: elem.IdTipoDocumento,
                    maxDigitos: elem.MaxDigitos,
                    flgRuc: elem.FlgRuc
                });
            });

            listaMoneda.forEach((elem) => {
                _self.arrMonedas.push({
                    text: elem.NomMoneda,
                    value: elem.IdMoneda,
                    flgLocal: elem.FlgLocal,
                    sgnMoneda: elem.SgnMoneda
                });
                if (elem.FlgLocal) {
                    _self.modelo.idMoneda = elem.IdMoneda;
                }
            });

            listaTipoPago.forEach((elem) => {
                _self.arrTipoPagos.push({
                    text: elem.NomTipoPago,
                    value: elem.IdTipoPago,
                });
            });
            _self.modelo.idTipoPago = "EFE";

            listaTipoCondicion.forEach((elem) => {
                _self.arrFormapagos.push({
                    text: elem.NomTipoCondicionPago,
                    value: elem.IdTipoCondicionPago,
                    flgEvaluaCredito: elem.FlgEvaluaCredito
                });
                if (!elem.FlgEvaluaCredito)
                    _self.modelo.idTipoCondicionPago = elem.IdTipoCondicionPago;
            });

            _self.arrEstados.push({ text: 'TODOS', value: 0 });
            listaEstado.forEach((elem) => {
                _self.arrEstados.push({
                    text: elem.NomEstado,
                    value: elem.IdEstado
                });
            })

        }).catch((error) => {
            _self.$root.$alertSB(error.response.data.Message, {
                type: "warning"
            });
        }).finally(() => {
            _self.overlay = false;
        })

        window.addEventListener("keydown", (e) => {
            //Mientras no haya un modal abierto.
            let dialogosAbiertos = document.querySelectorAll('.v-dialog.v-dialog--active');
            if (dialogosAbiertos.length > 0) return;

            if (e.defaultPrevented) {
                return;
            }

            var handled = false;
            if (e.key != undefined) {
                if (e.key == 'F6') {
                    handled = true;
                    _self.nuevo();
                } else if (e.key == 'F7') {
                    handled = true;
                    _self.pagar();
                } else if (e.key == 'F9') {
                    _self.buscarVenta();
                } else if (e.key == "+") {
                    handled = true;
                    _self.bDialogBuscarArticulo = true;
                }
            }

            if (handled) {
                // Suppress "double action" if event handled
                e.preventDefault();
            }
        })
    },
}