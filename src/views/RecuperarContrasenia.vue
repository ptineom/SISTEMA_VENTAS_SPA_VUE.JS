<template>
  <v-container fluid>
    <v-row
      style="height: 87vh"
      class="d-flex flex-row align-center justify-center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="5"
        class="d-flex flex-column flex-wrap align-center"
      >
        <v-card
          class="elevation-12 __b-20 rounded-lg"
          width="400"
          max-width="400"
        >
          <v-card-title class="title font-weight-regular ">
            <span>{{titulo}}</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    label="Nueva contraseña"
                    :type="visibility ? 'text' : 'password'"
                    :append-icon="visibility ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="() => (visibility = !visibility)"
                    autofocus
                    v-model="modelo.contrasenia"
                    :rules="rules.contrasenia"
                    @keyup.enter="$refs['txtConCon'].focus()"
                  ></v-text-field>
                  <v-text-field
                    label="Confirmar nueva contraseña"
                    :type="visibilityConfirmar ? 'text' : 'password'"
                    :append-icon="visibilityConfirmar ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="() => (visibilityConfirmar = !visibilityConfirmar)"
                    ref="txtConCon"
                    v-model="modelo.repetirContrasenia"
                    :rules="rules.confirmarContrasenia"
                    @keyup.enter="grabar()"
                  ></v-text-field>
                  <span class="caption grey--text text--darken-1">
                    Por favor ingrese su nueva contraseña y confirmelo.
                  </span>
                </v-form>
              </v-card-text>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-0">
                <p v-if="errors.length" class="red--text px-4">
                <b>Por favor, corrija el(los) siguiente(s) error(es):</b>
                <ul>
                  <li v-for="(error,idx) in errors" :key="idx">{{ error }}</li>
                </ul>
              </p>
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              text
              color="primary"
              class="text-none px-2 __btn-login-text"
              @click="ir()"
              >
              <span >Ir al inicio de sesión</span>
            </v-btn>
            <v-spacer />
            <v-btn
              color="success"
              depressed
              dense
              @click="grabar()"
              :disabled="!valid"
            >
             Restablecer
              <v-icon>mdi-sync</v-icon>
            </v-btn>
          </v-card-actions>

          <v-overlay :value="overlay" absolute :opacity="'0.36'">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from "axios";
export default {
  name: "RecuperarContrasenia",
  data() {
    return {
      modelo: {
        contrasenia: "",
        repetirContrasenia: "",
      },
      titulo: "Restablecer contraseña",
      valid: false,
      errors: [],
      overlay: false,
      visibility: false,
      visibilityConfirmar: false,
      rules: {
        contrasenia: [
          (value) => !!value || "Debe de ingresar la contraseña nueva",
          (value) => {
            return (
              (value.toString().length >= 3 && value.toString().length <= 32) ||
              "Debe de tener entre 3 como mímimo y máximo de 32 caracteres"
            );
          },
        ],
        confirmarContrasenia: [
          (value) => !!value || "Debe de confirmar la contraseña nueva",
          (value) => {
            return (
              (value.toString().length >= 3 && value.toString().length <= 32) ||
              "Debe de tener entre 3 como mímimo y máximo de 32 caracteres"
            );
          },
          (value) =>
            value == this.modelo.contrasenia ||
            "Debe de coincidir con la contraseña nueva",
        ],
      },
    };
  },
  methods: {
    ir() {
      this.$router.push({ name: "Login" });
    },
    grabar() {
      let _self = this;

      let validate = _self.$refs.form.validate();
      if (!validate) return;

      let parameters = {
        NuevaContrasenia: this.modelo.contrasenia,
        RepetirNuevaContrasenia: this.modelo.repetirContrasenia,
        TokenRecuperacionPassword: this.$route.params.id,
      };

      this.errors = [];

      _self.$root
        .$confirm(_self.titulo, "¿Desea guardar los cambios?")
        .then(() => {
          this.overlay = true;

          axios
            .post("api/Usuario/RestorePassword", parameters)
            .then((response) => {
              let resultado = response.data;
              if (!resultado.Resultado) {
                _self.errors.push(resultado.Mensaje);
                return;
              }
              
              _self.$router.push({ name: "Login" });
              this.$root.$alertSB("Se restableció su contraseña.")
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
  },
};
</script>