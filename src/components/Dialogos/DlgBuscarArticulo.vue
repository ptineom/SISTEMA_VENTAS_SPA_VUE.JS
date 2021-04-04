<template>
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title class="py-1">
        <span class="headline text-button">
          <v-icon>mdi-binoculars</v-icon>
          Consultar artículo
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="dialog = false"
          >mdi-window-close</v-icon
        >
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-1">
        <v-row>
          <v-col cols="12" class="py-0">
            <v-radio-group
              v-model="tipoFiltro"
              row
              class="mb-0 mt-1 pl-3 text-center"
            >
              <v-radio label="Por código" value="codigo"></v-radio>
              <v-radio label="Por descripción" value="descripcion"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="8" class="py-0">
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
                  <span class="d-none d-sm-block">Buscar</span>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="4" class="py-0 d-none d-lg-block">
            <LeyendaAyudaTeclaTabla></LeyendaAyudaTeclaTabla>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="py-0">
            <v-card tile>
              <v-card-title class="py-0 text-- text-overline">
                Resultado de la búsqueda
                <v-spacer></v-spacer>

                <v-btn
                  class="warning"
                  small
                  @click="abrirDialogoUm()"
                  :disabled="!bMasUm"
                  >Ver más UM [+]
                </v-btn>
                <v-dialog v-model="dialogUm" max-width="550px" persistent>
                  <v-card>
                    <v-card-text class="py-1 px-1">
                      <v-data-table
                        :headers="headersUm"
                        :items="listaUm"
                        dense
                        class="elevation-1"
                        tile
                        hide-default-footer
                        disable-pagination
                      >
                      </v-data-table>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions class="cardAction2 text-right py-1">
                      <v-spacer></v-spacer>
                      <v-btn
                        class="error"
                        small
                        text
                        @click.native="dialogUm = false"
                        >salir</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-title>

              <v-divider></v-divider>
              <v-card-text class="px-0 py-0" tile>
                <v-data-table
                  :headers="headers"
                  class="elevation-1"
                  dense
                  :items="listaArticulo"
                  tile
                  :mobile-breakpoint="0"
                >
                  <template v-slot:body="{ items }">
                    <tbody ref="tbodyBus">
                      <tr
                        style="cursor: pointer"
                        v-for="item in items"
                        :key="item.idArticulo"
                        @click="paintRow(item)"
                        :class="{
                          rowSelected:
                            selectedRows.indexOf(item.codigo) >= 0
                              ? true
                              : false,
                          'error--text':
                            item.stockActual <= item.stockMinimo ? true : false,
                        }"
                      >
                        <td class="pl-1 pr-0">
                          <v-btn
                            color="warning"
                            small
                            style="cursor: pointer"
                            @click="rowClicked(item)"
                          >
                            <v-icon>mdi-gesture-tap</v-icon>
                          </v-btn>
                        </td>
                        <td class="text-caption">{{ item.codigo }}</td>
                        <td class="text-caption">{{ item.nomArticulo }}</td>
                        <td class="text-caption">{{ item.nomMarca }}</td>
                        <td class="text-caption">{{ item.nomUm }}</td>
                        <td class="text-right">
                          {{
                            $formatoMiles($convertToInt(item.stockActual), 2)
                          }}
                        </td>
                        <td class="text-right">
                          {{ item.descuento1.toFixed(2) }}
                        </td>
                        <td class="text-right">
                          {{
                            $formatoMoneda(
                              sgnMoneda(),
                              item.precioVentaFinal,
                              2
                            )
                          }}
                        </td>
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
  name: "DlgBuscarArticulo",
  components: {
    AlertSB,
    LeyendaAyudaTeclaTabla,
  },
  mixins: [rowMarked],
  data() {
    return {
      alert: false,
      bMasUm: false,
      dialogUm: false,
      overlay: false,
      tipoFiltro: "descripcion",
      filtro: "",
      headers: [
        { text: "", value: "seleccionar", align: "center" },
        { text: "Cod. barra/ID", value: "codigo" },
        {
          text: "Descripción",
          value: "nomArticulo",
          width: "300px",
        },
        { text: "Marca", value: "nomMarca", width: "200px" },
        { text: "UM", value: "nomUm" },
        { text: "Stock", value: "stockActual" },
        { text: "Dscto%", value: "descuento1" },
        { text: "Precio venta final", value: "precioVentaFinal" },
      ],
      listaArticulo: [],
      headersUm: [
        {
          text: "Unidad medida",
          value: "nomUm",
          align: "center",
          sortable: false,
        },
        {
          text: "Factor",
          value: "nroFactor",
          align: "center",
          sortable: false,
        },
        {
          text: "Precio venta",
          value: "precioVenta",
          align: "center",
          sortable: false,
        },
        {
          text: "Dscto %",
          value: "descuento1",
          align: "center",
          sortable: false,
        },
        {
          text: "Precio venta final",
          value: "precioVentaFinal",
          align: "center",
          sortable: false,
        },
      ],
      listaUm: [],
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
    dialogUm(val) {
      if (!val) {
        this.listaUm = [];
      }
    },
  },
  methods: {
    limpiar() {
      this.filtro = "";
      this.tipoFiltro = "descripcion";
      this.listaArticulo = [];
      this.selectedRows = [];
      this.bMasUm = false;
    },
    paintRow(item) {
      let _self = this;
      //Marcamos la fila
      _self.rowMarked(item.codigo);

      let articulo = _self.listaArticulo.find(
        (x) => x.idArticulo == item.idArticulo
      );
      _self.bMasUm = false;

      //Verificamos si tiene mas de una UM y que este seleccionado
      if (
        articulo.listaUm.length > 1 &&
        _self.selectedRows.indexOf(item.codigo) >= 0
      ) {
        _self.bMasUm = true;
      }
    },
    abrirDialogoUm() {
      let _self = this;
      _self.listaUm = [];

      //Si existe fila marcada.
      if (_self.selectedRows.length > 0) {
        let articulo = _self.listaArticulo.find(
          (x) => x.Codigo == _self.selectedRows[0]
        );
        let um = articulo.listaUm;
        let idUm = articulo.idUm;

        //Verificamos si tiene mas de una UM
        if (um.length > 1) {
          _self.dialogUm = true;
          um.forEach((x) => {
            if (x.value != idUm) {
              _self.ListaUm.push({
                nomUm: x.text,
                precioVenta: _self.$formatoMoneda(
                  _self.sgnMoneda,
                  x.precioVenta,
                  2
                ),
                descuento1: x.descuento1,
                precioVentaFinal: _self.$formatoMoneda(
                  _self.sgnMoneda,
                  x.precioVentaFinal,
                  2
                ),
                nroFactor: x.nroFactor,
              });
            }
          });
        }
      }
    },
    rowClicked(item) {
      if (item.stockActual <= item.stockMinimo) {
        this.$refs.alerta.show("El artículo seleccionado no tiene stock.", {
          type: "warning",
          timeout: 3000,
        });
        return;
      }

      //Validar que aún no se haya seleccionado.
      if (this.detalle.length > 0) {
        let articulo = this.detalle.find(
          (x) => x.idArticulo == item.idArticulo
        );

        if (articulo != undefined) {
          this.$refs.alerta.show(`${item.nomArticulo} ya fue seleccionado.`, {
            type: "warning",
            timeout: 3000,
          });
          return;
        }
      }

      //Mostrar el mensaje del registro seleccionado
      this.$refs.alerta.show(`${item.nomArticulo} seleccionado.`, {
        type: "success",
        timeout: 2000,
      });

      //Enviamos el item seleccionado al formulario padre.
      this.$emit("seleccionarRegistro", item);
    },
    consultar() {
      let tipoFiltro = this.tipoFiltro;
      if (tipoFiltro == "") return;

      if (this.filtro == "") {
        this.$refs.alerta.show("Debe de ingresar el filtro", {
          type: "warning",
        });
        return;
      }

      let _self = this;
      _self.overlay = true;
      _self.selectedRows = [];
      _self.listaArticulo = [];

      let parameters = {
        params: {
          accion: "LIS",
          tipoFiltro: tipoFiltro,
          filtro: _self.filtro,
          flgCompra: false,
        },
      };

      _self.$axios
        .get("/api/Articulo/GetAllByFiltersHelper", parameters)
        .then((response) => {
          let result = response.data;
          if (!result.Resultado) {
            this.$refs.alerta.show(result.Mensaje, {
              type: "warning",
            });
            return;
          }

          _self.listaArticulo = result.Data.map((x) => {
            return {
              idArticulo: x.IdArticulo,
              codigo: x.Codigo,
              nomArticulo: x.NomArticulo,
              nomMarca: x.NomMarca,
              nomUm: x.NomUm,
              stockActual: x.StockActual,
              precioVentaFinal: x.PrecioVentaFinal,
              descuento1: x.Descuento1,
              idUm: x.IdUm,
              nroFactor: x.NroFactor,
              precioBase: x.PrecioBase,
              precioVenta: x.PrecioVenta,
              stockMinimo: x.StockMinimo,
              listaUm: x.ListaUm.map((y) => {
                return {
                  idUm: y.IdUm,
                  nomUm: y.NomUm,
                  nroFactor: y.NroFactor,
                  descuento1: y.Descuento1,
                  precioVenta: y.PrecioVenta,
                  precioVentaFinal: y.PrecioVentaFinal,
                };
              }),
            };
          });
        })
        .catch((error) => {
          let data = error.response.data;
          this.$refs.alerta.show(data.Message, {
            type: "warning",
          });
        })
        .finally(() => {
          _self.overlay = false;
        });
    },
  },
  computed: {
    dialog: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
  },
  props: ["value", "detalle", "sgnMoneda"],
  mounted() {
    //selectedRows[], rowMarked[] vienen de un archivo js utlidades.
    let _self = this;
    window.addEventListener("keydown", (e) => {
      if (!_self.dialog) return;

      if (_self.listaArticulo.length == 0) return;

      let modelo = null;

      if (
        e.key == "Enter" ||
        e.key == "Escape" ||
        e.key == "ArrowDown" ||
        e.key == "ArrowUp"
      ) {
        //Ayuda del teclado(abajo, arriba, enter, esc)
        let config = {
          tbody: _self.$refs.tbodyBus,
          txtFiltro: _self.$refs.txtFiltro,
          indexColumn: 1,
        };

        _self
          .$direccionarFilasGrilla(e, config)
          .then((value) => {
            if (e.key == "Enter") {
              //Retornará el articulo seleccionado al componente padre.
              modelo = _self.listaArticulo.find((x) => x.codigo == value);
              _self.rowClicked(modelo, e);
            } else if (e.key == "Escape") {
              if (_self.dialog) {
                if (_self.dialogUm) _self.dialogUm = false;
                else _self.dialog = false;
              }
            } else {
              //Flecha arriba, abajo
              //Maracará la fila
              modelo = _self.listaArticulo.find((x) => x.codigo == value);
              if (modelo != undefined) {
                _self.paintRow(modelo);
              }
            }
          })
          .catch((errorMessage) => {
            if (errorMessage != "") {
              throw new Error(errorMessage);
            }
          });
      } else if (e.key == "+") {
        _self.abrirDialogoUm();
      }
    });
  },
};
</script>
