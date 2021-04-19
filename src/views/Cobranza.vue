<template>
  <div>
    {{ titulo }}
    <hr />
    <v-text-field v-model="mensaje"> </v-text-field>
    <hr />
    <v-btn @click="enviarMensaje()">Enviar</v-btn>
  </div>
</template>
<script>
import { HubConnectionBuilder } from "@microsoft/signalr";

const connection = new HubConnectionBuilder()
  .withUrl("http://localhost:53568/cambiarestadocajahub", {
    accessTokenFactory: () => localStorage.getItem("tokenSPA_SistemaVentas"),
  })
  .build();

connection
  .start()
  .then(() => {
    console.log("Signalr conectado");
  })
  .catch(() => {
    setTimeout(() => this.start(), 5000);
  });

connection.onclose(async () => this.start());

export default {
  name: "Cobranza",
  data() {
    return {
      titulo: "Cobranza",
      mensaje: "",
    };
  },
  methods: {
    enviarMensaje() {
      connection.invoke("SendMessage", this.mensaje);
    },
    async start() {
      try {
        await connection.start();
      } catch (err) {
        setTimeout(() => start(), 5000);
      }
    },
  },
  mounted() {
    connection.on("ReceiveMessage", (message) => {
      alert(message);
    });
  },
};
</script>