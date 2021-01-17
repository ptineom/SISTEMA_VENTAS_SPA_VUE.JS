<template>
  <v-dialog v-model="dialog" max-width="650px" persistent>
    <v-card>
      <v-card-title class="py-2">
        <span class="headline text-button">
          <v-icon>mdi-cash-multiple</v-icon>
          Pago de Boleta de venta
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir">mdi-window-close</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <v-alert tile dense class="text-center my-1 py-0 lime accent-1">
        <span class="text-button">Forma de pago: {{ nombreFormaPago }}</span>
      </v-alert>
      <v-card-text class="pb-1">
        <v-row>
          <v-col md="6" class="py-1 pl-0">
            <v-row>
              <v-col md="12">
                <v-img src="@/assets/imagenes/Caja3.jpg"> </v-img>
              </v-col>
            </v-row>
          </v-col>
          <v-col md="6" class="py-1 px-0">
            <v-card tile>
              <v-card-text class="pl-0 pt-0">
                <v-form ref="form" v-model="valid" @submit.prevent lazy-validation>

                  <v-row>
                    <v-col md="5" class="py-0"
                      ><v-subheader class="font-weight-medium"
                        >Monto total</v-subheader
                      ></v-col
                    >
                    <v-col md="7" class="py-0 text-right">
                      <v-chip class="ma-2 text-h6" color="success" label>
                        {{
                          `${sgnMoneda} ${$formatoMilesRegex(montoTotal, 2)}`
                        }}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-divider></v-divider>
                  <v-row>
                    <v-col md="5" class="py-0"
                      ><v-subheader
                        class="font-weight-medium"
                        :class="{ 'text--disabled': abono == 0 }"
                        >A cuenta</v-subheader
                      ></v-col
                    >
                    <v-col md="7" class="py-0 text-right">
                      <v-chip
                        class="ma-2 text-h6"
                        :class="{ 'text--disabled': abono == 0 }"
                        color="warning"
                        label
                      >
                        {{ `${sgnMoneda} ${$formatoMilesRegex(abono, 2)}` }}
                      </v-chip>
                    </v-col>
                    <v-col md="5" class="py-0"
                      ><v-subheader
                        class="font-weight-medium"
                        :class="{ 'text--disabled': abono == 0 }"
                        >Saldo</v-subheader
                      ></v-col
                    >
                    <v-col md="7" class="py-0 text-right">
                      <v-chip
                        class="ma-2 text-h6 red white--text"
                        label
                        :class="{ 'text--disabled': abono == 0 }"
                      >
                        {{ `${sgnMoneda} ${$formatoMilesRegex(saldo, 2)}` }}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-divider></v-divider>
                  <v-row>
                    <v-col md="5" class="pb-0"
                      ><v-subheader class="font-weight-medium"
                        >Efectivo</v-subheader
                      ></v-col
                    >
                    <v-col md="7" class="pb-0 text-right">
                      <v-text-field
                           type="text"
                           v-model="efectivo"
                          :autocomplete="'off'"
                          outlined
                          dense
                          reverse
                          @keypress="$numerosDecimales($event, 2)"
                          @keyup.enter="emitirComprobante()"
                          autofocus
                          @input="calcularVuelto($event)"
                          :rules="reglas.efectivo"
                      ></v-text-field>
                    </v-col>
                    <v-col md="5" class="py-0"
                      ><v-subheader class="font-weight-medium"
                        >Vuelto</v-subheader
                      ></v-col
                    >
                    <v-col md="7" class="py-0 text-right">
                      <v-chip class="ma-2 text-h6" color="warning" label>
                        {{ `${sgnMoneda} ${$formatoMilesRegex(vuelto, 2)}` }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="cardAction2">
        <v-spacer></v-spacer>
        <v-btn color="error" dark title="Salir" @click="salir()">
          <v-icon>exit_to_app</v-icon>
          Salir
        </v-btn>
        <v-btn
          color="success"
          title="Guardar cambios"
          @click.native="emitirComprobante()"
        >
          <v-icon>save</v-icon>
          Emitir comprobante
        </v-btn>
      </v-card-actions>
    </v-card>
 
  </v-dialog>
</template>
<script>

export default {
  data() {
    return {
      reject: null,
      resolve: null,
      dialog: false,
      montoTotal: 0,
      abono: 0,
      saldo: 0,
      efectivo: "",
      vuelto: 0,
      nombreFormaPago: "",
      valid: false,
      reglas: {
        efectivo: [
          (value) => {
            let monto = this.abono > 0 ? this.abono : this.montoTotal;
            //Si el valor del efectivo ingresado es menor o igual al monto total entonces error.
            if (value > 0 && value <= this.montoTotal) {
              return `El monto ingresado debe ser mayor al monto ${
                this.abono > 0 ? "abonado." : "total."
              }`;
            }
            return true;
          },
        ],
      },
    };
  },
  props: ["sgnMoneda"],
  watch: {
    dialog(val) {
      if (!val) {
        this.efectivo = "";
        this.vuelto = 0;
      }
    },
  },
  methods: {
    show(modelo) {
      this.montoTotal = modelo.montoTotal;
      this.abono = modelo.abono;
      this.saldo = modelo.abono > 0 ? modelo.montoTotal - modelo.abono : 0;
      this.nombreFormaPago = modelo.nombreFormaPago;
      this.dialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    salir() {
      this.reject();
      this.dialog = false;
    },
    calcularVuelto(event) {
      this.efectivo = event;

      if (this.efectivo == 0) {
        this.vuelto = 0;
        return;
      }
      //Si es al contado
      if (this.abono == 0) {
        this.vuelto =
          this.efectivo >= this.montoTotal
            ? this.efectivo - this.montoTotal
            : 0;
      } else {
        this.vuelto =
          this.efectivo >= this.abono ? this.efectivo - this.abono : 0;
      }
    },
    emitirComprobante() {
      let validate = this.$refs.form.validate();
      if (validate) {
        this.$root.$confirm("Facturación", "¿Desea emitir el comprobante?").then(() => {
          //devolverá un true en la promesa, indicando que se acepto en el dialogo de confirmación.
          this.resolve(true);
          this.dialog = false;
        }).catch(() => {
          //Si selecciona "no" en el dialogo de confirmación, no hace nada.
        });
      }
    },
  },
};
</script>
