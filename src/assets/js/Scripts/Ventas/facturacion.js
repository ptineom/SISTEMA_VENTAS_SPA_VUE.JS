import DlgBuscarCliente from '@/components/Dialogos/DlgBuscarCliente'
import DlgBuscarArticulo from '@/components/Dialogos/DlgBuscarArticulo'
import CurrencyInput from '@/components/CurrencyInput'
import Registro from '@/views/Compras/Registro'
import DlgAbonarCredito from '@/components/Dialogos/DlgAbonarCredito'
import DlgPago from '@/views/Ventas/DlgPago'
import Consulta from '@/views/Ventas/Consulta'

export default {
    name: "Facturacion",
    components: {
        DlgBuscarCliente,
        DlgBuscarArticulo,
        CurrencyInput,
        Registro,
        DlgAbonarCredito,
        DlgPago,
        Consulta
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
            fecEmiFormatted: this.$moment(this.fechaEmision).format("DD/MM/YYYY"),
            fecVenFormatted: this.$moment(this.fechaVencimiento).format("DD/MM/YYYY"),
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
            this.fecEmiFormatted = this.$moment(val).format("DD/MM/YYYY")
            this.modelo.fechaVencimiento = this.modelo.fechaEmision;
        },
        "modelo.fechaVencimiento"(val) {
            this.fecVenFormatted = this.$moment(val).format("DD/MM/YYYY")
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
                this.fechaVencimiento = this.$moment(new Date()).format("YYYY-MM-DD");
            }
        }
    },
    computed: {
        totalPagarFormateado() {
            return `${this.getMoneda()} ${this.$formatoMiles(this.totales.totalPagar, 2)}`
        },
    },
    methods: {
        getFechaActual: function () {
            return this.$moment(new Date()).format("YYYY-MM-DD");
        },
        getHoraActual() {
            return this.$moment(new Date()).format("HH:mm");
        },
        getIgv: function () {
            return (this.empresa.igv / 100);
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
            return this.$moment(val).isSameOrBefore(new Date());
        },
        allowedDatesFechaVencimiento(val) {
            //Solo se habilitarán fechas mayor o igual a la fecha de emisión.
            return this.$moment(val).isSameOrAfter(this.$moment(this.modelo.fechaEmision));
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

            //Si selecciona FACTURA y el cliente es natural, limpiamos datos del cliente.
            if (nomTipoComprobante.slice(0, 3).toUpperCase() == "FAC" && this.cliente.idTipoDocumento != "") {
                let flgNatural = !this.arrDocumentos.find(x => x.value == this.cliente.idTipoDocumento).flgNoNatural;
                if (flgNatural) {
                    this.limpiarCliente();
                }
            }

            //Habilitamos solo los documentos según el comprobante seleccionado.
            this.arrDocumentos.forEach((elem) => {
                elem.disabled = true;
                //Si es factura entonces se habilitaran solo los documento no natural.
                //Si no es factura no importa el tipo de persona del documento.
                if (nomTipoComprobante.slice(0, 3).toUpperCase() == "FAC") {
                    if (elem.flgNoNatural) {
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
            })
        },
        seleccionarTipoDocumento(idTipoDocumento) {
            this.cliente = Object.assign(this.cliente, {
                idCliente: '',
                nomCliente: '',
                nroDocumento: ''
            });

            let maxDigitos = 25;
            if (!!idTipoDocumento)
                maxDigitos = this.arrDocumentos.find(x => x.value == idTipoDocumento).maxDigitos;

            this.maxlengthDocumento = maxDigitos;
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
            this.$axios.get("/api/Cliente/obtenerClientePorDocumentoAsync/" + parameteres).then((response) => {
                let data = response.data.data;
                Object.assign(_self.cliente, {
                    idCliente: data.idCliente,
                    nomCliente: data.nomCliente
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
                    let modeloUm = item.unidadMedidas.find((x) => (x.value == item.idUm));
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
        agregarArticulo(item) {
            let modelo = {
                idArticulo: item.idArticulo, descripcion: item.nomArticulo,
                idUm: item.idUm, nroFactor: item.nroFactor, precioUnitario: this.$formatoMiles(item.precioVenta, 2),
                cantidad: 1, descuento1: item.descuento1, importe: item.precioVentaFinal,
                unidadMedidas: item.unidadMedidas,
                precioBase: item.precioBase,
                codigo: item.codigo
            }
            this.detalle.push(modelo);
            this.calcularTotales();
        },
        obtenerCliente(item) {
            this.cliente = {
                idCliente: item.idCliente,
                nomCliente: item.nomCliente,
                idTipoDocumento: item.idTipoDocumento,
                nroDocumento: item.nroDocumento
            }
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
            }
            this.$axios.get("/api/Articulo/listaArticulosGeneral", parameters).then((response) => {
                let result = response.data;
                if (!result.bResultado) {
                    _self.$refs.alerta.show(result.sMensaje, {
                        type: "warning",
                    });
                    return;
                }
                //Agregamos el artículo encontrado al detalle.
                _self.agregarArticulo(result.data.lista[0]);
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
                fechaVencimiento: this.fechaVencimiento,
                editar: bEditar
            }).then((modelo) => {
                this.modelo.abono = modelo.abono;
                this.modelo.saldo = modelo.saldo;
                this.fechaVencimiento = modelo.fechaVencimiento;
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
            return !this.arrFormapagos.find(x => x.value == this.modelo.idTipoCondicionPago).flgNoEvaluaCredito;
        },
        inicializarFormapago() {
            if (this.arrFormapagos == undefined) return '';
            return this.arrFormapagos.find(x => x.flgNoEvaluaCredito == true).value;
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
            this.arrDocumentos.forEach(x => x.disabled = true);
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
            let detalle = _self.detalle.map(x => {
                return {
                    idArticulo: x.idArticulo, precioBase: x.precioBase, idUm: x.idUm, cantidad: x.cantidad,
                    tasDescuento: x.descuento1, tasIgv: _self.empresa.igv, nroFactor: x.nroFactor, importe: x.importe
                }
            })

            let parameters = {
                ACCION: "INS",
                idTipoComprobante: _self.modelo.idTipoComprobante,
                idCliente: _self.cliente.idCliente,
                idMoneda: _self.modelo.idMoneda,
                fecDocumento: _self.fecEmiFormatted,
                horDocumento: _self.modelo.horaEmision,
                fecVencimiento: _self.fecVenFormatted,

                totBruto: _self.totales.subTotal,
                tasDescuento: _self.totales.tasaDscto == '' ? 0 : _self.totales.tasaDscto,
                totDescuento: _self.totales.totalDescuento == '' ? 0 : _self.totales.totalDescuento,
                totImpuesto: _self.totales.totalIgv,
                totVenta: _self.totales.total,

                idTipoPago: _self.modelo.idTipoPago,
                idTipoCondicionPago: _self.modelo.idTipoCondicionPago,
                obsVenta: _self.modelo.observacion,
                abono: _self.modelo.abono,
                saldo: _self.modelo.saldo,
                idCajaCa: "01",
                correlativoCa: 134,
                detalleVenta: detalle
            }
            _self.overlay = true;
            _self.$axios.post("api/Venta/grabarVentaAsync", parameters).then((reponse) => {
                let resultado = reponse.data;
                if (!resultado.bResultado) {
                    _self.$root.$alertSB(resultado.sMensaje, {
                        type: "warning",
                    });
                }
                let mensaje = `Se generó el/la ${_self.nombreComprobante()}: ${resultado.data.nroSerie}-${resultado.data.nroDocumento}`
                _self.$root.$alertSB(mensaje, {
                    type: "success",
                    timeout: 5000,
                    fontSize: 'text-h6'
                });
                _self.modelo.nroSerie = resultado.data.nroSerie;
                _self.modelo.nroDocumento = resultado.data.nroDocumento;
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
            let cabecera = item.cabecera;
            let detalle = item.detalle;

            this.modelo.idTipoComprobante = cabecera.idTipoComprobante;
            this.modelo.nroSerie = cabecera.nroSerie;
            this.modelo.nroDocumento = cabecera.nroDocumento;
            this.modelo.fechaEmision = this.$moment(cabecera.fecDocumento, 'DD/MM/YYYY').format('YYYY-MM-DD');
            this.modelo.fechaVencimiento = this.$moment(cabecera.fecVencimiento, 'DD/MM/YYYY').format('YYYY-MM-DD');
            this.modelo.idMoneda = cabecera.idMoneda;
            this.modelo.idTipoPago = cabecera.idTipoPago;
            this.modelo.idTipoCondicion = cabecera.idTipoCondicion;
            this.modelo.observacion = cabecera.obsVenta;

            this.cliente.idCliente = cabecera.idCliente;
            this.cliente.nomCliente = cabecera.nomCliente;
            this.cliente.idTipoDocumento = cabecera.idTipoDocumento;
            this.cliente.nroDocumento = cabecera.nroDocumentoCliente;

            this.totales.subTotal = cabecera.totBruto;
            this.totales.tasaDscto = cabecera.tasDescuento;
            this.totales.totalDescuento = cabecera.totDescuento;
            this.totales.totalIgv = cabecera.totImpuesto;
            this.totales.total = cabecera.totVenta;
            let redondeo = (cabecera.totVenta - cabecera.totVentaRedondeo);
            this.totales.totalPagar = cabecera.totVentaRedondeo;
            this.totales.redondeo = redondeo > 0 ? (redondeo * (-1)) : 0;

            this.detalle = [];
            detalle.forEach((elem) => {
                this.detalle.push({
                    idArticulo: elem.idArticulo,
                    descripcion: elem.nomArticulo,
                    idUm: elem.idUm,
                    nroFactor: elem.nroFactor,
                    precioUnitario: this.$formatoMiles(elem.precioUnitario, 2),
                    cantidad: elem.cantidad,
                    descuento1: elem.tasDescuento,
                    importe: elem.importe,
                    unidadMedidas: [{ value: elem.idUm, text: elem.nomUm }],
                    codigo: elem.codigo
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
                }
                _self.$axios.get("/api/Venta/ventaPorCodigoAsync", parameters).then((response) => {
                    let result = response.data;
                    if (!result.bResultado) {
                        _self.$root.$alertSB(result.sMensaje, {
                            type: "warning",
                        });
                        return;
                    }
                    //Agregamos el artículo encontrado al detalle.
                    _self.bindingVenta(result.data);
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
        _self.$axios.get('/api/Venta/getDataAsync').then((response) => {
            let data = response.data.data.listas;
            let listaComprobantes = data.listaComprobantes;
            let listaDocumentos = data.listaDocumentos;
            let listaMonedas = data.listaMonedas;
            let listaTipPag = data.listaTipPag;
            let listaTipCon = data.listaTipCon;
            let listaEstados = data.listaEstados;

            _self.empresa = response.data.data.empresa;
            listaComprobantes.forEach((elem) => {
                _self.arrComprobantes.push({
                    text: elem.nomTipoComprobante,
                    value: elem.idTipoComprobante,
                });

            });

            listaDocumentos.forEach((elem) => {
                _self.arrDocumentos.push({
                    text: elem.abreviatura,
                    value: elem.idTipoDocumento,
                    disabled: true,
                    flgNoNatural: elem.flgNoNatural,
                    maxDigitos: elem.maxDigitos,
                });
                _self.arrDocumentosConsulta.push({
                    text: elem.abreviatura,
                    value: elem.idTipoDocumento,
                    maxDigitos: elem.maxDigitos,
                });
            });

            listaMonedas.forEach((elem) => {
                _self.arrMonedas.push({
                    text: elem.nomMoneda,
                    value: elem.idMoneda,
                    flgLocal: elem.flgLocal,
                    sgnMoneda: elem.sgnMoneda
                });
                if (elem.flgLocal) {
                    _self.modelo.idMoneda = elem.idMoneda;
                }
            });

            listaTipPag.forEach((elem) => {
                _self.arrTipoPagos.push({
                    text: elem.nomTipoPago,
                    value: elem.idTipoPago,
                });
            });
            _self.modelo.idTipoPago = "EFE";

            listaTipCon.forEach((elem) => {
                _self.arrFormapagos.push({
                    text: elem.nomTipoCondicionPago,
                    value: elem.idTipoCondicionPago,
                    flgNoEvaluaCredito: elem.flgNoEvaluaCredito
                });
                if (!!elem.flgNoEvaluaCredito) _self.modelo.idTipoCondicionPago = elem.idTipoCondicionPago;
            });

            _self.arrEstados.push({ text: 'TODOS', value: 0 });
            listaEstados.forEach((elem) => {
                _self.arrEstados.push({
                    text: elem.nomEstado,
                    value: elem.idEstado
                });
            })

        }).catch((error) => {
            alert(error.response);
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