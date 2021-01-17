<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <hr />
    <v-btn color="info" @click="getUsuario">Get user</v-btn>
    <v-btn color="success" @click="saveUsuario">Save user</v-btn>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from "axios";
import { mapState } from 'vuex';
export default {
  name: "Home",
  computed: {
    ...mapState("ModLogin", ["usuario"])
  },
  methods: {
    getUsuario() {
      //"bearer " + localStorage.getItem("tokenSPA_SistemaVentas")
      // let queryString = {
      //   params: {
      //     idUsuario: "SISTEMAS",
      //     rol: "ADMINISTRADOR",
      //   },
      // };
      // axios
      //   // .get("api/Usuario/getUsuario/sistemas/administrador")
      //   .get("api/Usuario/getUsuario", queryString)
      //   .then((response) => {
      //     let data = response.data;
      //     debugger;
      //   })
      //   .catch((error) => {
      //     console.log(error.response);
      //     debugger;
      //   });

      // let config = {
      //   headers: {
      //     authorization: "Bearer " + localStorage.getItem("tokenSPA_SistemaVentas"),
      //   },
      // };

      axios
        .get("api/Usuario/getUsuario/sistemas/admin")
        .then((response) => {
          let vv = response;
          debugger;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    saveUsuario() {
      let parameters = {
        ID_USUARIO: "SISTEMAS",
        NOM_USUARIO: "HECTOR TORO VALENCIA",
        NOM_ROL: "ADMINISTRADOR",
      };
      axios
        .post("/api/saveUsuario", parameters)
        .then((response) => {
          let data = response.data;
          debugger;
        })
        .catch((error) => {
          console.log(error.response);
          debugger;
        });
    },
  },
};
</script>
