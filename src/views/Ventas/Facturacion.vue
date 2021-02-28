<template>
  <div >
    <v-row>
        <v-col cols="6" class="py-0 px-1">
          <v-card elevation="1" tile :disabled="bSeleccionarComprobante">
            <v-card-title class="py-0 text-button">
              <v-icon> mdi-file-document </v-icon>
              Datos del comprobante
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-2 pb-0">
              <v-row>
                <v-col md="5" class="pt-0 px-1">
                  <v-select
                    dense
                    label="Tipo comprobante"
                    outlined
                    required
                    :items="arrComprobantes"
                    v-model="modelo.idTipoComprobante"
                    @change="documentosXComprobante"
                    ref="cboTipCom"
                    hide-details
                    
                  ></v-select>
                </v-col>
                <v-col md="3" class="pt-0 px-1">
                  <v-text-field
                    label="Serie"
                    type="text"
                    outlined
                    dense
                    disabled
                    class="text-right"
                    filled
                    v-model="modelo.nroSerie"
                    hide-details
                  />
                </v-col>
                <v-col md="4" class="pt-0 px-1">
                  <v-text-field
                    label="Número"
                    type="text"
                    outlined
                    dense
                    disabled
                    filled
                    v-model="modelo.nroDocumento"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col md="4" class="pt-0 px-1">
                  <v-menu
                    v-model="showFecEmi"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    :close-on-content-click="true"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="fecEmiFormatted"
                        label="Fecha emisión"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        outlined
                        dense
                        hide-details
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="modelo.fechaEmision"
                      no-title
                      locale="es-pe"
                      :first-day-of-week="1"
                      scrollable
                      :allowed-dates="allowedDatesFechaEmision"
                    >
                      <v-spacer></v-spacer>
                      <v-btn color="error" @click="showFecEmi = false">
                        Cancelar
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-col>
                <v-col md="4" class="pt-0 px-1">
                  <v-menu
                    ref="txtHorEmi"
                    v-model="showHorEmi"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="modelo.horaEmision"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <div class="d-flex flex-row align-center">
                        <v-checkbox
                          v-model="chkHorEmi"
                          hide-details
                          class="shrink mr-0 mt-0"
                        ></v-checkbox>
                        <v-text-field
                          v-model="modelo.horaEmision"
                          label="Hora emisión"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          outlined
                          dense
                          append-icon="mdi-clock-time-four-outline"
                          :disabled="!chkHorEmi"
                          :filled="!chkHorEmi"
                          hide-details
                        ></v-text-field>
                      </div>
                    </template>
                    <v-time-picker
                      v-if="showHorEmi"
                      v-model="modelo.horaEmision"
                      full-width
                      @click:minute="$refs.txtHorEmi.save(modelo.horaEmision)"
                      format="24hr"
                      :max="getHoraActual()"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                <v-col md="4" class="pt-0 px-1">
                  <v-menu
                    ref="txtFecVen"
                    v-model="showFecVen"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="fecVenFormatted"
                        label="Fecha vencimiento"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        outlined
                        dense
                        hide-details
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="modelo.fechaVencimiento"
                      no-title
                      @input="showFecVen = false"
                      locale="es-pe"
                      :first-day-of-week="1"
                      scrollable
                      :allowed-dates="allowedDatesFechaVencimiento"
                    >
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="showFecVen = false">
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.txtFecVen.save(fechaVencimiento)"
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" class="py-0 px-1">
          <v-card elevation="1" tile :disabled="bSeleccionarComprobante">
            <v-card-title class="py-0 text-button">
              <v-icon> mdi-account-multiple </v-icon>
              Datos del cliente
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-2 pb-0">
              <v-row>
                <v-col md="5" class="pt-0 px-1">
                  <v-select
                    dense
                    label="Tipo documento"
                    outlined
                    required
                    v-model="cliente.idTipoDocumento"
                    :items="arrDocumentos"
                    ref="cboTipDoc"
                    @change="seleccionarTipoDocumento($event)"
                    hide-details
                    clearable
       
                  ></v-select>
                </v-col>
                <v-col md="7" class="pt-0 px-1">
                  <v-text-field
                    label="N° documento"
                    type="text"
                    outlined
                    dense
                    :autocomplete="'off'"
                    @keypress="$soloNumerosEnteros($event)"
                    v-model="cliente.nroDocumento"
                    @keyup.enter="obtenerClientePorDocumento"
                    ref="txtNroDoc"
                    hide-details
                    :maxlength="maxlengthDocumento"
                  >
                    <template slot="prepend">
                      <v-icon
                        title="Nuevo"
                        style="cursor: pointer; color: #82b1ff"
                        >mdi-file-outline
                      </v-icon>
                    </template>
                    <template slot="append">
                        <v-btn
                            icon
                            small
                            style="cursor: pointer"
                            @click="obtenerClientePorDocumento()"
                            title="Búsqueda por documento"
                            raised
                          >
                            <v-icon style="color: #4caf50">mdi-keyboard-return</v-icon>
                          </v-btn>

                              <v-btn
                            icon
                            small
                            style="cursor: pointer"
                            @click.stop="bDialogBuscarCliente = true"
                            title="Búsqueda avanzada"
                          >
                            <v-icon>mdi-binoculars</v-icon>
                          </v-btn>

                      
                    </template>
                  </v-text-field>
                  <DlgBuscarCliente
                    v-model="bDialogBuscarCliente"
                    @seleccionarRegistro="obtenerCliente($event)"
                  ></DlgBuscarCliente>
                </v-col>
              </v-row>
              <v-row>
                <v-col md="4" class="pt-0 px-1">
                  <v-text-field
                    label="Código"
                    type="text"
                    outlined
                    dense
                    disabled
                    filled
                    hide-details
                    v-model="cliente.idCliente"
                  />
                </v-col>
                <v-col md="8" class="pt-0 px-1">
                  <v-text-field
                    label="Cliente"
                    type="text"
                    outlined
                    dense
                    disabled
                    hide-details
                    filled
                    v-model="cliente.nomCliente"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            <v-overlay :value="overlayCliente" absolute :opacity="'0.36'">
              <v-progress-circular
                indeterminate
                size="64"
              ></v-progress-circular>
            </v-overlay>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="py-1 px-1">
          <v-card elevation="1" tile :disabled="bSeleccionarComprobante">
            <v-card-text class="pt-2 pb-0">
              <v-row>
                <v-col md="4" class="pt-0 px-1">
                  <v-text-field
                    label="Búsqueda por código de barra"
                    prepend-inner-icon="mdi-barcode"
                    outlined
                    dense
                    placeholder="Ingrese código de barra"
                    @keypress.native="$soloNumerosEnteros($event)"
                    @keyup.enter="buscarXcodigoBarra"
                    :autocomplete="'off'"
                    clearable
                    v-model="fieldSearchBarcode"
                    hide-details
                  >
                    <template slot="append-outer">
                      <v-btn
                        color="light-blue darken-4"
                        @click="buscarXcodigoBarra"
                        outlined
                        small
                      >
                        <v-icon
                          title="Buscar por código de barra"
                          style="cursor: pointer"
                          >mdi-keyboard-return</v-icon
                        >
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col md="6" class="pt-0">
                  <v-btn
                    color="primary"
                    @click.stop="bDialogBuscarArticulo = true"
                  >
                    <v-icon left> mdi-cart-outline </v-icon>
                    Agregar artículos [+]
                  </v-btn>
                  <DlgBuscarArticulo
                    :detalle="detalle"
                    v-model="bDialogBuscarArticulo"
                    @seleccionarRegistro="agregarArticulo($event)"
                  ></DlgBuscarArticulo>
                </v-col>
                <v-col md="2" class="pt-0">
                  <v-select
                    dense
                    label="Moneda"
                    outlined
                    v-model="modelo.idMoneda"
                    :items="arrMonedas"
                    readonly
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="py-0 px-1">
          <v-card tile :disabled="bSeleccionarComprobante">
            <v-card-title class="py-0 text-button">
              <v-icon>mdi-cart-outline</v-icon> Detalle de la venta
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="px-2 pt-1">
              <v-data-table
                hide-default-footer
                disable-pagination
                :headers="headersDetalle"
                :items="detalle"
                class="elevation-1"
                dense
              >
                <template v-slot:body="{ items }">
                  <tbody>
                   <tr v-for="(item,i) in items" :key="i">
                      <td class="">{{ item.codigo }}</td>
                      <td class="">{{ item.descripcion }}</td>
                      <td class="">
                        <v-select
                          v-model="item.idUm"
                          single-line
                          dense
                          label="Unidad medida"
                          :items="item.unidadMedidas"
                          @change="editColumn(item, 2, i)"
                          hide-details
                        >
                        </v-select>
                      </td>
                      <td class="text-right">{{ item.nroFactor }}</td>
                      <td class="text-right">{{ item.precioUnitario }}</td>
                      <td class="">
                        <v-text-field
                          dense
                          v-model="item.cantidad"
                          reverse
                          @input="
                            (value) => {
                              item.cantidad = value;
                              editColumn(item, 5);
                            }
                          "
                          :autocomplete="'off'"
                          hide-details
                          @keypress.native="$numerosDecimales($event, 2)"
                          @keyup.enter="$refs.descuento1_x[i].focus()"
                          ref="cantidad_x"
                        ></v-text-field>
                      </td>
                      <td class="">
                        <v-text-field
                          dense
                          v-model="item.descuento1"
                          type="number"
                          reverse
                          @input="
                            (value) => {
                              item.descuento1 = value;
                              editColumn(item, 6);
                            }
                          "
                          :autocomplete="'off'"
                          min="0"
                          max="100"
                          step="5"
                          hide-details
                          ref="descuento1_x"
                          @keyup.enter.native="$refs.importe_x[i].$refs.txtCurrencyInput.focus()"
                        ></v-text-field>
                      </td>
                      <td class="">
                        <!-- <CurrencyInput v-model="item.importe" :sgnMoneda="getMoneda"></CurrencyInput> -->
                        <CurrencyInput
                          :value="item.importe"
                          @input="
                            (value) => {
                              item.importe = value;
                              editColumn(item, 7);
                            }
                          "
                          :sgnMoneda="getMoneda()"
                          @keypress.native="$numerosDecimales($event, 2)"
                          :dense="true"
                          :hideDetails="true"
                          :reverse="true"
                          ref="importe_x"
                        >
                        </CurrencyInput>
                      </td>
                      <td class="">
                        <v-btn
                          color="error"
                          small
                          @click="quitarItem(item.idArticulo)"
                        >
                          <v-icon>mdi-delete-forever</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col md="12" class="py-1 px-1">
          <v-card tile :disabled="bSeleccionarComprobante">
            <v-card-text class="py-0">
              <v-row>
                <v-col md="4" class="py-0">
                  <v-row>
                    <v-col md="6" >
                      <v-select
                        dense
                        label="Tipo de pago"
                        v-model="modelo.idTipoPago"
                        outlined
                        :items="arrTipoPagos"
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col md="6" >
                      <v-select
                        dense
                        label="Forma de pago"
                        v-model="modelo.idTipoCondicionPago"
                        outlined
                        :items="arrFormapagos"
                        @change="seleccionarFormaPago"
                        hide-details
                      ></v-select>
                      <DlgAbonarCredito
                        :sgnMoneda="getMoneda()"
                        :allowedDatesFechaVencimiento="
                          allowedDatesFechaVencimiento
                        "
                        ref="dlgAbonarCredito"
                      ></DlgAbonarCredito>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="py-0">
                      <v-textarea
                        label="Observación"
                        auto-grow7sfg
                        outlined
                        rows="3"
                        dense
                        v-model="modelo.observacion"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col md="3" class="py-0">
                  <v-card v-show="showPanelCredito">
                    <v-card-text class="mt-2 pb-1 pt-2">
                      <v-text-field
                        :value="`${getMoneda()} ${$formatoMiles(
                          modelo.abono,
                          2
                        )}`"
                        label="A cuenta"
                        placeholder="A cuenta"
                        readonly
                        filled
                        dense
                      
                      >
                        <template slot="append">
                          <v-btn
                            color="light-blue darken-4"
                            @click="abrirDialogoAbonarCredito(true)"
                            small
                            icon
                          >
                            <v-icon
                              title="Editar el monto a cuenta"
                              style="cursor: pointer"
                              >mdi-lead-pencil</v-icon
                            >
                          </v-btn>
                        </template>
                      </v-text-field>
                      <v-text-field
                        :value="`${getMoneda()} ${$formatoMiles(
                          modelo.saldo,2)}`"
                        label="Saldo"
                        placeholder="Saldo"
                        readonly
                        :filled="true"
                        dense
                        hide-details
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col md="5" class="py-0">
                  <v-row>
                    <v-col md="3" class="pb-0 pt-1">
                      <span class="font-weight-bold" >Sub total</span>
                     </v-col>
                    <v-col md="6" offset-md="3" class="py-0 ">
                      <v-text-field
                        type="text"
                        reverse
                        dense
                        placeholder="Sub total"
                        class="color-disabled"
                        readonly
                        :value="$formatoMiles(totales.subTotal, 2)"
                        hide-details
                      />
                    </v-col>

                    <v-col md="3" class="pb-0 pt-1 ">
                    <span class="font-weight-bold"> Dscto %</span>
                    </v-col>
                    <v-col md="3" class="py-0">
                      <v-text-field
                        :autocomplete="'off'"
                        dense
                        @input="validarIngreso"
                        v-model="totales.tasaDscto"
                        type="number"
                        reverse
                        class="color-disabled"
                        min="0"
                        max="100"
                        step="5"
                        placeholder="tasa %"
                        @keypress.native="$soloNumerosEnteros($event)"
                        @paste.native="(event) => event.preventDefault()"

                        :disabled="detalle.length > 0 ? false : true"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col md="6" class="py-0">
                      <v-text-field
                        type="text"
                        reverse
                        dense
                        placeholder="Dscto"
                        class="color-disabled"
                        readonly
                        :value="$formatoMiles(totales.totalDescuento, 2)"
                        hide-details
                      />
                    </v-col>
                    <v-col md="3" class="pb-0 pt-1">
                     <span class="font-weight-bold"> I.G.V.(18%)</span>
                    </v-col>

                    <v-col md="6" offset-md="3" class="py-0 ">
                      <v-text-field
                        type="text"
                        reverse
                        dense
                        placeholder="I.G.V."
                        class="color-disabled"
                        readonly
                        :value="$formatoMiles(totales.totalIgv, 2)"
                        hide-details
                      />
                    </v-col>
                    <v-col md="3" class="pb-0 pt-1">
                     <span class="font-weight-bold"> Total </span>
                    </v-col>
                    <v-col md="6" offset-md="3" class="py-0">
                      <v-text-field
                        type="text"
                        reverse
                        dense
                        placeholder="Total"
                        class="color-disabled"
                        readonly
                        :value="$formatoMiles(totales.total, 2)"
                            hide-details
                      />
                    </v-col>
                    <v-col md="3" class="pb-0 pt-1">
                     <span class="font-weight-bold"> Redondeo </span></v-col>
                    <v-col md="3" class="py-0 ">
                      <v-text-field
                        :autocomplete="'off'"
                        dense
                        type="text"
                        reverse
                        class="color-disabled"
                        readonly
                        placeholder=""
                        :value="parseFloat(totales.redondeo).toFixed(2)"
                         hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col md="6" class="py-0 ">
                      <v-text-field
                        type="text"
                        reverse
                        dense
                        placeholder="Total a pagar"
                        class="color-disabled"
                        readonly
                        :value="totalPagarFormateado"
                          hide-details
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col md="12" class="pt-0">
          <div class="text-right">
            <v-btn color="info" class="mr-1" @click="nuevo()" >
              <v-icon>mdi-file-plus</v-icon>
              Nuevo [F6]
            </v-btn>

            <v-btn color="success" class="mr-1" @click="pagar()" :disabled="bSeleccionarComprobante">
              <v-icon>payments</v-icon>
              Pagar [F7]
            </v-btn>
            <v-btn color="error" class="mr-1 white--text" :disabled="!bSeleccionarComprobante">
              <v-icon> mdi-delete </v-icon>
              Anular
            </v-btn>

            <v-btn
              class="mr-1"
              color="primary"
              @click.stop="buscarVenta()"
            >
              <v-icon> mdi-magnify </v-icon>
              Buscar [F9]
            </v-btn>

            <v-btn color="warning" :disabled="!bSeleccionarComprobante">
              <v-icon>mdi-printer </v-icon>
              Imprimir
            </v-btn>
          </div>
        </v-col>
      </v-row>

    <v-overlay :value="overlay" absolute :opacity="'0.36'">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <DlgPago ref="dlgPago" :sgnMoneda="getMoneda()"></DlgPago>

    <Consulta  
    :arrComprobantes="arrComprobantes"
    :arrDocumentos="arrDocumentosConsulta"
    :arrEstados="arrEstados"
    ref="dlgBuscarVenta"
    ></Consulta>
    
  </div>
</template>
<script src="@/assets/js/Scripts/Ventas/facturacion.js"></script>
<style >
.color-disabled .v-input__slot {
  background: #eeeeee !important;
}

</style>