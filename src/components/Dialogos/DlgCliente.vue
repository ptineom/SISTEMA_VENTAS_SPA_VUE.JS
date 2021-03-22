<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="700px" scrollable persistent>
      <v-card>
        <v-card-title>
          <span class="headline text-button">
            <v-icon> mdi-account-multiple </v-icon>
            Registro de clientes
          </span>
          <v-spacer></v-spacer>
          <v-icon style="cursor: pointer" @click="salir"
            >mdi-window-close</v-icon
          >
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-1 px-3">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="4" class="pb-0">
                <v-select
                  dense
                  label="Tipo documento"
                  outlined
                  :items="listaTipoDocumento"
                  @change="seleccionarTipoDocumento()"
                  v-model="modelo.idTipoDocumento"
                  autofocus
                  :rules="reglas.idTipoDocumento"
                ></v-select>
              </v-col>
              <v-col cols="4" class="pb-0">
                <v-text-field
                  label="Número"
                  type="text"
                  outlined
                  dense
                  @keypress="$soloNumerosEnteros($event)"
                  :autocomplete="'off'"
                  :maxlength="getMaxDigitos"
                  ref="txtDocumento"
                  v-model="modelo.nroDocumento"
                  :rules="reglas.nroDocumento"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pb-0">
                <v-checkbox
                  label="Persona natural"
                  hide-details
                  class="shrink mr-0 mt-0"
                  v-model="modelo.flgPersonaNatural"
                  ref="chkPerNat"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row v-show="modelo.flgPersonaNatural">
              <v-col cols="6" class="py-0">
                <v-text-field
                  label="Apellido paterno"
                  type="text"
                  outlined
                  dense
                  ref="txtApePat"
                  v-model="modelo.apellidoPaterno"
                  @keyup.enter="$refs.txtApeMat.focus()"
                  class="upper-case"
                  required
                  :rules="reglas.apellidoPaterno"
                ></v-text-field>
              </v-col>
              <v-col cols="6" class="py-0">
                <v-text-field
                  label="Apellido materno"
                  type="text"
                  outlined
                  dense
                  ref="txtApeMat"
                  v-model="modelo.apellidoMaterno"
                  @keyup.enter="$refs.txtNombres.focus()"
                  class="upper-case"
                  :rules="reglas.apellidoMaterno"
                ></v-text-field>
              </v-col>
              <v-col cols="8" class="py-0">
                <v-text-field
                  label="Nombres"
                  type="text"
                  outlined
                  dense
                  ref="txtNombres"
                  v-model="modelo.nombres"
                  class="upper-case"
                  :rules="reglas.nombres"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pt-0">
                <v-radio-group
                  v-model="modelo.sexo"
                  row
                  class="mt-0"
                  :rules="reglas.sexo"
                >
                  <template v-slot:label>
                    <div>Sexo</div>
                  </template>
                  <v-radio label="M" value="M"></v-radio>
                  <v-radio label="F" value="F"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>

            <v-row v-show="!modelo.flgPersonaNatural">
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="Razón social"
                  type="text"
                  outlined
                  dense
                  ref="txtRazSoc"
                  v-model="modelo.razonSocial"
                  :rules="reglas.razonSocial"
                  @keyup.enter="$refs.txtContacto.focus()"
                  class="upper-case"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="Contacto"
                  type="text"
                  outlined
                  dense
                  v-model="modelo.contacto"
                  ref="txtContacto"
                  @keyup.enter="$refs.txtEmail.focus()"
                  class="upper-case"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="8" class="py-0">
                <v-text-field
                  label="Email"
                  type="text"
                  outlined
                  dense
                  ref="txtEmail"
                  @keyup.enter="$refs.txtTelefono.focus()"
                  :rules="reglas.email"
                  v-model="modelo.email"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pt-0">
                <v-text-field
                  label="Teléfono"
                  type="text"
                  outlined
                  dense
                  hide-details
                  @keypress="$soloNumerosEnteros($event)"
                  ref="txtTelefono"
                  v-model="modelo.telefono"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pt-0">
                <v-select
                  dense
                  label="Departamento"
                  outlined
                  required
                  hide-details
                  :items="listaDepartamento"
                  v-model="modelo.idDepartamento"
                  @change="seleccionarDepartamento()"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="4" class="pt-0">
                <v-select
                  dense
                  label="Provincia"
                  outlined
                  required
                  hide-details
                  :items="listaProvincia"
                  v-model="modelo.idProvincia"
                  @change="seleccionarProvincia()"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="4" class="pt-0">
                <v-select
                  dense
                  label="Distrito"
                  outlined
                  required
                  hide-details
                  v-model="modelo.idDistrito"
                  :items="listaDistrito"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" class="pt-0">
                <v-text-field
                  label="Dirección"
                  type="text"
                  outlined
                  dense
                  hide-details
                  v-model="modelo.direccion"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="cardAction2">
          <v-spacer></v-spacer>
          <v-btn color="error" @click="salir"
            ><v-icon>exit_to_app</v-icon> Salir</v-btn
          >
          <v-btn color="success" @click="grabar"
            ><v-icon>save</v-icon> Grabar
          </v-btn>
        </v-card-actions>
        <v-overlay :value="overlay" absolute :opacity="'0.36'">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <alerta ref="alerta"></alerta>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import alerta from "@/components/Utilitarios/AlertSB";
export default {
  components: { alerta },
  data() {
    return {
      dialog: false,
      resolve: null,
      reject: null,
      valid: false,
      overlay: false,
      modelo: {
        idTipoDocumento: "",
        nroDocumento: "",
        flgPersonaNatural: false,
        sexo: "",
        idDepartamento: "-1",
        idProvincia: "-1",
        idDistrito: "-1",
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombres: "",
        razonSocial: "",
        contacto: "",
        email: "",
        telefono: "",
        direccion: "",
      },
      overlay: false,
      listaProvincia: [],
      listaDistrito: [],
      reglas: {
        idTipoDocumento: [
          (value) => !!value || "Debe de seleccionar el tipo de doc.",
        ],
        nroDocumento: [(value) => !!value || "Debe de ingresar el n° de doc."],
        razonSocial: [
          (value) => {
            let existeValor = !!value;
            if (!this.modelo.flgPersonaNatural && !existeValor) {
              return "Debe de ingresar la razón social.";
            }
            return true;
          },
        ],
        apellidoPaterno: [
          (value) => {
            let existeValor = !!value;
            if (this.modelo.flgPersonaNatural && !existeValor) {
              return "Debe de ingresar el apellido paterno.";
            }
            return true;
          },
        ],
        apellidoMaterno: [
          (value) => {
            let existeValor = !!value;
            if (this.modelo.flgPersonaNatural && !existeValor) {
              return "Debe de ingresar el apellido materno.";
            }
            return true;
          },
        ],
        nombres: [
          (value) => {
            let existeValor = !!value;
            if (this.modelo.flgPersonaNatural && !existeValor) {
              return "Debe de ingresar el nombre.";
            }
            return true;
          },
        ],
        sexo: [
          (value) => {
            let existeValor = !!value;
            if (this.modelo.flgPersonaNatural && !existeValor) {
              return "Debe de seleccionar el sexo.";
            }
            return true;
          },
        ],
        email: [
          (value) => {
            if (!!value && !this.$isValidEmail(value)) {
              return "Debe de ingresar un formato de email correcto.";
            }
            return true;
          },
        ],
      },
    };
  },
  props: ["listaTipoDocumento", "listaDepartamento"],
  methods: {
    show() {
      let _self = this;
      _self.dialog = true;

      return new Promise((resolve, reject) => {
        _self.resolve = resolve;
        _self.reject = reject;
      });
    },
    salir() {
      this.dialog = false;
      this.reject();
    },
    seleccionarTipoDocumento() {
      this.modelo.nroDocumento = "";
      this.$refs.txtDocumento.focus();
    },
    grabar() {
      let _self = this;

      let validate = _self.$refs.form.validate();
      if (validate) {
        _self.overlay = true;

        let parameters = {
          IdTipoDocumento: _self.modelo.idTipoDocumento,
          NroDocumento: _self.modelo.nroDocumento,
          FlgPersonaNatural: _self.modelo.flgPersonaNatural,
          RazonSocial: _self.modelo.razonSocial,
          Contacto: _self.modelo.contacto,
          ApellidoPaterno: _self.modelo.apellidoPaterno,
          ApellidoMaterno: _self.modelo.apellidoMaterno,
          Nombres: _self.modelo.nombres,
          Sexo: _self.modelo.sexo,
          Email: _self.modelo.email,
          Telefono: _self.modelo.telefono,
          Direccion: _self.modelo.direccion,
          IdDistrito: _self.modelo.idDistrito
        };

        _self.$axios
          .post("/api/Cliente/Register", parameters)
          .then((response) => {
            let idCliente = response.data.Data;
            let nomCliente = "";

            if(_self.modelo.flgPersonaNatural)
              nomCliente = `${_self.modelo.apellidoPaterno} ${_self.modelo.apellidoMaterno} ${_self.modelo.nombres}`
            else
              nomCliente = _self.modelo.razonSocial;

            _self.resolve({
              idTipoDocumento: _self.modelo.idTipoDocumento,
              nroDocumento: _self.modelo.nroDocumento,
              idCliente: idCliente,
              nomCliente: nomCliente
            })
          })
          .catch((error) => {
            _self.$refs.alerta.show(error.response.data.Message, {
              type: "warning",
            });
          })
          .finally(() => {
             _self.overlay = false;
             _self.dialog = false;
          });
      }
    },
    limpiarRazonSocial(isPersonaNatural) {
      if (isPersonaNatural) {
        this.modelo.apellidoPaterno = "";
        this.modelo.apellidoMaterno = "";
        this.modelo.nombres = "";
        this.modelo.sexo = "";
      } else {
        this.modelo.razonSocial = "";
        this.modelo.contacto = "";
      }
    },
    seleccionarDepartamento() {
      let _self = this;

      _self.listaProvincia = [];
      _self.listaDistrito = [];

      if (!!!_self.modelo.idDepartamento) return;

      _self.overlay = true;

      _self.$axios
        .get(`/api/Ubigeo/GetAllProvinces/${_self.modelo.idDepartamento}`)
        .then((response) => {
          let data = response.data.Data;
          _self.listaProvincia = data.map((x) => {
            return {
              value: x.IdProvincia,
              text: x.NomProvincia,
            };
          });
        })
        .catch((error) => {
          _self.$refs.alerta.show(error.response.data.Message, {
            type: "warning",
          });
        })
        .finally(() => {
          _self.overlay = false;
        });
    },
    seleccionarProvincia() {
      let _self = this;

      _self.listaDistrito = [];
      if (!!!_self.modelo.idProvincia) return;

      _self.overlay = true;

      _self.$axios
        .get(`/api/Ubigeo/GetAllDistricts/${_self.modelo.idProvincia}`)
        .then((response) => {
          let data = response.data.Data;
          _self.listaDistrito = data.map((x) => {
            return {
              value: x.IdDistrito,
              text: x.NomDistrito,
            };
          });
        })
        .catch((error) => {
          _self.$refs.alerta.show(error.response.data.Message, {
            type: "warning",
          });
        })
        .finally(() => {
          _self.overlay = false;
        });
    },
  },
  watch: {
    "modelo.flgPersonaNatural"(newValue) {
      this.limpiarRazonSocial(newValue);

      if (newValue) {
        this.$nextTick(() => {
          this.$refs.txtApePat.focus();
        });
      } else {
        this.$nextTick(() => {
          this.$refs.txtRazSoc.focus();
        });
      }
    },
    dialog(newValue) {
      if (!newValue) {
        this.modelo = {
          idTipoDocumento: "",
          nroDocumento: "",
          flgPersonaNatural: false,
          sexo: "",
          idDepartamento: "-1",
          idProvincia: "-1",
          idDistrito: "-1",
          apellidoPaterno: "",
          apellidoMaterno: "",
          nombres: "",
          razonSocial: "",
          contacto: "",
          email: "",
          telefono: "",
          direccion: "",
        };
        this.$refs.form.resetValidation();
      }
    },
  },
  computed: {
    getMaxDigitos() {
      let obj = this.listaTipoDocumento.find(
        (x) => x.value == this.modelo.idTipoDocumento
      );
      return obj != undefined ? obj.maxDigitos : 25;
    },
  },
};
</script>

