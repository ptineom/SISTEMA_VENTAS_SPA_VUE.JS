import { mapState } from "vuex";
import DlgMarca from '@/components/Dialogos/DlgMarca'
export default {
    name: "Articulo",
    components: {
        DlgMarca
    },
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
                { text: "Dscto", value: "", align: "center", sortable: false },
                { text: "%", value: "", align: "center", sortable: false, width: "65px" },
                { text: "Precio \n venta final", value: "", align: "center", sortable: false, width: "120px" },
                { text: "Fecha inicio", value: "", align: "center", sortable: false, width: "130px" },
                { text: "Fecha final", value: "", align: "center", sortable: false, width: "130px" },
                { text: "", value: "opciones", align: "center", sortable: false, width: "110px" }
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
            listaSucursal: [],
            listaGrupo: [],
            listaFamilia: [],
            listaUm: [],
            igv: 0,
            modelo: {
                idArticulo: "",
                nomArticulo: "",
                nomVenta: "",
                idGrupo: "",
                idFamilia: "",
                idMarca: "",
                stockMinimo: "",
                precioCompra: "",
                flgImportado: false,
                flgInactivo: false,
                precioBase: '',
                codigoBarra: ''
            },
            nomMarca: '',
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
            imgVacio: require('@/assets/imagenes/no-disponible.jpg'),
            srcImg: this.imgVacio,
            file: null,
            fileSize: '0kb'
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
            _self.listaFamilia = [];
            _self.detalleUmDscto = [];

            _self.$axios.get("/api/Familia/GetAllByGroupIdHelper/" + _self.modelo.idGrupo).then((response) => {
                let familias = response.data.Data;

                familias.forEach((elem) => {
                    _self.listaFamilia.push({
                        text: elem.NomFamilia,
                        value: elem.IdFamilia,
                    });
                });
                _self.modelo.idFamilia = "";
            }).catch((error) => _self.$root.$alertSB(error.response.data.Message, { type: "error" }))
                .finally(() => _self.overlay = false);
        },
        llenarCboUm() {
            let _self = this;
            _self.overlay = true;
            _self.listaUm = [];
            _self.detalleUmDscto = [];

            let uri = `/api/UnidadMedida/GetAllByFamilyId/${_self.modelo.idGrupo}/${_self.modelo.idFamilia}`;
            _self.$axios.get(uri).then((response) => {
                let unidadMedidas = response.data.Data;
                //Cargamos el arrar de UM.
                unidadMedidas.forEach((elem) => {
                    _self.listaUm.push({
                        text: elem.NomUm,
                        value: elem.IdUm,
                    });
                });
                //Agregamos una fila para la tabla Um_dscto.
                _self.agregarUmDscto();
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "error" })
            })
                .finally(() => _self.overlay = false);
        },
        agregarUmDscto(idx) {
            //Hallar correlativo
            let newCorrelativo = 0;
            if (this.detalleUmDscto.length > 0) {
                let correlativos = this.detalleUmDscto.map(x => x.correlativo);
                newCorrelativo = Math.max(...correlativos);
            }
            newCorrelativo = (newCorrelativo + 1);

            this.detalleUmDscto.push({
                idUm: this.listaUm.length > 0 ? this.listaUm[0].value : '',
                nroFactor: "",
                precioVenta: "",
                flgPromocion: false,
                descuento: "",
                precioVentaFinal: "",
                fecInicioPromocion: "",
                fecFinalPromocion: "",
                listaUm: this.listaUm,
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
                            type: "warning",
                        });
                        this.$refs.txtPreVen.focus();
                        return;
                    }

                    if (item.nroFactor == 0) {
                        item.flgPromocion = false;
                        this.$root.$alertSB('Debe de ingresar el factor mayor a cero', {
                            type: "warning",
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

            //Cuando se va actualizar al mismo control que estas editando deberas hacer un nextTick
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
                    type: "warning",
                });
                item.descuento = 100;
                item.precioVentaFinal = '';
            }
        },
        consultar() {
            if (this.filtro == "") {
                this.$root.$alertSB("¡Debe de ingresar al menos un caracter!", { type: "warning" })
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
            _self.$axios.get("/api/Articulo/GetAllByFilters", parameters).then((response) => {
                let articulos = response.data.Data;
                if (articulos != null) {
                    articulos.forEach(x => {
                        _self.detalleConsulta.push({
                            idArticulo: x.IdArticulo,
                            nomArticulo: x.NomArticulo,
                            nomMarca: x.NomMarca,
                            nomGrupo: x.NomGrupo,
                            nomFamilia: x.NomFamilia,
                            codigoBarra: x.CodigoBarra,
                            stockActual: x.StockActual,
                            precioVentaFinal: x.PrecioVentaFinal,
                            flgInactivo: x.FlgInactivo,
                            foto1: x.Foto1,
                            foto2: x.Foto2
                        })
                    });
                }
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
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
                idMarca: "",
                stockMinimo: "",
                precioCompra: "",
                flgImportado: false,
                flgInactivo: false,
                precioBase: ''
            };
            this.nomMarca = "";
            this.precioIgv = "";
            this.precioVenta = "";
            this.detalleUmDscto = [];
            this.sucursalesSeleccionados = this.listaSucursal.map(x => { return { idSucursal: x.idSucursal } });
            //foto
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
                    let nomUm = detUmDscto[i].listaUm.find(x => x.value == detUmDscto[i].idUm).text;

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
                            IdUm: x.idUm, NroFactor: x.nroFactor, Descuento: x.descuento, FlgPromocion: x.flgPromocion,
                            FecInicioPromocion: x.fecIniProFormatted, FecFinalPromocion: x.fecFinProFormatted
                        }
                    })

                    let sucursales = [];
                    _self.sucursalesSeleccionados.forEach(y => {
                        sucursales.push(y.idSucursal);
                    })

                    const formData = new FormData();
                    formData.append("Accion", _self.accion);
                    formData.append("IdArticulo", _self.modelo.idArticulo);
                    formData.append("NomArticulo", _self.modelo.nomArticulo);
                    formData.append("NomVenta", _self.modelo.nomVenta == null ? '' : _self.modelo.nomVenta);
                    formData.append("CodigoBarra", _self.modelo.codigoBarra == null ? '' : _self.modelo.codigoBarra);
                    formData.append("IdGrupo", _self.modelo.idGrupo);
                    formData.append("IdFamilia", _self.modelo.idFamilia);
                    formData.append("IdMarca", _self.modelo.idMarca);
                    formData.append("StockMinimo", _self.modelo.stockMinimo == "" ? 0 : _self.modelo.stockMinimo);
                    formData.append("PrecioCompra", _self.modelo.precioCompra == "" ? 0 : _self.modelo.precioCompra);
                    formData.append("FlgImportado", _self.modelo.flgImportado);
                    formData.append("FlgInactivo", _self.modelo.flgInactivo);
                    formData.append("PrecioBase", _self.modelo.precioBase);
                    formData.append("ArticulosUm", JSON.stringify(UmDscto));
                    formData.append("Sucursales", JSON.stringify(sucursales));
                    formData.append("FileBinary", _self.file)

                    _self.overlay = true;
                    _self.$axios.post("api/Articulo/Register", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((reponse) => {
                        let resultado = reponse.data;

                        if (resultado.Resultado) {
                            _self.$root.$alertSB(resultado.Mensaje, { type: "success" });
                            _self.nuevo();
                        }
                    }).catch((error) => {
                        _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
                    }).finally(() => {
                        _self.overlay = false;
                    })
                }).catch((mensajeError) => {
                    _self.$root.$alertSB(mensajeError, { type: "warning" });
                });
            }).catch((mensajeError) => {
                _self.$root.$alertSB(mensajeError, { type: "warning" });
            })
        },
        obtenerArticuloPorId(idArticulo) {
            let _self = this;
            _self.overlay = true;

            _self.$axios.get(`/api/Articulo/GetById/${idArticulo}`).then((response) => {
                let data = response.data.Data;
                let modelo = data.Modelo;

                if (modelo == null)
                    return;

                _self.limpiar();
                let listaFamilia = data.ListaFamilia;
                let listaUm = data.ListaUm;
                let listaUmDscto = data.ListaArticuloUm;

                _self.modelo.idArticulo = modelo.IdArticulo;
                _self.modelo.nomArticulo = modelo.NomArticulo;
                _self.modelo.nomVenta = modelo.NomVenta;
                _self.modelo.codigoBarra = modelo.CodigoBarra;
                _self.modelo.idMarca = modelo.IdMarca;
                _self.nomMarca = modelo.NomMarca;
                _self.modelo.idGrupo = modelo.IdGrupo;
                _self.modelo.precioCompra = modelo.PrecioCompra;
                _self.modelo.stockMinimo = modelo.StockMinimo;
                _self.modelo.precioBase = modelo.PrecioVenta;
                _self.calcularPrecioVenta(modelo.PrecioVenta);

                //Combo familia
                listaFamilia.forEach((elem) => {
                    _self.listaFamilia.push({
                        text: elem.NomFamilia,
                        value: elem.IdFamilia,
                    });
                });
                _self.modelo.idFamilia = modelo.IdFamilia;

                //Combo Um de la grilla
                listaUm.forEach((elem) => {
                    _self.listaUm.push({
                        text: elem.NomUm,
                        value: elem.IdUm,
                    });
                });

                //Grilla Um/Descuento
                listaUmDscto.forEach(x => {
                    _self.detalleUmDscto.push({
                        idUm: x.IdUm,
                        nroFactor: x.NroFactor,
                        precioVenta: _self.$formatoMiles(x.PrecioVenta, 2),
                        flgPromocion: x.FlgPromocion,
                        descuento: x.Descuento == 0 ? '' : x.Descuento,
                        precioVentaFinal: x.FlgPromocion ? _self.$formatoMiles(x.PrecioVentaFinal, 2) : '',
                        fecInicioPromocion: x.FlgPromocion ? _self.$moment(x.FecInicioPromocion, "DD/MM/YYYY").format("YYYY-MM-DD") : '',
                        fecFinalPromocion: (x.FlgPromocion && x.FecFinalPromocion != "") ? _self.$moment(x.FecFinalPromocion, "DD/MM/YYYY").format("YYYY-MM-DD") : '',
                        listaUm: _self.listaUm,
                        correlativo: (_self.detalleUmDscto.length + 1),
                        fecIniProFormatted: x.FlgPromocion ? x.FecInicioPromocion : "",
                        fecFinProFormatted: x.FlgPromocion ? x.FecFinalPromocion : "",
                        showFecIniPro: false,
                        showFecFinPro: false
                    });
                });

                //Grilla sucursales
                _self.sucursalesSeleccionados = data.ListaSucursal.filter(x => x.FlgEnUso).map(y => {
                    return { idSucursal: y.IdSucursal }
                });

                //Cargar imagen
                if (!!modelo.Foto1) {
                    let filename = modelo.Foto1.slice(modelo.Foto1.lastIndexOf("\\") + 1);
                    let fotoB64 = `${"data:image/jpg;base64,"}${modelo.FotoB64}`
                    let file = _self.$dataURLtoFile(fotoB64, filename);
                    _self.srcImg = fotoB64;
                    _self.fileSize = (file.size / 1024).toFixed(2) + " Kb";
                    _self.file = file;
                } else {
                    _self.srcImg = _self.imgVacio;
                }

                //Vista mantenimiento
                _self.vista = 2;

                this.accion = "UPD";
            }).catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
            }).finally(() => {
                _self.overlay = false;
                _self.$refs.txtNomArt.focus();
            });
        },
        eliminar(idArticulo, correlativo) {
            let _self = this;

            _self.$root.$confirm(_self.titulo, "¿Desea anular el registro?").then((response) => {
                _self.overlay = true;

                _self.$axios.post(`/api/Articulo/Delete/${idArticulo}`).then((reponse) => {
                    let resultado = reponse.Data;

                    if (resultado.Resultado) {
                        let idx = _self.detalleConsulta.findIndex(x => x.correlativo == correlativo);
                        _self.detalleConsulta.splice(idx, 1);
                        _self.$root.$alertSB(resultado.Mensaje, { type: "success" });
                    }
                }).catch((error) => {
                    _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
                }).finally(() => {
                    _self.overlay = false;
                })
            }).catch((error) => {
                _self.$root.$alertSB(error, { type: "warning" })
            })
        },
        getFile(e) {
            let input = e.target;
            let _self = this;

            if (input.files.length > 0) {
                let foto = input.files[0];
                let fr = new FileReader();
                fr.onload = (function () {
                    _self.srcImg = fr.result;
                });
                fr.readAsDataURL(foto);
                _self.file = foto;
                _self.fileSize = `${(foto.size / 1024).toFixed(2)} Kb`;
            }
        },
        limpiarFoto() {
            this.srcImg = this.imgVacio;
            this.file = null;
            this.fileSize = "0 Kb";
        },
        cancelar() {
            this.vista = 1;
            this.filtro = "";
            this.detalleConsulta = [];
            this.$refs.txtFiltro.focus();
            this.porTipoFiltro = "descripcion";
        },
        abrirDlgMarca(vista) {
            let _self = this;
            this.$refs.dlgMarca.show(vista).then((marca) => {
                _self.modelo.idMarca = marca.idMarca;
                _self.nomMarca = marca.nomMarca;
            }).catch(() => { });
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
        _self.$axios.get("/api/Articulo/GetData").then((response) => {
            let data = response.data.Data;

            _self.igv = (parseFloat(data.Igv) / 100);

            data.ListaGrupo.forEach((elem) => {
                _self.listaGrupo.push({
                    text: elem.NomGrupo,
                    value: elem.IdGrupo,
                });
            });

            data.ListaSucursal.forEach((elem) => {
                _self.listaSucursal.push({
                    flgEnUso: elem.FlgEnUso,
                    idSucursal: elem.IdSucursal,
                    nomSucursal: elem.NomSucursal,
                    nomAlmacen: elem.NomAlmacen,
                    stockActual: elem.StockActual,
                    direccion: elem.Direccion
                });
                _self.sucursalesSeleccionados.push({ idSucursal: elem.IdSucursal });
            });

            _self.monedaLocal = {
                idMoneda: data.MonedaLocal.IdMoneda,
                nomMoneda: data.MonedaLocal.NomMoneda,
                sgnMoneda: data.MonedaLocal.SgnMoneda
            };

        }).catch((error) => {
            _self.$root.$alertSB(error.response.data.Message, { type: "warning" })
        }).finally(() => {
            _self.overlay = false;
            _self.$refs.txtNomArt.focus();
        })
    }
}