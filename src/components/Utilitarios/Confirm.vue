<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar dense flat>
        <v-toolbar-title class="text-button">{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text v-show="!!message" class="px-4 pb-2">
        <template>
          <v-row>
            <v-col cols="9" class="text-body-1 pr-1">{{ message }}</v-col>
            <v-col cols="3" class="text-center px-1">
              <v-icon color="info" class="text-h3">mdi-comment-question</v-icon>
            </v-col>
          </v-row>
        </template>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="success" ref="btnAceptar" text @click="aceptar">SI</v-btn>
        <v-btn class="error" text @click.native="cancelar">NO</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 *
 * Insert component where you want to use it:
 * <confirm ref="confirm"></confirm>
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 *
 * Alternatively you can place it in main App component and access it globally via this.$root.$confirm
 * <template>
 *   <v-app>
 *     ...
 *     <confirm ref="confirm"></confirm>
 *   </v-app>
 * </template>
 *
 * mounted() {
 *  //Agregamos el método open a la raiz, para que pueda ser consumida de forma global.
 *   this.$root.$confirm = this.$refs.confirm.open
 * }
 */
export default {
  name: "Confirm",
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      width: 340,
      zIndex: 200,
    },
  }),
  methods: {
    open(title, message, options) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      //Object.assign: Añadir nuevas propiedades y sobrescribir las existentes.
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.$nextTick(() => {
          this.$refs.btnAceptar.$el.focus();
        });
      });
    },
    aceptar() {
      this.dialog = false;
      this.resolve(true);
    },
    cancelar() {
      this.reject(false);
      this.dialog = false;
    },
  },
};
</script>