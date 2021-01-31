<template>
<v-snackbar
    v-model="snackbar"
    :right="options.right"
    top
    :color="options.color"
    class="mr-0"
    :absolute="options.absolute"
    ref="alerta"
    :multi-line="options.multiLine"
  >
    <span :class="options.fontSize">{{ message }}</span> 

    <template v-slot:action="{ attrs }">
      <v-btn
        :color="options.colorCerrar"
        text
        v-bind="attrs"
        @click="cerrar"
        class="pr-0 "
        title="Cerrar"
      >
        <v-icon>mdi-window-close</v-icon>
        <!-- Cerrar -->
      </v-btn>
    </template>
  </v-snackbar>
  
</template>
<script>
export default {
  name: "AlertSB",
  data() {
    return {
      snackbar: false,
      text: "",
      resolve: null,
      message: null,
      options: {
        timeout: 3000, //-1, //indeterminado
        color: "success",
        colorCerrar: "yellow",
        multiLine: true,
        fontSize:''
      },
      intervalId: 0,
    };
  },
  watch: {
    snackbar(value) {
      let _self = this;
      let alerta = _self.$refs.alerta.$el;

      //Cuando el valor sea true, dependiendo del timeout permanecerá visible el snackbar.
      if (value) {
        //Se reducirá la opacidad apartir de la propiedad timeout indicado
        setTimeout(() => {
          //Por cada 200 milisegundos disminuirá la opacidad hasta llegar a cero y desabilitarse la
          //propiedad snackbar en false.
          this.intervalId = setInterval(function () {
            if (!alerta.style.opacity) alerta.style.opacity = 1;

            if (alerta.style.opacity > 0) {
              alerta.style.opacity -= 0.1;
            } else {
              _self.snackbar = false;
              _self.limpiar(_self.intervalId)
            }
          }, 200);
        }, _self.options.timeout);
      }
    },
  },
  methods: {
    show(mensaje, options) {
      this.limpiar(this.intervalId)
      this.snackbar = true;
      this.message = mensaje;
      //Object.assign: Añade nuevas propiedades y sobrescribir las existentes.
      this.options = Object.assign(this.options, options);
    },
    cerrar() {
      this.snackbar = false;
    },
    limpiar(intervalId) {
      clearInterval(intervalId);
      this.intervalId = 0;
      this.$refs.alerta.$el.style.opacity = 1;
    },
  },
};
</script>
