<template>
  <v-dialog v-model="dialog" max-width="550px">
    <v-card>
      <v-card-title class="py-2">
        <span class="headline text-button">
          <v-icon>mdi-cash-multiple</v-icon>
          Aperturar caja
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir">mdi-window-close</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <span
        class="text-body-1 font-weight-bold my-1 d-block red darken-4 py-1 px-2"
        style="color: #fff"
        >Fecha y hora de apertura de caja: {{ fechaApertura }}</span
      >
      <v-card-text>
        <v-row>
          <v-col cols="8" class="pb-0 pt-1">
            <v-menu
              ref="txtFecVen"
              v-model="showFecCie"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <div class="d-flex flex-row">
                  <v-checkbox
                    v-model="chkHorCie"
                    hide-details
                    class="shrink mt-0"
                    label="Fecha/hora de cierre diferido"
                    :disabled="desabilitarFechaCierre"
                  ></v-checkbox>
                  <v-text-field
                    v-model="fecCieFormatted"
                    label="Fecha cierre"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                    :disabled="chkHorCie ? false : true"
                  ></v-text-field>
                </div>
              </template>
              <v-date-picker
                v-model="fechaCierre"
                no-title
                @input="showFecCie = false"
                locale="es-pe"
                :first-day-of-week="1"
                scrollable
              >
                <v-spacer></v-spacer>
                <v-btn color="error" @click="showFecCie = false">
                  Cancelar
                </v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4" class="pb-0 pt-1">
            <v-menu
              ref="txtHorCie"
              v-model="showHorCie"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="horaCierre"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <div class="d-flex flex-row align-center">
                  <v-text-field
                    v-model="horaCierre"
                    label="Hora cierre"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                    append-icon="mdi-clock-time-four-outline"
                    hide-details
                    :disabled="chkHorCie ? false : true"
                  ></v-text-field>
                </div>
              </template>
              <v-time-picker
                v-if="showHorCie"
                v-model="horaCierre"
                full-width
                @click:minute="$refs.txtHorCie.save(horaCierre)"
                format="24hr"
              ></v-time-picker>
            </v-menu>
          </v-col>
          <v-col cols="6" class="py-0">
            <v-select dense label="Caja" 
            outlined :items="listaCaja"
            @change="seleccionarCaja()">
            </v-select>
          </v-col>

          <v-col cols="6" class="py-0">
            <v-text-field
              label="Monto apertura"
              type="text"
              outlined
              dense
              :autocomplete="'off'"
              ref="txtMonApe"
              v-model="modelo.montoApertura"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="py-0">
            <v-row>
              <v-col cols="6" class="py-0">
                <span class="text-button font-weight-bold ml-2"
                  >Ingresos/salidas de caja</span
                >
              </v-col>
              <v-col cols="6" class="py-0 text-end font-weight-bold">
                <v-chip color="orange" label outlined style="font-size: 18px"
                  >Total en caja: S/ 150.60</v-chip
                ></v-col
              >
            </v-row>

            <v-card class="mt-3">
              <v-list dense class="py-0">
                <v-list-item>
                  <v-list-item-content class="py-1">
                    <v-list-item-title>Monto apertura</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action class="my-1">
                    <v-list-item-title>S/ 10.30</v-list-item-title>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      >Monto venta al contado</v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title>{{moneda.sgnMoneda}} {{$formatoMiles(montos.ventaContado, 2)}}</v-list-item-title>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      >Monto pagos pendientes</v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title>{{moneda.sgnMoneda}} {{$formatoMiles(montos.pagosPendientes, 2)}}</v-list-item-title>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Otros ingresos</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title>{{moneda.sgnMoneda}} {{$formatoMiles(montos.otrosIngresos, 2)}}</v-list-item-title>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Salidas de caja</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title>{{moneda.sgnMoneda}} {{$formatoMiles(montos.salidaCaja, 2)}}</v-list-item-title>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="cardAction2">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="salir"
          ><v-icon>exit_to_app</v-icon> Salir</v-btn
        >
        <v-btn color="success" @click="grabar"
          ><v-icon>save</v-icon> Grabar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DlgAperturarCaja",
  mounted() {
    let _self = this;

    _self.$axios
      .get("/api/CajaApertura/GetData")
      .then((response) => {
        let data = response.data.Data;
        let listaCaja = data.ListaCaja;
        let monedaLocal = data.MonedaLocal;

        listaCaja.forEach((elem) => {
          _self.listaCaja.push({
            text: elem.NomCaja,
            value: elem.IdCaja,
          });
        });
        if (listaCaja.length == 1) _self.modelo.idCaja = listaCaja[0].IdCaja;

        //Moneda local
        _self.moneda = {
          idMoneda: monedaLocal.IdMoneda,
          nomMoneda: monedaLocal.NomMoneda,
          sgnMoneda: monedaLocal.SgnMoneda,
        };
      })
      .catch((error) => {
        _self.$root.$alertSB(error.response.data.Message, {
          type: "warning",
        });
      })
      .finally(() => {
        _self.overlay = false;
      });
  },
  data() {
    return {
      dialog: false,
      fechaApertura: "28/03/2021 16:53",
      showFecCie: false,
      fecCieFormatted: "",
      fechaCierre: null,
      showHorCie: false,
      horaCierre: "",
      chkHorCie: false,
      listaCaja: [],
      modelo: {
        idCaja: "",
        montoApertura: "",
        montoTotal: 0.00
      },
      moneda: {
        idMoneda: "",
        sgnMoneda: "",
        nomMoneda: "",
      },
      montos:{
        ventaContado:0.00,
        pagosPendientes: 0.00,
        otrosIngresos: 0.00,
        salidaCaja: 0.00
      },
      desabilitarFechaCierre: false,
    };
  },
  methods: {
    salir() {
      this.dialog = false;
    },
    show() {
      let _self = this;

      setInterval(() => {
        this.fechaApertura = _self
          .$moment()
          .add(1, "s")
          .format("DD/MM/YYYY h:mm:ss a");
      }, 1000);

      this.dialog = true;
    },
    grabar() {},
    seleccionarCaja(){
      this.modelo.montoApertura = "";
      this.$refs.txtMonApe.focus();
    }
  },
  watch: {
    fechaCierre(val) {
      if (val == null) {
        this.fecCieFormatted = "";
        return;
      }

      this.fecCieFormatted = this.$moment(val).format("DD/MM/YYYY");
    },
    chkHorCie(val) {
      if (!val) {
        this.fechaCierre = null;
        this.horaCierre = "";
      }
    },
  },
};
</script>