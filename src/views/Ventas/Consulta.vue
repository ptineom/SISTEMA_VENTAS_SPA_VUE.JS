<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card tile class="color-fondo">
      <v-card-title class="py-1 white">
        <span class="headline text-button">
          <v-icon>mdi-monitor-multiple</v-icon>
          Consultar ventas [ESC = Salir]
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir()"
          >mdi-window-close</v-icon
        >
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-1">
        <v-card class="my-1" tile>
          <v-card-text class="py-0">
            <v-row>
              <v-col md="2" class="py-0">
                <v-radio-group v-model="tipoFiltro" column>
                  <v-radio label="Por cliente" value="cliente"></v-radio>
                  <v-radio
                    label="Por comprobante"
                    value="comprobante"
                  ></v-radio>
                  <v-radio
                    label="Rango de fechas"
                    value="rangoFechas"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col md="9" class="pb-0">
                <template v-if="tipoFiltro == 'cliente'">
                  <v-row>
                    <v-col md="2" class="py-0 pr-0">
                      <v-select
                        dense
                        label="Tipo documento"
                        outlined
                        required
                        :items="arrDocumentos"
                        class="ajuste"
                        v-model="cliente.idTipoDocumento"
                        @change="seleccionarDocumento"
                      ></v-select>
                    </v-col>
                    <v-col md="3" class="py-0 px-1">
                      <v-text-field
                        label="N° documento"
                        type="text"
                        outlined
                        dense
                        :autocomplete="'off'"
                        @keypress="$soloNumerosEnteros($event)"
                        class="ajuste"
                        :maxlength="getMaxDigitos()"
                        ref="txtNroDocumento"
                        v-model="cliente.nroDocumento"
                        @keyup.enter="obtenerClientePorDocumento()"
                      >
                        <template slot="append">
                          <v-btn
                            icon
                            small
                            style="cursor: pointer"
                            @click="obtenerClientePorDocumento()"
                            title="Búsqueda por documento"
                            raised
                          >
                            <v-icon style="color: #4caf50"
                              >mdi-keyboard-return</v-icon
                            >
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
                    <v-col md="7" class="py-0 px-0">
                      <v-text-field
                        label="Cliente"
                        type="text"
                        outlined
                        dense
                        disabled
                        class="ajuste"
                        filled
                        v-model="cliente.nomCliente"
                      />
                    </v-col>
                  </v-row>
                </template>
                <template v-else-if="tipoFiltro == 'comprobante'">
                  <v-row>
                    <v-col md="3" class="py-0 pr-0">
                      <v-select
                        dense
                        label="Tipo comprobante"
                        outlined
                        ref="cboTipCom"
                        class="ajuste"
                        :items="arrComprobantes"
                        v-model="comprobante.idTipoComprobante"
                        @change="$refs.txtSerie.focus()"
                      ></v-select>
                    </v-col>
                    <v-col md="2" class="py-0 px-1">
                      <v-text-field
                        label="Serie"
                        type="text"
                        outlined
                        dense
                        class="ajuste"
                        v-model="comprobante.nroSerie"
                        ref="txtSerie"
                        @keyup.enter="$refs.txtNroComprobante.focus()"
                      />
                    </v-col>
                    <v-col md="2" class="py-0 px-0">
                      <v-text-field
                        label="Número"
                        type="text"
                        outlined
                        dense
                        class="ajuste"
                        v-model="comprobante.nroDocumento"
                        @keypress="$soloNumerosEnteros($event)"
                        ref="txtNroComprobante"
                      />
                    </v-col>
                  </v-row>
                </template>
                <v-row>
                  <v-col md="4" class="py-0 pr-0">
                    <v-menu
                      ref="menuRangoFechas"
                      v-model="showRangoFechas"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      :close-on-content-click="false"
                      :return-value.sync="fechaRango"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          label="Rango de fechas"
                          prepend-inner-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          outlined
                          dense
                          class="ajuste"
                          v-model="dateRangeText"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="fechaRango"
                        no-title
                        locale="es-pe"
                        :first-day-of-week="1"
                        scrollable
                        range
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          color="success"
                          @click="$refs.menuRangoFechas.save(fechaRango)"
                        >
                          Aceptar
                        </v-btn>
                        <v-btn color="error" @click="showRangoFechas = false">
                          Cancelar
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col md="3" class="py-0 px-1">
                    <v-select
                      dense
                      label="Estado"
                      outlined
                      class="ajuste"
                      :items="arrEstados"
                      v-model="idEstado"
                    ></v-select>
                  </v-col>
                  <v-col md="3" class="py-0 px-0">
                    <v-btn dense color="info" @click="consultarVentas()"
                      ><v-icon> mdi-magnify </v-icon> Consultar</v-btn
                    >
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card tile>
          <v-card-title class="py-0">
            <span class="headline text-button">
              <v-icon>mdi-clipboard-text</v-icon>
              Listado de comprobantes de ventas
            </span>
          </v-card-title>
          <v-card-text class="px-0" tile>
            <v-data-table
              :headers="headersConsulta"
              :items="listadoVentas"
              class="elevation-1"
              dense
              tile
            >
              <template v-slot:body="{ items }">
                <tbody>
                  <tr v-for="item in items" :key="item.comprobante">
                    <td class="pl-1 pr-0">
                      <v-btn
                        color="warning"
                        small
                        @click="obtenerVentaPorCodigo(item)"
                        style="cursor: pointer"
                      >
                        <v-icon>mdi-gesture-tap</v-icon>
                      </v-btn>
                    </td>
                    <td>{{ item.comprobante }}</td>
                    <td>{{ item.docCliente }}</td>
                    <td>{{ item.nomCliente }}</td>
                    <td class="text-right">
                      {{
                        `${item.sgnMoneda} ${$formatoMilesRegex(
                          item.totVenta,
                          2
                        )}`
                      }}
                    </td>
                    <td>{{ item.fecDocumento }}</td>
                    <td>
                      <v-chip
                        :color="getColorFormaPago(item.flgEvaluaCredito)"
                        dark
                        small
                      >
                        {{ item.nomTipoCondicionPago }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip
                        :color="getColorEstado(item.estDocumento)"
                        dark
                        label
                        small
                      >
                        {{ item.nomEstado }}
                      </v-chip>
                    </td>
                    <td>
                      <v-btn color="info" small>
                        <v-icon>mdi-email-outline</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-card-text>
      <AlertSB ref="alerta"></AlertSB>
    </v-card>
  </v-dialog>
</template>
<script src="@/assets/js/Scripts/Ventas/consulta.js"></script>