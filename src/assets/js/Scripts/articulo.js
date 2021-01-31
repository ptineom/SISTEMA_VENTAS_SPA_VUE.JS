export default {
    name: "Articulo",
    data() {
        return {
            vista: 2,
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
                    text: "",
                    value: "",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Almacén",
                    value: "",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Stock",
                    value: "",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Sede",
                    value: "",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Dirección",
                    value: "",
                    align: "center",
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
                idMarca: "",
                stockMinimo: "",
                precioCompra: "",
                flgImportado: false,
                flgInactivo: false,
                precioBase: ''
            },
            precioVenta: '',
            precioIgv: '',
            porPrecio: 'venta',
            showFecEmi: false,
            fecEmiFormatted: '',
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
            }).catch((error) => _self.$root.$alertSB(error.response.data.Message, { color: "error" })).finally(() => _self.overlay = false);
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
                correlativo: (this.detalleUmDscto.length + 1),
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

                if(x.flgPromocion){
                    let dscto = x.descuento == '' ? 0: x.descuento;
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
            }else{
                this.$root.$alertSB('No debe de exceder del precio de venta', {
                    color: "warning",
                    right: false,
                });
                item.descuento = 100;
                item.precioVentaFinal = '';
            }
        }
    },
    watch: {
        porPrecio(newValue, oldValue) {
            switch (newValue) {
                case "base":
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
        }
    },
    mounted() {
        let _self = this;
        _self.overlay = true;

        _self.$axios.get("/api/Articulo/getDataAsync").then((response) => {
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
            });


        }).catch((error) => {
            _self.$root.$alertSB(error.response.data.Message, { color: "error" })
        }).finally(() => {
            _self.overlay = false;
            _self.$refs.txtNomArt.focus();
        })
    }
}