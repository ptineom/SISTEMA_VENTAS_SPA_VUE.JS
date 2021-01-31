<template>
  <div>
    <v-text-field
      :reverse="!!reverse"
      :dense="!!dense"
      :label="!!label ? label : ''"
      :filled="!!filled"
      :autocomplete="'off'"
      :rules="!!rules ? rules : []"
      v-model="displayValue"
      @blur="isInputActive = false"
      @focus="isInputActive = true"
      :autofocus="!!autofocus"
      :class="!!clase ? clase : ''"
      ref="txtCurrencyInput"
    >
    </v-text-field>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      isInputActive: false,
    };
  },
  props: [
    "value",
    "dense",
    "reverse",
    "filled",
    "label",
    "autofocus",
    "clase",
    "rules",
    "sgnMoneda",
  ],
  computed: {
    displayValue: {
      get: function () {
        if (this.isInputActive) {
          // El cursor está dentro del field input. valor de visualización sin formato para el usuario
          return this.value == 0 ? "" : this.value.toString();
        } else {
          // El usuario no está modificando ahora. Formato de valor de visualización para la interfaz de usuario
          return this.sgnMoneda + " " + this.$formatoMiles(this.value, 2);
        }
      },
      set: function (modifiedValue) {
        //Vuelva a calcular el valor después de ignorar "S/" y "," en input del usuario
        let newValue = parseFloat(modifiedValue.replace(/[^\d\.]/g, ""));
        // Asegúrese de que no sea NaN
        if (isNaN(newValue)) {
          newValue = 0;
        }
        //Nota: no podemos establecer this.value ya que es un "prop". Debe pasarse al componente principal
        //$emit el evento para que el componente principal lo obtenga
        this.$emit("input", newValue);
      },
    },
  },
};
</script>