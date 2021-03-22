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
            "guardarInfo",
            "guardarTokens",
            "setBCambiarSede"
        ]),
        ingresar() {
            let validate = this.$refs.form.validate();
            this.errors = [];

            if (validate) {
                let _self = this;

                let parameters = {
                    IdUsuario: _self.login.usuario,
                    Password: _self.login.password
                };

                _self.overlay = true;

                axios
                    .post("api/Login/ValidateUser", parameters)
                    .then((response) => {
                        let resultado = response.data;

                        if (!resultado.Resultado) {
                            _self.errors.push(resultado.Mensaje);
                            return;
                        }

                        //Si tiene una sola sede configurada, se generará el token e irá al home
                        if (!resultado.Data.FlgVariasSedes) {
                            //Guardamos información en el storage de vuex y localstorage: 
                            //token, refreshToken, avatar y menu.
                            _self.guardarInfo({
                                token: resultado.Data.Token,
                                avatarB64: resultado.Data.AvatarB64,
                                menuItem: resultado.Data.MenuItem,
                                refreshToken: resultado.Data.RefreshToken
                            });

                            _self.limpiar();
                        } else {
                            //Si tiene más de una sucursal irá al paso 2 para seleccionar la sucursal.
                            _self.llenarSucursales(resultado.Data.Lista);
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
            this.sucursales = [];
            this.idSucursal = "";
            lista.forEach((elem) => {
                this.sucursales.push({
                    value: elem.IdSucursal,
                    text: elem.NomSucursal,
                });
            });
        },
        recuperarContrasenia(){
            //this.step == 1 => form login
            this.limpiar();
            this.$refs.form.resetValidation();
            this.step = 3;
        },
        retroceder() {
            //this.step == 2 => form seleccionar sede
            //this.step == 3 => form recuperar contraseña

            if (this.step == 2) {
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
                this.limpiar();
                this.$refs.formRec.resetValidation();
                this.step = 1;
            }
        },
        seguir() {
            let _self = this;
            this.errors = [];

            //Pestaña de seleccionar sucursal
            if (this.step == 2) {
                let validate = this.$refs.formSuc.validate();
                if (!validate) return;

                let parameters = {};
                let uri = "";
                let nomSucursal = this.sucursales.find(x => x.value == this.idSucursal).text;

                if (this.bCambiarSede) {
                    parameters = {
                        idSucursal: this.idSucursal,
                        nomSucursal: nomSucursal
                    };
                    uri="api/SucursalUsuario/ChangeSucursal";
                }else{
                    parameters = {
                        idSucursal: this.idSucursal,
                        nomSucursal: nomSucursal,
                        idUsuario: this.login.usuario,
                        password: this.login.password
                    };
                    uri="api/Login/GenerateToken";
                }

                this.overlay = true;

                //Generamos el token
                axios
                    .post(uri, parameters)
                    .then((response) => {
                        let resultado = response.data;

                        if (!resultado.Resultado) {
                            _self.errors.push(resultado.Mensaje);
                            return;
                        }

                        //Guardamos la informacion en el área local.
                        if (this.bCambiarSede) {
                            _self.guardarTokens({
                                token: resultado.Data.Token,
                                refreshToken: resultado.Data.RefreshToken
                            });
                            _self.retroceder();
                        }else{
                             _self.guardarInfo({
                                token: resultado.Data.Token,
                                avatarB64: resultado.Data.AvatarB64,
                                menuItem: resultado.Data.MenuItem,
                                refreshToken: resultado.Data.RefreshToken
                            });
                            _self.limpiar();
                            _self.step = 1;
                        }
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
                        .post("api/Usuario/GenerateTokenRecoveryPassword", { Email: this.email })
                        .then((response) => {
                            let resultado = response.data;

                            if (!resultado.Resultado) {
                                _self.errors.push(resultado.Mensaje);
                                return;
                            }
                            this.retroceder();
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
            sucursales: [],
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
                    "api/SucursalUsuario/GetSucursalesByUserId/" +
                    this.usuario.IdUsuario
                )
                .then((response) => {
                    let resultado = response.data;
                    if (!resultado.Resultado) {
                        console.log(resultado.Mensaje);
                        return;
                    }

                    this.llenarSucursales(resultado.Data);
                })
                .catch((error) => {
                    console.log(error.response);
                });
        }
    },
};
