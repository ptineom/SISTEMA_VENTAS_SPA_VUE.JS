<template>
  <div>
    <v-dialog v-model="bDialogo" max-width="700px">
      <v-card>
        <v-card-title class="py-1">
          <span class="headline text-button">
            <v-icon>mdi-binoculars</v-icon>
            Dialogo de prueba
          </span>
          <v-spacer></v-spacer>
          <v-icon style="cursor: pointer" @click="aceptar"
            >mdi-window-close</v-icon
          >
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-1">
          <h1>hola dialogo</h1>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props:["value", "titulo"],
  methods: {
      aceptar(){
          this.bDialogo = false;
      }
  },
  computed:{
      bDialogo: {
          get: function(){ 
              return this.value;
          },
          set: function(newValue){ 
            this.$emit('input', newValue);
          }
      }
  },
};
</script>