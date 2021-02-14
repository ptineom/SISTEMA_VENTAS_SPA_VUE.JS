import { mapState } from "vuex";

export default {
    name: "Articulo",
    data() {
        return {
            titulo: "Artículo",
            sucursalesSeleccionados: [],
            singleSelect: false,
            vista: 1,
            accion: 'INS',
            overlay: false,
            tab: null,
            headersUmDscto: [
                { text: "Unidad de medida", value: "", align: "center", sortable: false },
                { text: "Factor", value: "", align: "center", sortable: false, width: "90px" },
                { text: "Precio venta(Inc. IGV)", value: "", align: "center", sortable: false, width: "120px" },
                { text: "Dscto", value: "", align: "center", sortable: false, class: "px-0" },
                { text: "%", value: "", align: "center", sortable: false, width: "65px" },
                { text: "Precio \n venta final", value: "", align: "center", sortable: false, width: "120px" },
                { text: "Fecha inicio", value: "", align: "center", sortable: false, class: "px-0" },
                { text: "Fecha final", value: "", align: "center", sortable: false, class: "px-0" },
                { text: "", value: "opciones", align: "center", sortable: false, width: "110px" },
            ],
            detalleUmDscto: [],
            headersSedes: [
                {
                    text: "Almacén",
                    value: "nomAlmacen",
                    align: "start",
                    sortable: false,
                },
                {
                    text: "Stock",
                    value: "stockActual",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Sede",
                    value: "nomSucursal",
                    sortable: false,
                },
                {
                    text: "Dirección",
                    value: "direccion",
                    sortable: false,
                },
            ],
            sucursales: [],
            grupos: [],
            familias: [],
            unidadMedidas: [],
            igv: 0,
            modelo: {
                idArticulo: "",
                nomArticulo: "",
                nomVenta: "",
                idGrupo: "",
                idFamilia: "",
                idMarca: "22",
                stockMinimo: "",
                precioCompra: "",
                flgImportado: false,
                flgInactivo: false,
                precioBase: ''
            },
            precioVenta: '',
            precioIgv: '',
            porPrecio: 'venta',
            headersConsulta: [
                { text: "Código", value: "idArticulo", align: "center" },
                { text: "Descripción", value: "nomArticulo", width: "300px" },
                { text: "Marca", value: "nomMarca" },
                { text: "Grupo", value: "nomGrupo" },
                { text: "Familia", value: "nomFamilia" },
                { text: "Código barra", value: "codigoBarra" },
                { text: "Precio venta", value: "precioVentaFinal", width: "140px" },
                { text: "Inactivo", value: "flgInactivo", sortable: false, class: "px-1" },
                { text: "", value: "opciones", align: "center", sortable: false, width: "170px" },
            ],
            detalleConsulta: [],
            porTipoFiltro: 'descripcion',
            filtro: '',
            monedaLocal: {},
            imgFoto: 'http://sigpapelera.com.ar/Fotos/sin.jpg',
            file:null,
            torito: ''
        };
    },
    methods: {
        cambiarfecha(valor, item, campo) {
            if (campo == "fechaInicialPromocion")
                item.fecIniProFormatted = this.$moment(valor).format("DD/MM/YYYY");
            else if (campo == "fechaFinalPromocion")
                item.fecFinProFormatted = this.$moment(valor).format("DD/MM/YYYY");
        },
        llenarCboFamilia() {
            let _self = this;
            _self.overlay = true;
            _self.familias = [];
            _self.detalleUmDscto = [];

            _self.$axios.get("/api/Familia/cboFamilias/" + _self.modelo.idGrupo).then((response) => {
                let familias = response.data.data;

                familias.forEach((elem) => {
                    _self.familias.push({
                        text: elem.nomFamilia,
                        value: elem.idFamilia,
                    });
                });
                _self.modelo.idFamilia = "";
            }).catch((error) => _self.$root.$alertSB(error.response.data.Message, { color: "error" }))
                .finally(() => _self.overlay = false);
        },
        llenarCboUm() {
            let _self = this;
            _self.overlay = true;
            _self.unidadMedidas = [];
            _self.detalleUmDscto = [];

            let uri = `/api/UnidadMedida/listaUmPorFamilia/${_self.modelo.idGrupo}/${_self.modelo.idFamilia}`;
            _self.$axios.get(uri).then((response) => {
                let unidadMedidas = response.data.data;
                //Cargamos el arrar de UM.
                unidadMedidas.forEach((elem) => {
                    _self.unidadMedidas.push({
                        text: elem.nomUm,
                        value: elem.idUm,
                    });
                });
                //Agregamos una fila para la tabla Um_dscto.
                _self.agregarUmDscto();
            }).catch((error) => _self.$root.$alertSB(error.response.data.Message, { color: "error" }))
                .finally(() => _self.overlay = false);
        },
        agregarUmDscto(idx) {
            let newCorrelativo = 0;
            if (this.detalleUmDscto.length > 0) {
                let correlativos = this.detalleUmDscto.map(x => x.correlativo);
                newCorrelativo = Math.max(...correlativos);
            }
            newCorrelativo = (newCorrelativo + 1);

            this.detalleUmDscto.push({
                idUm: this.unidadMedidas.length > 0 ? this.unidadMedidas[0].value : '',
                nroFactor: "",
                precioVenta: "",
                flgPromocion: false,
                descuento: "",
                precioVentaFinal: "",
                fecInicioPromocion: "",
                fecFinalPromocion: "",
                unidadMedidas: this.unidadMedidas,
                correlativo: newCorrelativo,
                fecIniProFormatted: '',
                fecFinProFormatted: '',
                showFecIniPro: false,
                showFecFinPro: false
            });

            if (idx != undefined) {
                //Para realizar el focus primero debe de renderizarce en el template.
                this.$nextTick(function () {
                    this.$refs.txtNroFactor_x[(idx + 1)].focus();
                })
            }
        },
        quitarUmDscto(correlativo) {
            if (this.detalleUmDscto.length > 1) {
                let index = this.detalleUmDscto.findIndex(x => x.correlativo == correlativo);
                //Quitar fila de la grilla
                this.detalleUmDscto.splice(index, 1);
            }
        },
        seleccionarUM(item, idx) {
            Object.assign(item, {
                nroFactor: "",
                precioVenta: "",
                flgPromocion: false,
                descuento: "",
                precioVentaFinal: "",
                fecInicioPromocion: "",
                fecFinalPromocion: "",
            })

            this.$refs.txtNroFactor_x[idx].focus();
        },
        seleccionarPromocion(item, idx) {
            if (item.flgPromocion) {
                this.$nextTick(function () {
                    if (this.modelo.precioBase == 0) {
                        item.flgPromocion = false;
                        this.$root.$alertSB('Debe de ingresar previamente el precio de venta', {
                            color: "warning",
                            right: false,
                        });
                        this.$refs.txtPreVen.focus();
                        return;
                    }

                    if (item.nroFactor == 0) {
                        item.flgPromocion = false;
                        this.$root.$alertSB('Debe de ingresar el factor mayor a cero', {
                            color: "warning",
                            right: false,
                        });
                        this.$refs.txtNroFactor_x[idx].focus();
                        return;
                    }
                    this.$refs.txtDescuento_x[idx].focus();
                })
            } else {
                Object.assign(item, {
                    descuento: "",
                    precioVentaFinal: "",
                    fecInicioPromocion: "",
                    fecFinalPromocion: "",
                    fecIniProFormatted: '',
                    fecFinProFormatted: '',
                })
            }
        },
        calcularPrecioBase(precioVenta) {
            precioVenta = precioVenta == "" ? 0 : precioVenta;
            let precioBase = (precioVenta / (1 + this.igv));
            let cuotaIgv = (precioVenta - precioBase);

            this.precioIgv = this.$formatoMiles(cuotaIgv, 2, true);
            this.modelo.precioBase = this.$formatoMiles(precioBase, 4, true);
            this.recalculoTablaUmDscto();
        },
        calcularPrecioVenta(precioBase) {
            let cuotaIgv = (precioBase * this.igv);
            let precioVenta = (parseFloat(precioBase) + parseFloat(cuotaIgv));

            this.precioIgv = this.$formatoMiles(cuotaIgv, 2, true);
            this.precioVenta = this.$formatoMiles(precioVenta, 2, true);
            this.recalculoTablaUmDscto();
        },
        recalculoTablaUmDscto() {
            this.detalleUmDscto.forEach(x => {
                let nroFactor = 0;

                if (!!x.nroFactor)
                    nroFactor = parseFloat(x.nroFactor);

                let precioXfactor = parseFloat(this.modelo.precioBase) * nroFactor;
                let precioVenta = precioXfactor + (precioXfactor * this.igv);

                x.precioVenta = this.$formatoMiles(precioVenta, 2, true);

                if (x.flgPromocion) {
                    let dscto = x.descuento == '' ? 0 : x.descuento;
                    let precioBruto = (precioXfactor - (precioXfactor * (dscto / 100)));
                    let precioVentaFinal = (precioBruto + (precioBruto * this.igv));

                    //actualizamos el valor
                    x.precioVentaFinal = precioVentaFinal.toFixed(2);
                }
            });
        },
        calcularPvfXdsctoUmDscto(_dscto, item) {
            let nroFactor = 0, dscto = 0;

            if (!!item.nroFactor)
                nroFactor = parseFloat(item.nroFactor);

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

            let precioBaseXfactor = parseFloat(this.modelo.precioBase) * nroFactor;
            let precioBruto = (precioBaseXfactor - (precioBaseXfactor * (dscto / 100)));
            let precioFinalConDscto = (precioBruto + (precioBruto * this.igv));

            //actualizamos el valor
            item.precioVentaFinal = precioFinalConDscto.toFixed(2);

            this.$nextTick(function () {
                item.descuento = dscto == 0 ? '' : dscto;
            })
        },
        calcularPreciosXfactorUmDscto(_nroFactor, item) {
            let nroFactor = 0, descuento = 0, precioBase = 0;

            if (!!_nroFactor)
                nroFactor = parseFloat(_nroFactor);

            if (nroFactor == 0) {
                Object.assign(item, {
                    flgPromocion: false,
                    descuento: "",
                    precioVentaFinal: "",
                    fecInicioPromocion: "",
                    fecFinalPromocion: "",
                })
            }

            if (!!item.descuento)
                descuento = parseFloat(item.descuento);

            if (!!this.modelo.precioBase)
                precioBase = parseFloat(this.modelo.precioBase);

            let precioBaseXfactor = precioBase * nroFactor;
            let precioFinalSinDscto = (precioBaseXfactor + (precioBaseXfactor * this.igv));
            //actualizamos el valor
            item.precioVenta = precioFinalSinDscto.toFixed(2);

            if (item.flgPromocion) {
                let precioBruto = (precioBaseXfactor - (precioBaseXfactor * (descuento / 100)));
                let precioFinalConDscto = (precioBruto + (precioBruto * this.igv));
                //actualizamos el valor
                item.precioVentaFinal = precioFinalConDscto.toFixed(2);
            } else {
                item.precioVentaFinal = "";
            }
        },
        calcularDsctoXpvfUmDscto(_precioVentaFinal, item) {
            let precioVentaFinal = 0;

            if (!!_precioVentaFinal)
                precioVentaFinal = parseFloat(_precioVentaFinal);

            let precioXFactor = parseFloat(this.modelo.precioBase) * parseFloat(item.nroFactor);
            //Quitamos el IGV del importe. Dejamos como importe bruto.
            let montoBrutoConDscto = (_precioVentaFinal / (1 + this.igv));

            if (precioXFactor >= montoBrutoConDscto) {
                //Fórmula para hallar la diferencia, para luego convertirlo en porcentaje.
                let dif = (precioXFactor - montoBrutoConDscto);
                let porc = ((dif / precioXFactor) * 100).toFixed(2);
                item.descuento = porc;
            } else {
                this.$root.$alertSB('No debe de exceder del precio de venta', {
                    color: "warning",
                    right: false,
                });
                item.descuento = 100;
                item.precioVentaFinal = '';
            }
        },
        consultar() {
            if (this.filtro == "") {
                this.$root.$alertSB("¡Debe de ingresar al menos un caracter!", { color: "warning" })
                return;
            }
            let _self = this;
            _self.overlay = true;

            let parameters = {
                params: {
                    accion: "SEL",
                    tipoFiltro: this.porTipoFiltro,
                    filtro: this.filtro
                }
            }
            _self.detalleConsulta = [];
            _self.$axios.get("/api/Articulo/listaArticulos", parameters).then((response) => {
                let articulos = response.data.data;
                if (articulos != null) {
                    articulos.forEach(x => {
                        _self.detalleConsulta.push({
                            idArticulo: x.idArticulo,
                            nomArticulo: x.nomArticulo,
                            nomMarca: x.nomMarca,
                            nomGrupo: x.nomGrupo,
                            nomFamilia: x.nomFamilia,
                            codigoBarra: x.codigoBarra,
                            stockActual: x.stockActual,
                            precioVentaFinal: x.precioVentaFinal,
                            flgInactivo: x.flgInactivo,
                            foto1: x.foto1,
                            foto2: x.foto2
                        })
                    });
                }
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { color: "warning" })
            }).finally(() => {
                _self.overlay = false;
                _self.$refs.txtNomArt.focus();
            })
        },
        limpiar() {
            this.modelo = {
                idArticulo: "",
                nomArticulo: "",
                nomVenta: "",
                idGrupo: "",
                idFamilia: "",
                idMarca: "22",
                stockMinimo: "",
                precioCompra: "",
                flgImportado: false,
                flgInactivo: false,
                precioBase: ''
            };
            this.precioIgv = "";
            this.precioVenta = "";
            this.detalleUmDscto = [];
            this.sucursalesSeleccionados = this.sucursales.map(x => { return { idSucursal: x.idSucursal } });
            //foto
            this.torito = "";
            this.limpiarFoto();
        },
        nuevo() {
            this.vista = 2;
            this.limpiar();
            this.tab = 0;
            this.porPrecio = "venta";
            this.accion = "INS";
            this.$nextTick(() => {
                this.$refs.txtNomArt.focus();
            })
        },
        getSubtitulo(vista) {
            return this.vista == 1 ? "Consulta" : "Mantenimiento";
        },
        validForm() {
            let _self = this;
            let mensajeError = "";
            return new Promise((resolve, reject) => {
                if (_self.modelo.nomArticulo.trim().length == 0)
                    return reject("¡Debe de ingresar el nombre del artículo!");

                if (_self.modelo.idMarca.toString().trim().length == 0)
                    return reject("¡Debe de ingresar la marca del artículo!");

                if (_self.modelo.idGrupo == "")
                    return reject("¡Debe de seleccionar el grupo del artículo!");

                if (_self.modelo.idFamilia == "")
                    return reject("¡Debe de seleccionar la familia del artículo!");

                if (_self.modelo.precioBase == 0)
                    return reject("¡Debe de ingresar el precio del artículo!");

                let detUmDscto = _self.detalleUmDscto;

                if (detUmDscto.length == 0)
                    return reject("Debe de seleccionar al menos 1 Unidad de medida para el artículo.");

                //Registros unicos
                let distintos = [...new Set(detUmDscto.map(f => f.idUm))];
                let duplicados = [];
                distintos.forEach(x => {
                    if (detUmDscto.filter(y => y.idUm == x).length > 1)
                        duplicados.push({ idUm: x })
                })

                if (duplicados.length > 0)
                    return reject("Existen duplicados de selección de unidades de medidas, verificar.");

                //Validar la lista UmDscto.
                for (let i = 0; i < detUmDscto.length; i++) {
                    let nomUm = detUmDscto[i].unidadMedidas.find(x => x.value == detUmDscto[i].idUm).text;

                    if (detUmDscto[i].nroFactor == 0) {
                        mensajeError = `Debe de ingresar el factor mayor a cero en la UM: ${nomUm}`;
                        break;
                    }

                    detUmDscto[i].descuento = detUmDscto[i].descuento == "" ? 0 : detUmDscto[i].descuento;

                    if (detUmDscto[i].flgPromocion) {
                        if (detUmDscto[i].descuento == 0) {
                            mensajeError = `Debe de ingresar el descuento mayor a cero en la UM: ${nomUm}`;
                            break;
                        }
                        if (detUmDscto[i].fecInicioPromocion == "") {
                            mensajeError = `Debe de ingresar la fecha de inicio del descuento en la UM: ${nomUm}`;
                            break;
                        }
                    }
                }

                if (mensajeError != "")
                    return reject(mensajeError);

                if (_self.sucursalesSeleccionados.length == 0)
                    return reject("Debe de seleccionar al menos 1 sede para el artículo.");

                resolve();
            });
        },
        grabar() {
            let _self = this;
            this.validForm().then(() => {
                this.$root.$confirm(_self.titulo, "¿Desea guardar los datos?").then(() => {
                    let _self = this;

                    let UmDscto = _self.detalleUmDscto.map(x => {
                        return {
                            idUm: x.idUm, nroFactor: x.nroFactor, descuento: x.descuento, flgPromocion: x.flgPromocion,
                            fecInicioPromocion: x.fecIniProFormatted, fecFinalPromocion: x.fecFinProFormatted
                        }
                    })

                    let sucursales = [];
                    _self.sucursalesSeleccionados.forEach(y => {
                        sucursales.push(y.idSucursal);
                    })

                    const formData = new FormData();
                    formData.append("accion", _self.accion);
                    formData.append("idArticulo", _self.modelo.idArticulo);
                    formData.append("nomArticulo", _self.modelo.nomArticulo);
                    formData.append("nomVenta", _self.modelo.nomVenta);
                    formData.append("idGrupo", _self.modelo.idGrupo);
                    formData.append("idFamilia", _self.modelo.idFamilia);
                    formData.append("idMarca", _self.modelo.idMarca);
                    formData.append("stockMinimo", _self.modelo.stockMinimo == "" ? 0 : _self.modelo.stockMinimo);
                    formData.append("precioCompra", _self.modelo.precioCompra == "" ? 0 : _self.modelo.precioCompra);
                    formData.append("flgImportado", _self.modelo.flgImportado);
                    formData.append("flgInactivo", _self.modelo.flgInactivo);
                    formData.append("precioBase", _self.modelo.precioBase);
                    formData.append("articulosUm", JSON.stringify(UmDscto));
                    formData.append("sucursales", JSON.stringify(sucursales));
                    formData.append("fileBinary", _self.file)

                    _self.overlay = true;
                    _self.$axios.post("api/Articulo/grabarArticulo", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((reponse) => {
                        let resultado = reponse.data;

                        if (resultado.bResultado) {
                            _self.$root.$alertSB(resultado.sMensaje, { color: "success" });
                            _self.nuevo();
                        }
                    }).catch((error) => {
                        _self.$root.$alertSB(error.response.data.Message, { color: "warning" })
                    }).finally(() => {
                        _self.overlay = false;
                    })
                }).catch((mensajeError) => {
                    _self.$root.$alertSB(mensajeError, { color: "warning" });
                });
            }).catch((mensajeError) => {
                _self.$root.$alertSB(mensajeError, { color: "warning" });
            })
        },
        obtenerArticuloPorId(idArticulo) {
            let _self = this;
            _self.overlay = true;

            _self.$axios.get(`/api/Articulo/obtenerArticuloPorCodigo/${idArticulo}`).then((response) => {
                let data = response.data.data;
                let modelo = data.modelo;

                if (modelo == null)
                    return;

                _self.limpiar();
                let listaFamilia = data.listaFamilia;
                let listaUm = data.listaUm;
                let listaUmDscto = data.listaArticuloUm;

                _self.modelo.idArticulo = modelo.idArticulo;
                _self.modelo.nomArticulo = modelo.nomArticulo;
                _self.modelo.nomVenta = modelo.nomVenta;
                _self.modelo.codigoBarra = modelo.codigoBarra;
                _self.modelo.idMarca = modelo.idMarca;
                _self.modelo.idGrupo = modelo.idGrupo;
                _self.modelo.precioCompra = modelo.precioCompra;
                _self.modelo.stockMinimo = modelo.stockMinimo;
                _self.modelo.precioBase = modelo.precioVenta;
                _self.calcularPrecioVenta(modelo.precioVenta);

                //Combo familia
                listaFamilia.forEach((elem) => {
                    _self.familias.push({
                        text: elem.nomFamilia,
                        value: elem.idFamilia,
                    });
                });
                _self.modelo.idFamilia = modelo.idFamilia;

                //Combo Um de la grilla
                listaUm.forEach((elem) => {
                    _self.unidadMedidas.push({
                        text: elem.nomUm,
                        value: elem.idUm,
                    });
                });

                //Grilla Um/Descuento
                listaUmDscto.forEach(x => {
                    _self.detalleUmDscto.push({
                        idUm: x.idUm,
                        nroFactor: x.nroFactor,
                        precioVenta: _self.$formatoMiles(x.precioVenta, 2),
                        flgPromocion: x.flgPromocion,
                        descuento: x.descuento == 0 ? '' : x.descuento,
                        precioVentaFinal: x.flgPromocion ? _self.$formatoMiles(x.precioVentaFinal, 2) : '',
                        fecInicioPromocion: x.flgPromocion ? _self.$moment(x.fecInicioPromocion, "DD/MM/YYYY").format("YYYY-MM-DD") : '',
                        fecFinalPromocion: (x.flgPromocion && x.fecFinalPromocion != "") ? _self.$moment(x.fecFinalPromocion, "DD/MM/YYYY").format("YYYY-MM-DD") : '',
                        unidadMedidas: _self.unidadMedidas,
                        correlativo: (_self.detalleUmDscto.length + 1),
                        fecIniProFormatted: x.flgPromocion ? x.fecInicioPromocion : "",
                        fecFinProFormatted: x.flgPromocion ? x.fecFinalPromocion : "",
                        showFecIniPro: false,
                        showFecFinPro: false
                    });
                });

                //Grillña sucursales
                _self.sucursalesSeleccionados = data.listaSucursal.filter(x => x.flgEnUso).map(y => {
                    return { idSucursal: y.idSucursal }
                });

                //Vista mantenimiento
                _self.vista = 2;

                this.accion = "UPD";
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { color: "warning" })
            }).finally(() => {
                _self.overlay = false;
                _self.$refs.txtNomArt.focus();
            });
        },
        eliminar(idArticulo, correlativo) {
            let _self = this;

            _self.$root.$confirm(_self.titulo, "¿Desea anular el registro?").then((response) => {
                _self.overlay = true;

                _self.$axios.post(`/api/Articulo/anularArticulo/${idArticulo}`).then((reponse) => {
                    let resultado = reponse.data;

                    if (resultado.bResultado) {
                        let idx = _self.detalleConsulta.findIndex(x => x.correlativo == correlativo);
                        _self.detalleConsulta.splice(idx, 1);
                        _self.$root.$alertSB(resultado.sMensaje, { color: "success" });
                    }
                }).catch((error) => {
                    _self.$root.$alertSB(error.response.data.Message, { color: "warning" })
                }).finally(() => {
                    _self.overlay = false;
                })
            }).catch((error) => {
                _self.$root.$alertSB(error, { color: "warning" })
            })
        },
        getFile(e){
            let input = e.target;
            let _self = this;
            if(input.files != undefined){
                let foto = input.files[0];
                let fr = new FileReader();
                fr.onload = (function(){
                    _self.imgFoto = fr.result;
                });
                fr.readAsDataURL(foto);
                _self.file = foto;
            }
        },
        limpiarFoto(){
            this.imgFoto = "http://sigpapelera.com.ar/Fotos/sin.jpg";
            this.file = null;
        }
    },
    watch: {
        porPrecio(newValue, oldValue) {
            switch (newValue) {
                case "base":
                    //Utilizamos el $nextTick porque en el template usamos disabled de formareactiva y eso hace que haga focus.
                    this.$nextTick(function () {
                        this.$refs.txtPreBas.focus();
                    })
                    break;
                case "venta":
                    this.$nextTick(function () {
                        this.$refs.txtPreVen.focus();
                    })
                    break;
            }
        },
        porTipoFiltro(newValue, oldValue) {
            this.filtro = "";
            this.$refs.txtFiltro.focus();
        },
        vista(newValue, oldValue) {
            this.headerForm.subtitleForm = this.getSubtitulo(newValue);
        }
    },
    computed: {
        ...mapState("ModLayout", ["headerForm"]),
    },
    mounted() {
        this.headerForm.subtitleForm = this.getSubtitulo(this.vista);
        let _self = this;
        _self.overlay = true;
        _self.$axios.get("/api/Articulo/getData").then((response) => {
            let data = response.data.data;

            _self.igv = (parseFloat(data.igv) / 100);

            data.grupos.forEach((elem) => {
                _self.grupos.push({
                    text: elem.nomGrupo,
                    value: elem.idGrupo,
                });
            });

            data.sucursales.forEach((elem) => {
                _self.sucursales.push({
                    flgEnUso: elem.flgEnUso,
                    idSucursal: elem.idSucursal,
                    nomSucursal: elem.nomSucursal,
                    nomAlmacen: elem.nomAlmacen,
                    stockActual: elem.stockActual,
                    direccion: elem.direccion
                });
                _self.sucursalesSeleccionados.push({ idSucursal: elem.idSucursal });
            });

            _self.monedaLocal = data.monedaLocal;

        }).catch((error) => {
            _self.$root.$alertSB(error.response.data.Message, { color: "warning" })
        }).finally(() => {
            _self.overlay = false;
            _self.$refs.txtNomArt.focus();
        })
    }
}