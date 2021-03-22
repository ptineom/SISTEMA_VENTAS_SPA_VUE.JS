<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title>
        <span class="headline text-button">
          <v-icon>mdi-cash-multiple</v-icon>
          Abóno
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir">mdi-window-close</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pb-0">
        <v-row>
          <v-col cols="12">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                :value="`${sgnMoneda} ${$formatoMiles(total, 2)}`"
                label="Monto total"
                placeholder="Monto total"
                readonly
                filled
              ></v-text-field>
              <v-text-field
                :value="`${sgnMoneda} ${$formatoMiles(saldo, 2)}`"
                label="Saldo"
                placeholder="Saldo"
                readonly
                :filled="true"
              ></v-text-field>

              <CurrencyInput
                :value="abono"
                @input="abono = $event"
                :label="'Monto a abonar'"
                :sgnMoneda="sgnMoneda"
                :rules="reglas.abono"
                :autofocus="true"
              ></CurrencyInput>

              <v-menu
                ref="txtFecVenD"
                v-model="showFecVen"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="fecVenFormatted"
                    label="Fecha vencimiento"
                    append-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="reglas.fechaVencimiento"
                  ></v-text-field>
                </template>
                <v-date-picker
                  no-title
                  v-model="fechaVencimiento"
                  @input="showFecVen = false"
                  locale="es-pe"
                  :first-day-of-week="1"
                  scrollable
                  :allowed-dates="allowedDatesFechaVencimiento"
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="showFecVen = false">
                    Cancelar
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.txtFecVenD.save(fechaVencimiento)"
                  >
                    Aceptar
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="cardAction2 text-right">
        <v-spacer></v-spacer>
        <v-btn class="error" text @click.native="salir">
          <v-icon>mdi-exit-to-app</v-icon>
          salir</v-btn
        >
        <v-btn class="success" text @click="guardarCredito">
          <v-icon>mdi-content-save</v-icon>
          Guardar cambios</v-btn
        >
      </v-card-actions>
      <v-overlay :value="overlay" absolute :opacity="'0.36'">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-card>
  </v-dialog>
</template>
<script>
import CurrencyInput from "@/components/CurrencyInput";

export default {
  name: "DlgAbonoCredito",
  data() {
    return {
      total: 0,
      saldo: 0,
      abono: 0,
      fechaVencimiento: this.$moment(new Date()).format("YYYY-MM-DD"),
      fecVenFormatted: this.$moment(new Date()).format("DD/MM/YYYY"),
      overlay: false,
      showFecVen: false,
      reglas: {
        abono: [
          (value) => {
            //Le quitará el simbolo del dolar y las comas en caso lo tuviera.
            let newValue = parseFloat(value.replace(/[^\d\.]/g, ""));
            if (isNaN(newValue)) newValue = 0;

            if (newValue == 0) return "Debe de ingresar el monto a abonar";

            if (newValue >= this.total)
              return "El monto a abonar no debe ser mayor o igual al monto total";

            return true;
          },
        ],
        fechaVencimiento: [
          (value) => {
            let fechaActual = this.$moment(new Date()).format("DD/MM/YYYY");
            if (
              this.$moment(value, "DD/MM/YYYY").isBefore(
                this.$moment(fechaActual, "DD/MM/YYYY")
              )
            )
              return "La fecha de vencimiento no puede ser menor a la fecha actual";

            return true;
          },
        ],
      },
      valid: false,
      reject: null,
      resolve: null,
      dialog: false,
      editar: false,
    };
  },
  watch: {
    fechaVencimiento(val) {
      this.fecVenFormatted = this.$moment(this.fechaVencimiento).format(
        "DD/MM/YYYY"
      );
    },
    abono(val) {
      this.saldo = this.total - val;
    },
  },
  components: {
    CurrencyInput,
  },
  props: ["sgnMoneda", "allowedDatesFechaVencimiento"],
  methods: {
    show(item) {
      if (!!item.editar) {
        this.editar = item.editar;
      }
      this.total = item.totalPagar;
      this.abono = item.abono;
      debugger;
      this.fechaVencimiento = item.fechaVencimiento;
      this.dialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    guardarCredito() {
      let validate = this.$refs.form.validate();
      if (validate) {
        this.resolve({
          abono: this.abono,
          saldo: this.saldo,
          fechaVencimiento: this.fechaVencimiento,
        });
        this.dialog = false;
      }
    },
    salir() {
      this.reject();
      if (!this.editar) {
        this.limpiar();
      }
      this.dialog = false;
    },
    limpiar() {
      this.abono = 0;
      this.fechaVencimiento = this.$moment(new Date()).format("YYYY-MM-DD");
    },
  },
};
</script>