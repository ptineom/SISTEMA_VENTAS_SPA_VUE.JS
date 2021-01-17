<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-card-title class="py-1">
        <span class="headline text-button">
          Consultar cliente
          <v-icon>mdi-binoculars</v-icon>
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="dialog = false"
          >mdi-window-close</v-icon
        >
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-1">
        <v-row>
          <v-col cols="8" class="py-0">
            <v-radio-group
              v-model="tipoFiltro"
              row
              class="mb-0 mt-1 pl-3 text-center"
            >
              <v-radio label="Por código" value="codigo"></v-radio>
              <v-radio label="Por razón social" value="descripcion"></v-radio>
              <v-radio label="Por N° documento" value="numDoc"></v-radio>
            </v-radio-group>
            <v-text-field
              label="Búsqueda por filtros"
              prepend-inner-icon="mdi-filter"
              outlined
              dense
              :autocomplete="'off'"
              clearable
              v-model="filtro"
              autofocus
              @keyup.enter.native="consultar"
              ref="txtFiltro"
            >
              <template slot="append-outer" class="my-0">
                <v-btn depressed color="primary" small @click="consultar">
                  <v-icon>mdi-magnify</v-icon>
                  Buscar
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="4">
            <LeyendaAyudaTeclaTabla></LeyendaAyudaTeclaTabla>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="py-0">
            <v-card tile>
              <v-card-title class="py-1 text-- text-overline">
                Resultado de la búsqueda
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="px-0 py-0" tile>
                <v-data-table
                  :headers="headers"
                  class="elevation-1"
                  dense
                  :items="clientes"
                  tile
                >
                  <template v-slot:body="{ items }">
                    <tbody ref="tbodyBus">
                      <tr
                        v-for="item in items"
                        :key="item.idCliente"
                        @click="rowClicked(item)"
                        style="cursor: pointer"
                        :class="
                          selectedRows.indexOf(item.idCliente) >= 0
                            ? 'rowSelected'
                            : ''
                        "
                      >
                        <td>{{ item.idCliente }}</td>
                        <td>{{ item.nomCliente }}</td>
                        <td>{{ item.nomTipoDocumento }}</td>
                        <td>{{ item.nroDocumento }}</td>
                        <td>{{ item.dirCliente }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="cardAction2 text-right">
        <v-spacer></v-spacer>
        <v-btn class="error" text @click.native="dialog = false">salir</v-btn>
      </v-card-actions>
      <v-overlay :value="overlay" absolute :opacity="'0.36'">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <AlertSB ref="alerta"></AlertSB>
    </v-card>
  </v-dialog>
</template>

<script>
import AlertSB from "../Utilitarios/AlertSB";
import LeyendaAyudaTeclaTabla from "./LeyendaAyudaTeclaTabla";
import { rowMarked } from "@/assets/js/Mixins/utilidades";

export default {
  name: "DlgBuscarCliente",
  components: {
    AlertSB,
    LeyendaAyudaTeclaTabla,
  },
  mixins: [rowMarked],
  props: ["value"],
  computed: {
    dialog: {
      get: function () {
        return this.value;
      },
      set: function (newValue) {
        this.$emit("input", newValue);
      },
    },
  },
  data() {
    return {
      overlay: false,
      tipoFiltro: "descripcion",
      filtro: "",
      headers: [
        { text: "Código", value: "idCliente" },
        {
          text: "Razón social",
          value: "nomCliente",
          width: "400px",
        },
        { text: "Documento", value: "nomTipoDocumento" },
        { text: "Nro Doc.", value: "nroDocumento" },
        { text: "Dirección", value: "dirCliente", width: "350px" },
      ],
      clientes: [],
    };
  },
  watch: {
    tipoFiltro(val) {
      this.filtro = "";
      this.$refs.txtFiltro.focus();
    },
    dialog(val) {
      if (!val) {
        this.limpiar();
      }
    },
  },
  methods: {
    limpiar() {
      this.filtro = "";
      this.tipoFiltro = "descripcion";
      this.clientes = [];
      this.selectedRows = [];
    },
    rowClicked(item) {
      //Enviamos el item seleccionado al formulario padre.
      this.$emit("seleccionarRegistro", item);
      this.dialog = false;
    },
    consultar() {
      let tipoFiltro = this.tipoFiltro;
      if (tipoFiltro == "") return;

      if (this.filtro == "") {
        this.$refs.alerta.show("Debe de ingresar el filtro", {
          absolute: true,
          color: "warning",
          right: false,
        });
        return;
      }

      let _self = this;
      _self.overlay = true;
      _self.selectedRows = [];
      _self.clientes = [];

      let parameters = `${tipoFiltro}/${_self.filtro}/${false}`;
      _self.$axios
        .get(`/api/Cliente/listaClientes/${parameters}`)
        .then((response) => {
          let result = response.data;
          if (!result.bResultado) {
            this.$refs.alerta.show(result.sMensaje, {
              absolute: true,
              color: "warning",
              right: false,
            });
            return;
          }
          
          let lista = result.data;
          _self.clientes = lista.map((elem) => {
            return {
              idCliente: elem.idCliente,
              nomCliente: elem.nomCliente,
              nomTipoDocumento: elem.nomTipoDocumento,
              nroDocumento: elem.nroDocumento,
              dirCliente: elem.dirCliente,
              idTipoDocumento: elem.idTipoDocumento,
            };
          });
        })
        .catch((error) => {
          this.$refs.alerta.show(error.response.data.Message, {
            absolute: true,
            color: "warning",
            right: false,
          });
          return;
        })
        .finally(() => {
          _self.overlay = false;
        });
    },
  },
  mounted() {
    let _self = this;

    window.addEventListener("keydown", (e) => {
      if (!_self.dialog) return;

      _self
        .$direccionarFilasGrilla(e, _self.$refs.tbodyBus, _self.$refs.txtFiltro)
        .then((value) => {
          if (e.keyCode == 13) {
            let modelo = _self.clientes.find((x) => x.idCliente == value);
            _self.rowClicked(modelo);
          } else if (e.keyCode == 27) {
            _self.dialog = false;
          } else {
            _self.rowMarked(value);
          }
        })
        .catch((errorMessage) => {
          if (errorMessage != "") {
            throw new Error(errorMessage);
          }
        });
    });
  },
};
</script>
