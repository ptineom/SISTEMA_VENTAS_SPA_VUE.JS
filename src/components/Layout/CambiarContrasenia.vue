<template>
  <div>
    <v-dialog v-model="bDialogoCambiarContrasenia_vx" max-width="550px" persistent>
      <v-card>
        <v-card-title class="headline">
          <span class="headline">Cambiar contraseña</span>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="formCamCon" v-model="valid" lazy-validation>
          <v-card-text class="my-0 py-0">
            <v-container class="pb-0">
              <v-row>
                <v-col cols="3">
                  <v-img src="../../assets/imagenes/key3.jpg"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-row>
                    <v-col cols="12" class="py-0">
                      <v-text-field
                        v-model="modelo.contraseniaAnterior"
                        outlined
                        dense
                        label="Contraseña actual"
                        autofocus
                        @keyup.enter="saltar('txtConNue')"
                        ref="txtConAnt"
                        required
                        :autocomplete="'off'"
                        :rules="rules.contraseniaAnterior"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="py-0">
                      <v-text-field
                        v-model="modelo.contraseniaNueva"
                        outlined
                        dense
                        label="Contraseña nueva"
                        @keyup.enter="saltar('txtRepCon')"
                        ref="txtConNue"
                        required
                        :autocomplete="'off'"
                        :rules="rules.contraseniaNueva"
                        :type="visibilityNC?'text':'password'"
                        :append-icon="visibilityNC ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append="() => (visibilityNC = !visibilityNC)"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="py-0">
                      <v-text-field
                        v-model="modelo.repetirContrasenia"
                        outlined
                        dense
                        label="Confirmar contraseña"
                        ref="txtRepCon"
                        required
                        :autocomplete="'off'"
                        @keyup.enter="cambiarContrasenia()"
                        :rules="rules.repetirContrasenia"
                        :type="visibilityRC?'text':'password'"
                        :append-icon="visibilityRC ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append="() => (visibilityRC = !visibilityRC)"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row>
            <v-col cols="12" class="py-0">
               <ShowError :errors = errors></ShowError>
            </v-col>
          </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="cardAction2">
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              ref="btnGuardar"
              title="Guardar cambios"
              @click="cambiarContrasenia()"
               :disabled="!valid"
            >
              <v-icon>save</v-icon>
            </v-btn>
            <v-btn
              color="error"
              dark
              title="Salir"
              @click="salir()"
            >
              <v-icon>exit_to_app</v-icon>
            </v-btn>
          </v-card-actions>
        </v-form>
        <v-overlay :value="overlay" absolute :opacity="'0.36'">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-card>
    </v-dialog>

  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import ShowError from '../Utilitarios/ShowError'
import axios from "axios";
export default {
  name: "CambiarContrasenia",
  components:{
    ShowError
  },
  methods: {
    ...mapActions("ModLayout", ["setAbrirDialogoCambiarContrasenia_vx"]),
    cambiarContrasenia() {
      let _self = this;
      _self.errors = [];

      let validate = this.$refs.formCamCon.validate();
      if (!validate) 
        return;
        
      let parameters = {
        IdUsuario: _self.usuario_vx.IdUsuario,
        ContraseniaActual: _self.modelo.contraseniaAnterior,
        ContraseniaNueva: _self.modelo.contraseniaNueva,
        RepetirContraseniaNueva: _self.modelo.repetirContrasenia,
      };

      this.$root
        .$confirm("Cambiar contraseña", "¿Desea guardar los cambios?")
        .then(() => {
          //Encendemos el modo de espera.
          _self.overlay = true;

          axios
            .post("api/Usuario/ChangePassword", parameters)
            .then((response) => {
              let resultado = response.data;

              if (!resultado.Resultado) {
                _self.errors.push(resultado.Mensaje);
                return;
              }

              _self.limpiar();
              _self.setAbrirDialogoCambiarContrasenia_vx(false);
              _self.$root.$alertSB("Se grabaron los datos.");
            })
            .catch((error) => {
              _self.errors.push(error.response.data.Message);
            })
            .finally(() => {
              _self.overlay = false;
            });
        })
        .catch(() => {});
    },
    saltar(ref) {
      this.$refs[ref].focus();
    },
    limpiar() {
      this.modelo = {
        contraseniaAnterior: "",
        contraseniaNueva: "",
        repetirContrasenia: "",
      };
      this.$refs.formCamCon.resetValidation();
    },
    salir() {
      this.setAbrirDialogoCambiarContrasenia_vx(false);
      this.limpiar();
    },
  },
  computed: {
    ...mapState("ModLayout", ["bDialogoCambiarContrasenia_vx"]),
    ...mapState("ModLogin", ["usuario_vx"]),
  },
  data() {
    return {
      modelo: {
        contraseniaAnterior: "",
        contraseniaNueva: "",
        repetirContrasenia: "",
      },
      visibilityNC: false,
      visibilityRC: false,
      valid: false,
      errors: [],
      overlay: false,
      rules: {
        contraseniaAnterior: [
          (value) => !!value || "Debe de ingresar la contraseña anterior",
        ],
        contraseniaNueva: [
          (value) => !!value || "Debe de ingresar la contraseña nueva",
          (value) => {
            return (
              (value.toString().length >= 3 && value.toString().length <= 32) ||
              "Debe de tener entre 3 como mímimo y máximo de 32 caracteres"
            );
          },
        ],
        repetirContrasenia: [
          (value) => !!value || "Debe de confirmar la nueva contraseña",
          (value) => {
            return (
              (value.toString().length >= 3 && value.toString().length <= 32) ||
              "Debe de tener entre 3 como mímimo y máximo de 32 caracteres"
            );
          },
          (value) =>
            value == this.modelo.contraseniaNueva ||
            "Debe de coincidir con la contraseña nueva",
        ],
      },
    };
  },
};
</script>