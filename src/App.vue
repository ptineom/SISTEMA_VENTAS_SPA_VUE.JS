<template>
  <v-app id="app">
    <v-card tile>
      <vuescroll :ops="ops">
        <v-navigation-drawer
          v-model="drawer"
          :absolute="$vuetify.breakpoint.xsOnly"
          :temporary="$vuetify.breakpoint.xsOnly"
          :permanent="!$vuetify.breakpoint.xsOnly"
          :mini-variant.sync="miniVariant"
          app
          dark
          color="#222d32"
          v-if="showLayout"
          id="menu"
        >
          <v-list-item class="blue-tool-2 text-center">
            <v-list-item-content>
              <v-list-item-title> Ferretería san cristobal </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="px-2">
            <v-list-item-avatar>
              <v-img :src="'data:image/jpg;base64,' + this.avatar"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="subtitle-1">{{
                usuario.fullName | capitalize
              }}</v-list-item-title>
              <v-list-item-subtitle class="subtitle-2">{{
                usuario[
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
              v-for="(elem, idx) in arrMenuItem"
              :key="idx"
              :menuItem="elem"
            ></Menu>
          </v-list>
        </v-navigation-drawer>
      </vuescroll>
    </v-card>

    <v-app-bar dense app color="blueTool1" v-if="showLayout">
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
      <v-btn icon dark>
        <v-icon>mdi-apps</v-icon>
      </v-btn>
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
          <v-img :src="'data:image/jpg;base64,' + this.avatar"></v-img>
        </v-avatar>
        <span
          class="text-caption ml-2 text-truncate d-none d-sm-block"
          style="width: 140px"
          >{{ usuario.fullName | capitalize }}</span
        >
      </v-btn>
      <!-- Estamos emitiendo un valor desde el hijo al padre  -->
      <!-- v-model hace la combinacion de props y $event -->
      <logout v-show="bShowLogout" v-model="bShowLogout"></logout>
    </v-app-bar>

    <v-main class="color-fondo">
      <v-container fluid class="px-3 py-0">
        <v-row v-show="showLayout">
          <v-col class="py-1" cols="12" md="6">
            <div class="font-weight-bold pl-2 text-h5">
              <v-icon style="vertical-align: text-top">
                {{ headerForm.iconForm }}
              </v-icon>
              {{ !!headerForm.titleForm ? headerForm.titleForm : "Home" }}
              <span class="font-italic text-body-2 text--disabled">{{
                headerForm.subtitleForm
              }}</span>
            </div>
          </v-col>
          <v-col class="py-0 text-right" cols="12" md="6">
            <v-breadcrumbs
              :items="headerForm.breadcrumbs"
              class="d-flex justify-end pa-2"
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
  </v-app>
</template>

<script>
import Menu from "./components/Layout/Menu";
import Confirm from "./components/Utilitarios/Confirm";
import AlertSB from "./components/Utilitarios/AlertSB";
import Logout from "./components/Layout/Logout";

import { mapState, mapActions, mapGetters } from "vuex";
import vuescroll from "vuescroll";
export default {
  components: {
    Confirm,
    Menu,
    AlertSB,
    Logout,
    vuescroll,
  },
  data() {
    return {
      arrMenu: [],
      drawer: false,
      mini: true,
      bShowLogout: false,
      ops: {
        // vuescroll: {
        //   mode: "native",
        //   sizeStrategy: "percent",
        //   detectResize: true,
        //   /** Enable locking to the main axis if user moves only slightly on one of them at start */
        //   locking: true,
        // },
        // scrollPanel: {
        //   initialScrollY: false,
        //   initialScrollX: false,
        //   scrollingX: true,
        //   scrollingY: true,
        //   speed: 300,
        //   easing: undefined,
        //   verticalNativeBarPos: "right",
        // },
        // rail: {},
        // bar: {},
      },
    };
  },
  computed: {
    miniVariant() {
      if (this.$vuetify.breakpoint.xsOnly) {
        this.mini = false;
      }
      return this.mini;
    },
    ...mapState("ModLogin", ["arrMenuItem", "usuario", "avatar"]),
    ...mapGetters("ModLogin", ["showLayout"]),
    ...mapState("ModLayout", ["headerForm"]),
  },
  methods: {
    ...mapActions("ModLogin", ["autoLogin"]),
    appBarStop() {
      this.drawer = !this.drawer;
      if (this.$vuetify.breakpoint.name != "xs") {
        this.mini = !this.mini;
      }
    },
  },
  mounted() {
    this.$root.$confirm = this.$refs.confirm.open;
    this.$root.$alertSB = this.$refs.alertSB.show;
  },
  created() {
    this.autoLogin();
  },
};
</script>

<style >
@import "./assets/css/style.css";

.v-navigation-drawer__content .v-list .v-list-item__icon {
  margin-right: 10px !important;
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