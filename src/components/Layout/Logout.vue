<template>
  <div>
    <v-card
      tile
      class="mx-auto"
      style="top: 48px; right: 5px; position: absolute"
      max-width="280"
      width="280"
      outlined
    >
      <v-list-item class="blue-tool-1 d-flex justify-center">
        <v-list-item-avatar size="80">
          <v-img :src="'data:image/jpg;base64,' + this.avatar"></v-img>
        </v-list-item-avatar>
      </v-list-item>
      <v-list-item class="blue-tool-1">
        <v-list-item-content class="text-center pt-0">
          <div class="overline mb-1 white--text">
            Sede: {{ usuario.nomSucursal | capitalize }}
          </div>
          <v-list-item-title class="headline mb-1 white--text">{{
            usuario[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] | capitalize
          }}</v-list-item-title>
          <v-list-item-subtitle class="white--text">{{
            usuario.fullName | capitalize
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          outlined
          color="blue"
          tile
          class="body-2"
          @click="abrirDialogoCamCon($event)"
        >
          Cambiar <br />
          contraseña <v-icon color="orange">mdi-key-variant</v-icon></v-btn
        >
        <v-spacer></v-spacer>

        <v-btn outlined color="blue" tile class="body-2" @click="cambiarSede()"
          >Cambiar <br />
          sede <v-icon color="success">published_with_changes</v-icon></v-btn
        >
      </v-card-actions>

      <v-divider></v-divider>

      <v-card-actions class="cardAction">
        <v-spacer></v-spacer>

        <v-btn text @click="salir()"> Cerrar sesión </v-btn>
        <v-btn
          small
          fab
          @click="salir()"
          color="error"
          class="mr-4"
          title="Cerrar sesión"
          style="cursor: pointer"
        >
          <v-icon>mdi-power</v-icon>
        </v-btn>
      </v-card-actions>

      <CambiarContrasenia></CambiarContrasenia>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import CambiarContrasenia from "./CambiarContrasenia";
export default {
  name: "Logout",
  components: {
    CambiarContrasenia,
  },
  methods: {
    ...mapActions("ModLogin", ["cerrarSesion", "setBCambiarSede"]),
    ...mapActions("ModLayout", ["abrirDialogoCambiarContrasenia"]),
    cambiarSede() {
      this.setBCambiarSede(true);
      this.showLogout = false;
      this.$router.push({ name: "Login" });
    },
    salir() {
      this.showLogout = false;
      this.cerrarSesion();
    },
    abrirDialogoCamCon(event) {
      event.stopPropagation();
      this.abrirDialogoCambiarContrasenia(true);
      this.showLogout = false;
    },
  },
  props: ["value"],
  computed: {
    ...mapState("ModLogin", ["usuario", "avatar"]),
    ...mapState("ModLayout", ["bDialogoCambiarContrasenia"]),
    showLogout: {
      get: function () {
        //Por el momento no se esta usando el get.
        return this.value;
      },
      set: function (newValue) {
        this.$emit("input", newValue);
      },
    },
  },
};
</script>