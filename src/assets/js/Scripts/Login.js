import { mapActions, mapState } from "vuex";
import axios from "axios";
import ShowError from "../../../components/Utilitarios/ShowError";
//step:1 => pantalla de inicio de sesión.
//step:2 => pantalla de seleccionar sede.
//step:3 => pantalla de recuperar contraseña.
export default {
    name: "Login",
    components: {
        ShowError,
    },
    computed: {
        ...mapState("ModLogin", ["usuario", "arrSedes", "bCambiarSede"]),
        getTitulo() {
            if (this.step == 2) {
                return "Seleccione la sede";
            } else if (this.step == 3) {
                return "Recuperación de contraseña";
            }
        },
        getIcono() {
            if (this.step == 2) {
                return "mdi-check-all";
            } else if (this.step == 3) {
                return "mark_email_read";
            }
        },
        getValid() {
            if (this.step == 2) {
                return this.validSuc;
            } else if (this.step == 3) {
                return this.validRec;
            } else {
                return "";
            }
        },
    },
    methods: {
        ...mapActions("ModLogin", [
            "guardarToken",
            "setBCambiarSede",
            "saveAvatar",
            "saveArrMenuItem",
            "saveRefreshToken"
        ]),
        ingresar() {
            let validate = this.$refs.form.validate();
            this.errors = [];

            if (validate) {
                let _self = this;

                let parameters = {
                    idUsuario: _self.login.usuario,
                    password: _self.login.password,
                };

                _self.overlay = true;

                axios
                    .post("api/Login/accederAsync", parameters)
                    .then((response) => {
                        let resultado = response.data;

                        if (!resultado.bResultado) {
                            _self.errors.push(resultado.sMensaje);
                            return;
                        }

                        //Si tiene una sola sede configurada, se generará el token e irá al home
                        if (!resultado.data.bVariasSedes) {
                            //Guardamos el token, avatar y el menu en el localstorage y en una variable global.
                            _self.guardarToken(resultado.data.token);
                            _self.saveAvatar(resultado.data.avatarB64);
                            _self.saveArrMenuItem(resultado.data.menuItem);
                            _self.saveRefreshToken(resultado.data.refreshToken);
                            _self.limpiar();
                        } else {
                            //Si tiene más de una sucursal irá al paso 2 para seleccionar la sucursal.
                            _self.llenarSucursales(resultado.data.lista);
                            _self.step = 2;
                        }
                    })
                    .catch((error) => {
                        _self.errors.push(error.response.data.Message);
                    })
                    .finally(() => {
                        _self.overlay = false;
                    });
            }
        },
        llenarSucursales(lista) {
            //Construímos el array de sucursales.
            this.arrSedesL = [];
            this.idSucursal = "";
            lista.forEach((elem) => {
                this.arrSedesL.push({
                    value: elem.ID_SUCURSAL,
                    text: elem.NOM_SUCURSAL,
                });
            });
        },
        botonSecundario() {
            //formulario de logueo.
            if (this.step == 1) {
                this.limpiar();
                this.$refs.form.resetValidation();
                this.step = 3;
            } else if (this.step == 2) {
                //Formulario de seleccionar sucursales:
                //Si hemos llegado a este formulario mediante el componente logout y la opción cambiar sede.
                this.limpiar();

                if (this.bCambiarSede) {
                    //Inicializamos la variable y no redirijimos al route anterior.
                    this.setBCambiarSede(!this.bCambiarSede);
                    this.$router.go(-1);
                } else {
                    this.$refs.formSuc.resetValidation();
                    this.step = 1;
                }
            } else if (this.step == 3) {
                //Formulario recuperar contraseña.
                this.limpiar();
                this.$refs.formRec.resetValidation();
                this.step = 1;
            }
        },
        seguir() {
            let _self = this;
            this.errors = [];

            //Pestaña del login
            if (this.step == 1) {
                this.step++;
            } else if (this.step == 2) {
                //Pestaña de seleccionar sucursal
                let validate = this.$refs.formSuc.validate();
                if (!validate) return;

                let cbo = this.$refs["cboSucursal"];
                let parameters = {
                    idSucursal: this.idSucursal,
                    nomSucursal: cbo.selectedItems[0].text,
                    idUsuario: this.login.usuario,
                    password: this.login.password
                };

                this.overlay = true;

                //Generamos el token
                axios
                    .post("api/Login/generarTokenAsync", parameters)
                    .then((response) => {
                        let resultado = response.data;

                        if (!resultado.bResultado) {
                            _self.errors.push(resultado.sMensaje);
                            return;
                        }
                        //Guardamos el token, avatar y el menu en el localstorage y en una variable global.
                        _self.guardarToken(resultado.data.token);
                        _self.saveAvatar(resultado.data.avatarB64);
                        _self.saveArrMenuItem(resultado.data.menuItem);
                        _self.saveRefreshToken(resultado.data.refreshToken);

                        _self.limpiar();
                        _self.step = 1;
                    })
                    .catch((error) => {
                        _self.errors.push(error.response.data.Message);
                    })
                    .finally(() => {
                        _self.overlay = false;
                    });
            } else if (this.step == 3) {
                //Pestaña de recuperar contraseña
                let validate = this.$refs.formRec.validate();
                if (validate) {
                    this.overlay = true;

                    axios
                        .post("api/Usuario/generarTokenRecuperacion", { Email: this.email })
                        .then((response) => {
                            let resultado = response.data;

                            if (!resultado.bResultado) {
                                _self.errors.push(resultado.sMensaje);
                                return;
                            }
                            this.botonSecundario();
                            this.$root.$alertSB("Se envió el correo al destino ingresado.");
                        })
                        .catch((error) => {
                            _self.errors.push(error.response.data.Message);
                        })
                        .finally(() => {
                            _self.overlay = false;
                        });
                }
            }
        },
        limpiar() {
            if (this.step == 1) {
                this.login = { usuario: "", password: "" };
            } else if (this.step == 2) {
                this.idSucursal = "";
            } else if (this.step == 3) {
                this.email = "";
            }
        },
    },
    data() {
        return {
            show: true,
            step: 1,
            visibility: false,
            valid: false,
            validSuc: false,
            validRec: false,
            overlay: false,
            arrSedesL: [],
            idSucursal: "",
            email: "",
            login: {
                usuario: "",
                password: "",
            },
            reglas: {
                usuario: [(value) => !!value || "Debe de ingresar el usuario"],
                password: [(value) => !!value || "Debe de ingresar la contraseña"],
                sucursal: [(value) => !!value || "Debe de seleccionar una sede"],
                email: [(value) => !!value || "Debe de ingresar el email"],
            },
            errors: [],
        };
    },
    mounted() {
        this.errors = [];
        //Cada vez que tenga bCambiarSede = true, quiere decir que viene desde el componente logout
        //y opción cambiar Sede. Se listarán las sucursales.
        if (this.bCambiarSede) {
            this.step = 2;
            axios
                .get(
                    "api/SucursalUsuario/listaSucursalPorUsuarioAsync/" +
                    this.usuario.idUsuario
                )
                .then((response) => {
                    let resultado = response.data;
                    if (!resultado.bResultado) {
                        console.log(resultado.sMensaje);
                        return;
                    }

                    this.llenarSucursales(resultado.data);
                })
                .catch((error) => {
                    console.log(error.response);
                });
        }
    },
};
