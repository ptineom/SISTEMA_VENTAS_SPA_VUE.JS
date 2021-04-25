<template>
  <v-app id="app">
    <v-card tile>
      <!-- <vuescroll :ops="ops">
      </vuescroll> -->
      <v-navigation-drawer
        v-model="drawer"
        :absolute="$vuetify.breakpoint.xsOnly"
        :temporary="$vuetify.breakpoint.xsOnly"
        :permanent="!$vuetify.breakpoint.xsOnly"
        :mini-variant.sync="miniVariant"
        app
        dark
        color="#222d32"
        v-if="showLayout_vx"
        id="menu"
      >
        <v-list-item class="blue-tool-2 text-center">
          <v-list-item-content>
            <v-list-item-title> Ferretería san cristobal  </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img :src="'data:image/jpg;base64,' + this.avatar_vx"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="subtitle-1">{{
              usuario_vx.FullName | capitalize
            }}</v-list-item-title>
            <v-list-item-subtitle class="subtitle-2">{{
              usuario_vx[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] | capitalize
            }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-btn icon @click.stop="appBarStop">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-divider></v-divider>

        <v-list dense>
          <Menu
            v-for="(elem, idx) in arrMenuItem_vx"
            :key="idx"
            :menuItem="elem"
          ></Menu>
        </v-list>
      </v-navigation-drawer>
    </v-card>

    <v-app-bar dense app color="blueTool1" v-if="showLayout_vx">
      <v-app-bar-nav-icon
        @click.stop="appBarStop"
        class="blue-tool-2"
        dark
      ></v-app-bar-nav-icon>

      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <span class="hidden-sm-and-down white--text"
          >SPA - Sistemas de ventas</span
        >
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-badge
        bordered
        :color="cajaAbierta_vx ? 'success' : 'warning'"
        :icon="cajaAbierta_vx ? 'lock_open' : 'mdi-lock'"
        overlap
        bottom
        left
        id="bdgCaja"
      >
        <v-btn
          @click="abrirAperturarCaja()"
          class="white--text"
          :color="cajaAbierta_vx ? 'success' : 'warning'"
          depressed
        >
          Caja
        </v-btn>
      </v-badge>
      <v-btn icon dark>
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <v-btn
        tile
        large
        @click="bShowLogout = !bShowLogout"
        dark
        class="blueTool2 elevation-0"
      >
        <v-avatar size="36">
          <v-img :src="'data:image/jpg;base64,' + this.avatar_vx"></v-img>
        </v-avatar>
        <span
          class="text-caption ml-2 text-truncate d-none d-sm-block"
          style="width: 140px"
          >{{ usuario_vx.FullName | capitalize }}</span
        >
      </v-btn>
      <!-- Estamos emitiendo un valor desde el hijo al padre  -->
      <!-- v-model hace la combinacion de props y $event -->
      <logout v-show="bShowLogout" v-model="bShowLogout"></logout>
    </v-app-bar>

    <v-main class="color-fondo">
      <v-container fluid class="px-2 py-0">
        <v-row v-show="showLayout_vx">
          <v-col class="py-1" cols="12" md="6">
            <div class="font-weight-bold pl-2 text-h5">
              <v-icon style="vertical-align: text-top">
                {{ headerForm_vx.iconForm }}
              </v-icon>
              {{ !!headerForm_vx.titleForm ? headerForm_vx.titleForm : "Home" }}
              <span class="font-italic text-body-2 text--disabled">{{
                headerForm_vx.subtitleForm
              }}</span>
            </div>
          </v-col>

          <v-col
            class="py-0 text-right d-none d-md-inline-block"
            cols="12"
            md="6"
          >
            <v-breadcrumbs
              :items="headerForm_vx.breadcrumbs"
              class="pa-2 d-inline-block"
            >
              <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-breadcrumbs>
          </v-col>
        </v-row>
        <!-- Aqui se mostrará todas las vistas -->
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Componentes que se utilizará en todas las vistas -->
    <Confirm ref="confirm"></Confirm>
    <AlertSB ref="alertSB"></AlertSB>
    <DlgAperturarCaja ref="dlgAperturarCaja"></DlgAperturarCaja>

  </v-app>
</template>

<script>
import Menu from "./components/Layout/Menu";
import Confirm from "./components/Utilitarios/Confirm";
import AlertSB from "./components/Utilitarios/AlertSB";
import Logout from "./components/Layout/Logout";

import { mapState, mapActions, mapGetters } from "vuex";
import vuescroll from "vuescroll";
import DlgAperturarCaja from "@/components/Dialogos/DlgAperturarCaja";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

/* Configurando signalr*/
let baseUrl = `http://localhost:53568/cambiarestadocajahub`;
var connection = null;
/* ------------------------------ */

export default {
  components: {
    Confirm,
    Menu,
    AlertSB,
    Logout,
    vuescroll,
    DlgAperturarCaja,
  },
  data() {
    return {
      drawer: false,
      mini: true,
      bShowLogout: false,
    };
  },
  computed: {
    miniVariant() {
      if (this.$vuetify.breakpoint.xsOnly) this.mini = false;

      return this.mini;
    },
    ...mapState("ModLogin", ["arrMenuItem_vx", "usuario_vx", "avatar_vx"]),
    ...mapGetters("ModLogin", ["showLayout_vx", "isAuthenticated_vx"]),
    ...mapState("ModLayout", ["headerForm_vx"]),
    ...mapState("ModCajaApertura", ["modeloCajaApertura_vx"]),
    ...mapGetters("ModCajaApertura",["cajaAbierta_vx"])
  },
  methods: {
    ...mapActions("ModLogin", ["autoLogin_vx"]),
    ...mapActions("ModCajaApertura", ["verificarEstadoCaja_vx"]),
    appBarStop() {
      this.drawer = !this.drawer;
      if (this.$vuetify.breakpoint.name != "xs") {
        this.mini = !this.mini;
      }
    },
    abrirAperturarCaja() {
      let gg = this.$route;
      console.log(gg.data.test)
      debugger;
      this.$refs.dlgAperturarCaja.show();
    },
    async start() {
      try {
        await connection.start();
      } catch (err) {
        setTimeout(() => this.start(), 5000);
      }
    },
  },
  watch: {
    isAuthenticated_vx(val){
      if (val) {
        //**************** Conección a signalr ********************/

        //Configuramos la conección servidor signalr, enviando el token_access
        connection = new HubConnectionBuilder()
          .withUrl(baseUrl, {
            accessTokenFactory: () =>
              localStorage.getItem("tokenSPA_SistemaVentas"),
          }).build();

        //Iniciamos la conección
        connection
          .start()
          .then(() => {
            console.log("Signalr conectado");
          })
          .catch((error) => {
            console.error(error.toString());
            setTimeout(() => this.start(), 5000);
          });

        connection.onclose(async () => this.start());

        //Método que se invocará desde el servidor.
        connection.on("actualizarEstadoCaja", () => {
          this.verificarEstadoCaja_vx();
        });
        /********** Fin de la configuración de signalr ************/

        //Mostramos el estado de la caja
        this.verificarEstadoCaja_vx();
      }
    }
  },
  mounted() {
    this.$root.$confirm = this.$refs.confirm.open;
    this.$root.$alertSB = this.$refs.alertSB.show;
  },
  created() {
    this.autoLogin_vx();
  },
};
</script>

<style >
@import "./assets/css/style.css";

.v-navigation-drawer__content .v-list .v-list-item__icon {
  margin-right: 10px !important;
}

#bdgCaja i {
  font-size: 20px;
}
#bdgCaja .v-badge__badge {
  inset: calc(100% - 15px) calc(100% - 15px) auto auto !important;
  height: 27px;
}

/* ::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar {
  width: 6px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #222d32;
} */
</style>