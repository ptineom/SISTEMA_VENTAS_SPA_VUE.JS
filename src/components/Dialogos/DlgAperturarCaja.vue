<template>
  <v-dialog v-model="dialog" max-width="550px">
    <v-card>
      <v-card-title class="py-2">
        <span class="headline text-button">
          <v-icon>{{
            cajaAbierta ? "mdi-package-variant" : "mdi-package-variant-closed"
          }}</v-icon>
          {{
            cajaAbierta
              ? "Caja " +
                (modeloCajaApertura.flgReaperturado
                  ? "reaperturada"
                  : "abierta")
              : "Caja cerrada"
          }}
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir">mdi-window-close</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <span
        class="text-body-1 font-weight-bold my-1 d-block red darken-4 py-1 px-2"
        style="color: #fff"
        >Fecha y hora de apertura de caja: {{ modelo.fechaApertura }}</span
      >
      <v-card-text class="pb-1">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="8" class="pb-0 pt-1">
              <v-menu
                ref="txtFecVen"
                v-model="showFecCie"
                transition="scale-transition"
                offset-y
                min-width="290px"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div class="d-flex flex-row">
                    <v-checkbox
                      v-model="chkHorCie"
                      hide-details
                      class="shrink mt-0"
                      label="Fecha/hora de cierre diferido"
                      :disabled="cajaAbierta? modeloCajaApertura.flgReaperturado: true"
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
                      :rules="reglas.fechaCierre"
                    ></v-text-field>
                  </div>
                </template>
                <v-date-picker
                  v-model="modelo.fechaCierre"
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
                      :disabled="chkHorCie ? false : true"
                      :rules="reglas.horaCierre"
                    ></v-text-field>
                  </div>
                </template>
                <v-time-picker
                  v-if="showHorCie"
                  v-model="horaCierre"
                  full-width
                  @click:minute="$refs.txtHorCie.save(horaCierre)"
                  format="ampm"
                ></v-time-picker>
              </v-menu>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-select
                dense
                label="Caja"
                outlined
                :items="listaCaja"
                @change="seleccionarCaja()"
                :disabled="cajaAbierta"
                v-model="modelo.idCaja"
                :rules="reglas.caja"
              >
              </v-select>
            </v-col>

            <v-col cols="6" class="py-0">
              <CurrencyInput
                :value="modelo.montoApertura"
                @input="modelo.montoApertura = $event"
                :label="'Monto apertura'"
                :sgnMoneda="moneda.sgnMoneda"
                :outlined="true"
                :dense="true"
                :disabled="cajaAbierta"
                ref="txtMontoApertura"
              ></CurrencyInput>
            </v-col>
          </v-row>
        </v-form>

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
                  >Total en caja: {{ moneda.sgnMoneda }}
                  {{ $formatoMiles(montoTotal) }}</v-chip
                ></v-col
              >
            </v-row>

            <v-card class="mt-3">
              <v-list class="py-0">
                <v-list-item>
                  <v-list-item-content class="py-1">
                    <v-list-item-title>Monto apertura</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action class="my-1">
                    <v-list-item-title
                      >{{ moneda.sgnMoneda }}
                      {{
                        $formatoMiles(modelo.montoApertura, 2)
                      }}</v-list-item-title
                    >
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
                    <v-list-item-title
                      >{{ moneda.sgnMoneda }}
                      {{
                        $formatoMiles(montos.ventaContado, 2)
                      }}</v-list-item-title
                    >
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
                    <v-list-item-title
                      >{{ moneda.sgnMoneda }}
                      {{
                        $formatoMiles(montos.pagosPendientes, 2)
                      }}</v-list-item-title
                    >
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Otros ingresos</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title
                      >{{ moneda.sgnMoneda }}
                      {{
                        $formatoMiles(montos.otrosIngresos, 2)
                      }}</v-list-item-title
                    >
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="red--text"
                      >Salidas de caja</v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title class="red--text"
                      >(-) {{ moneda.sgnMoneda }}
                      {{
                        $formatoMiles(montos.salidaCaja, 2)
                      }}</v-list-item-title
                    >
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
        <v-btn color="warning" @click="grabar"
          ><v-icon
            >{{
              cajaAbierta ? "mdi-package-variant" : "mdi-package-variant-closed"
            }}
          </v-icon>
          {{ cajaAbierta ? "Cerrar caja" : "Abrir caja" }}
        </v-btn>
      </v-card-actions>
      <v-overlay :value="overlay" absolute :opacity="'0.36'">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <alerta ref="alerta"></alerta>
    </v-card>
  </v-dialog>
</template>

<script>
import CurrencyInput from "@/components/Utilitarios/CurrencyInput";
import { mapState, mapActions } from "vuex";
import alerta from "@/components/Utilitarios/AlertSB";

export default {
  name: "DlgAperturarCaja",
  components: { alerta, CurrencyInput },
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
      overlay: false,
      dialog: false,
      showFecCie: false,
      fecCieFormatted: "",
      showHorCie: false,
      horaCierre: "",
      chkHorCie: false,
      listaCaja: [],
      modelo: {
        idCaja: "",
        montoApertura: "",
        montoTotal: 0.0,
        fechaApertura: "",
        fechaCierre: null,
      },
      moneda: {
        idMoneda: "",
        sgnMoneda: "",
        nomMoneda: "",
      },
      montos: {
        ventaContado: 0.0,
        pagosPendientes: 0.0,
        otrosIngresos: 0.0,
        salidaCaja: 0.0,
      },
      reglas: {
        caja: [(value) => !!value || "Seleccione la caja"],
        fechaCierre: [
          (value) => {
            if (this.chkHorCie) {
              if (!!value) {
                //Validaremos solo fecha sin horas
                let fechaActual = this.$dayjs().format("YYYY/MM/DD");
                let fechaApertura = this.$dayjs(
                  this.modelo.fechaApertura,
                  "DD/MM/YYYY h:mm:ss a"
                ).format("YYYY/MM/DD");

                if (
                  this.$dayjs(value, "DD/MM/YYYY").isAfter(
                    this.$dayjs(fechaActual)
                  )
                ) {
                  return "No debe ser mayor a la fecha actual.";
                }

                if (
                  this.$dayjs(value, "DD/MM/YYYY").isBefore(
                    this.$dayjs(fechaApertura)
                  )
                ) {
                  return "No debe ser menor a la fecha apertura.";
                }

                return true;
              } else {
                return "Ingrese la fecha de cierre";
              }
            } else {
              return true;
            }
          },
        ],
        horaCierre: [
          (value) => {
            if (this.chkHorCie) {
              if (!!value) {
                //Validaremos la fecha y hora ingresada(concatenada)
                let fechaHoraCierre = this.$dayjs(
                  `${this.fecCieFormatted} ${value}`,
                  "DD/MM/YYYY HH:mm"
                );
                let fechaHoraActual = this.$dayjs();
                let fechaHoraApertura = this.$dayjs(
                  this.modelo.fechaApertura,
                  "DD/MM/YYYY h:mm:ss a"
                );

                if (fechaHoraCierre.isAfter(fechaHoraActual)) {
                  return "No debe ser mayor a la fecha y hora actual.";
                }

                if (fechaHoraCierre.isBefore(fechaHoraApertura)) {
                  return "No debe ser menor a la fecha y hora apertura.";
                }

                return true;
              } else {
                return "Ingrese la hora de cierre";
              }
            } else {
              return true;
            }
          },
        ],
      },
      valid: false,
    };
  },
  methods: {
    ...mapActions("ModCajaApertura", ["setModeloCajaApertura"]),
    salir() {
      this.dialog = false;
    },
    show() {
      let _self = this;

      _self.habilitarSegunEstadoCaja();

      _self.dialog = true;
    },
    habilitarSegunEstadoCaja() {
      if (this.cajaAbierta) {
        let model = this.modeloCajaApertura;

        this.modelo.fechaApertura = this.$dayjs(
          model.fechaApertura,
          "DD/MM/YYYY HH:mm"
        ).format("DD/MM/YYYY h:mm:ss a");
        this.modelo.idCaja = model.idCaja;

        this.montosTotalesCaja(model.idCaja, model.correlativo);
      } else {
        setInterval(() => {
          this.modelo.fechaApertura = this.$dayjs()
            .add(1, "s")
            .format("DD/MM/YYYY h:mm:ss a");
        }, 1000);
        //apagar el setInterval cuando ya no se cierre el dialog
      }
    },
    grabar() {
      let _self = this;

      let validate = _self.$refs.form.validate();
      if (validate) {
        let titulo = _self.cajaAbierta
          ? `Caja ${
              _self.modeloCajaApertura.flgReaperturado
                ? "reaperturada"
                : "abierta"
            }`
          : "Caja cerrada";
        let pregunta = `¿Desea ${
          _self.cajaAbierta ? "cerrar la caja" : "abrir la caja"
        }?`;

        _self.$root
          .$confirm(titulo, pregunta)
          .then(() => {
            let fechaCierre = "";
            if (_self.chkHorCie)
              fechaCierre = `${_self.fecCieFormatted} ${_self.horaCierre}`;

            let parameters = {
              Accion: _self.cajaAbierta ? "UPD" : "INS",
              MontoApertura:
                _self.modelo.montoApertura == ""
                  ? 0
                  : _self.modelo.montoApertura,
              IdMoneda: _self.moneda.idMoneda,
              IdCaja: _self.modelo.idCaja,
              FechaCierre: fechaCierre,
              MontoTotal: _self.montoTotal == "" ? 0 : _self.montoTotal,
              Correlativo:
                _self.modeloCajaApertura != null
                  ? _self.modeloCajaApertura.correlativo
                  : 0,
              FlgReaperturado: _self.cajaAbierta? _self.modeloCajaApertura.flgReaperturado: false,
              Item: _self.cajaAbierta? _self.modeloCajaApertura.item: 0
            };

            _self.overlay = true;

            _self.$axios
              .post("/api/CajaApertura/Register", parameters)
              .then((response) => {
                let data = response.data.Data;

                _self.setModeloCajaApertura(data);
              })
              .catch((error) => {
                _self.$refs.alerta.show(error.response.data.Message, {
                  type: "warning",
                });
              })
              .finally(() => {
                _self.overlay = false;
                _self.dialog = false;
              });
          })
          .catch(() => {});
      }
    },
    montosTotalesCaja(idCaja, correlativo) {
      let _self = this;
      this.overlay = true;

      this.$axios
        .get(`/api/CajaApertura/GetTotalsByUserId/${idCaja}/${correlativo}`)
        .then((response) => {
          let data = response.data.Data;

          _self.modelo = Object.assign(_self.modelo, {
            montoApertura: data.MontoAperturaCaja,
            montoTotal: data.MontoTotal,
          });

          _self.montos = {
            ventaContado: data.MontoCobradoContado,
            pagosPendientes: data.MontoCobradoCredito,
            otrosIngresos: data.MontoCajaOtrosIngreso,
            salidaCaja: data.MontoCajaSalida,
          };
        })
        .catch((error) => {
          _self.$refs.alerta.show(error.response.data.Message, {
            type: "warning",
          });
        })
        .finally(() => {
          _self.overlay = false;
        });
    },
    seleccionarCaja() {
      this.modelo.montoApertura = "";
      this.$refs.txtMontoApertura.$refs.txtCurrencyInput.focus();
    },
  },
  computed: {
    ...mapState("ModCajaApertura", ["modeloCajaApertura"]),
    montoTotal() {
      return this.modeloCajaApertura != null
        ? this.modelo.montoTotal
        : this.modelo.montoApertura;
    },
    cajaAbierta() {
      if (this.modeloCajaApertura != null) return true;
      else return false;
    },
  },
  watch: {
    "modelo.fechaCierre"(val) {
      if (val == null) {
        this.fecCieFormatted = "";
        return;
      }

      this.fecCieFormatted = this.$dayjs(val).format("DD/MM/YYYY");
    },
    chkHorCie(val) {
      if (!val) {
        this.modelo.fechaCierre = null;
        this.horaCierre = "";
      }
    },
    dialog(val) {
      if (!val) {
        this.modelo = {
          idCaja: "",
          montoApertura: "",
          montoTotal: 0.0,
          fechaApertura: "",
        };
        this.montos = {
          ventaContado: 0.0,
          pagosPendientes: 0.0,
          otrosIngresos: 0.0,
          salidaCaja: 0.0,
        };

        this.chkHorCie = false;
        this.horaCierre = "";

        this.$refs.form.resetValidation();
      }
    },
  },
};
</script>