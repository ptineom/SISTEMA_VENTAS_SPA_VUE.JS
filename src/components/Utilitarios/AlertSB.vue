<template>
  <div>
    <v-alert
      v-model="alert"
      dark
      border="left"
      transition="scale-transition"
      :type="options.type"
      dismissible
      close-text="Close Alert"
      prominent
      style="position: absolute; top: 10px; z-index: 555; right: 20px"
      :style="{ opacity: opacidad }"
    >
      <span :class="options.fontSize">{{ message }}</span>
    </v-alert>
  </div>
</template>

<script>
export default {
  name: "AlertSB",
  data() {
    return {
      alert: false,
      resolve: null,
      message: null,
      options: {
        timeout: 3000, //-1, //indeterminado
        type: "success",
        fontSize: "",
      },
      intervalId: 0,
      opacidad: 1
    };
  },
  watch: {
    alert(value) {
      let _self = this;

      if (value) {
        //Despué de cumplir el intervalo indicado en el timeout, desaparecerá lentamente.
        setTimeout(() => {
          let milisegundos = 200;

          //Disminuirá la opacidad del componente hasta desaparecer.
          _self.intervalId = setInterval(function () {
            if(!_self.opacidad) _self.opacidad = 1;

            if (_self.opacidad > 0) {
              _self.opacidad -= 0.1;
            } else {
              _self.alert = false;
              _self.limpiar(_self.intervalId);
            }
          }, milisegundos);
        }, _self.options.timeout);
      }
    },
  },
  methods: {
    show(mensaje, options) {
      this.limpiar(this.intervalId);
      this.alert = true;
      this.message = mensaje;

      //Object.assign: Añade nuevas propiedades y sobrescribir las existentes.
      this.options = Object.assign(this.options, options);
    },
    cerrar() {
      this.alert = false;
    },
    limpiar(intervalId) {
      clearInterval(intervalId);
      this.opacidad = 1;
    },
  },
};
</script>
