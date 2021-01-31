<template>
  <div>
    <v-row>
      <v-col cols="12" class="py-0">
        <v-card elevation="1" tile v-show="vista == 2">
          <v-card-text class="pt-2 pb-0">
            <v-row>
              <v-col md="10" class="py-0 px-2">
                <v-row>
                  <v-col cols="12" md="2" class="py-0 px-1">
                    <v-text-field
                      label="Código"
                      type="text"
                      outlined
                      dense
                      disabled
                      class="text-right"
                      filled
                      hide-details
                      v-model="modelo.idArticulo"
                    />
                  </v-col>
                  <v-col cols="12" md="10" class="py-0 px-1">
                    <v-text-field
                      label="Nombre artículo"
                      type="text"
                      outlined
                      dense
                      class="text-right"
                      hide-details
                      v-model="modelo.nomArticulo"
                      ref="txtNomArt"
                      @keyup.enter="$refs['txtNomVen'].focus()"
                    />
                  </v-col>
                  <v-col cols="12" md="9" class="pb-1 pt-2 px-1">
                    <v-text-field
                      label="Nombre comercial"
                      type="text"
                      outlined
                      dense
                      class="text-right"
                      hide-details
                      v-model="modelo.nomVenta"
                      ref="txtNomVen"
                      @keyup.enter="$refs.txtCodBar.focus()"
                    />
                  </v-col>
                  <v-col cols="12" md="3" class="pb-1 pt-2 px-1">
                    <v-text-field
                      label="Código de barra"
                      prepend-inner-icon="mdi-barcode"
                      outlined
                      dense
                      :autocomplete="'off'"
                      clearable
                      hide-details
                      v-model="modelo.codigoBarra"
                      ref="txtCodBar"
                      @keypress="$soloNumerosEnteros($event)"
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" class="py-1 px-1">
                    <v-text-field
                      label="Marca"
                      type="text"
                      outlined
                      dense
                      :autocomplete="'off'"
                      ref="txtNroDoc"
                      clearable
                      hide-details
                      v-model="modelo.idMarca"
                      readonly
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
                          title="Búsqueda avanzada"
                        >
                          <v-icon>mdi-binoculars</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" class="py-1 px-1">
                    <v-select
                      dense
                      label="Grupo"
                      outlined
                      hide-details
                      :items="grupos"
                      v-model="modelo.idGrupo"
                      @change="llenarCboFamilia()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="4" class="py-1 px-1">
                    <v-select
                      dense
                      label="Familia"
                      outlined
                      hide-details
                      :items="familias"
                      v-model="modelo.idFamilia"
                      @change="llenarCboUm()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="2" class="py-1 px-1">
                    <v-text-field
                      label="Precio compra"
                      type="text"
                      outlined
                      dense
                      class="text-right"
                      hide-details
                      v-model="modelo.precioCompra"
                      @keyup.enter="$refs.txtStoMin.focus()"
                      @keypress="$numerosDecimales($event, 2)"
                    />
                  </v-col>
                  <v-col cols="12" md="2" class="py-1 px-1">
                    <v-text-field
                      label="Stock mín."
                      type="text"
                      outlined
                      dense
                      class="text-right"
                      hide-details
                      v-model="modelo.stockMinimo"
                      ref="txtStoMin"
                      @keypress="$numerosDecimales($event, 2)"
                      :autocomplete="'off'"
                    />
                  </v-col>
                  <v-col cols="12" md="2" class="py-1 px-1">
                    <v-checkbox
                      label="Importado"
                      hide-details
                      class="shrink mr-0 mt-0"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="2" class="py-1 px-1">
                    <v-checkbox
                      label="Inactivo"
                      hide-details
                      class="shrink mr-0 mt-0"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col class="px-1 pt-0">
                    <v-card color="grey lighten-5">
                      <v-tabs
                        v-model="tab"
                        background-color="transparent"
                        color="basil"
                        grow
                      >
                        <v-tab> Precios y descuentos </v-tab>
                        <v-tab> Sedes </v-tab>
                      </v-tabs>

                      <v-tabs-items v-model="tab">
                        <v-tab-item>
                          <v-card color="grey lighten-5" flat>
                            <v-card-text class="py-1">
                              <v-row>
                                <v-col cols="12" class="py-1">
                                  <v-radio-group
                                    row
                                    class="mt-0"
                                    hide-details
                                    v-model="porPrecio"
                                  >
                                    <v-radio
                                      label="Por precio base"
                                      value="base"
                                    ></v-radio>
                                    <v-radio
                                      label="Por precio venta"
                                      value="venta"
                                    ></v-radio>
                                  </v-radio-group>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="4" md="3" class="py-1 px-0">
                                  <v-text-field
                                    label="Precio base"
                                    type="text"
                                    outlined
                                    dense
                                    class="text-right"
                                    hide-details
                                    v-model="modelo.precioBase"
                                    :autocomplete="'off'"
                                    @keypress="$numerosDecimales($event, 4)"
                                    :disabled="
                                      porPrecio == 'base' ? false : true
                                    "
                                    ref="txtPreBas"
                                    @input="calcularPrecioVenta($event)"
                                  />
                                </v-col>
                                <v-col cols="4" md="3" class="py-1 px-1">
                                  <v-text-field
                                    label="IGV(18%)"
                                    type="text"
                                    outlined
                                    dense
                                    class="text-right"
                                    hide-details
                                    v-model="precioIgv"
                                    disabled
                                  />
                                </v-col>
                                <v-col cols="4" md="3" class="py-1 px-0">
                                  <v-text-field
                                    label="Precio venta"
                                    type="text"
                                    outlined
                                    dense
                                    class="text-right"
                                    hide-details
                                    v-model="precioVenta"
                                    ref="txtPreVen"
                                    :autocomplete="'off'"
                                    @keypress="$numerosDecimales($event, 2)"
                                    :disabled="
                                      porPrecio == 'venta' ? false : true
                                    "
                                    @input="calcularPrecioBase($event)"
                                  />
                                </v-col>
                              </v-row>
                              <v-divider></v-divider>
                              <v-row>
                                <v-col cols="12" class="px-0">
                                  <v-card tile>
                                    <v-card-title class="py-0 text-button">
                                      Agregar unidad de medida y descuentos.
                                    </v-card-title>
                                    <v-divider></v-divider>
                                    <v-card-text class="px-2 pt-1">
                                      <v-data-table
                                        hide-default-footer
                                        disable-pagination
                                        :headers="headersUmDscto"
                                        :items="detalleUmDscto"
                                        class="elevation-1"
                                        dense
                                      >
                                        <template v-slot:body="{ items }">
                                          <tbody ref="tbodyUmDscto">
                                            <tr
                                              v-for="(item, i) in items"
                                              :key="i"
                                            >
                                              <td class="px-1">
                                                <v-select
                                                  hide-details
                                                  v-model="item.idUm"
                                                  single-line
                                                  dense
                                                  label="Unidad medida"
                                                  :items="item.unidadMedidas"
                                                  @change="
                                                    seleccionarUM(item, i)
                                                  "
                                                >
                                                </v-select>
                                              </td>
                                              <td class="px-1">
                                                <v-text-field
                                                  type="text"
                                                  hide-details
                                                  dense
                                                  v-model="item.nroFactor"
                                                  reverse
                                                  :autocomplete="'off'"
                                                  ref="txtNroFactor_x"
                                                  @keypress="
                                                    $numerosDecimales($event, 2)
                                                  "
                                                  @input="
                                                    calcularPreciosXfactorUmDscto(
                                                      $event,
                                                      item
                                                    )
                                                  "
                                                ></v-text-field>
                                              </td>
                                              <td class="px-1 text-right">
                                                {{ item.precioVenta }}
                                              </td>
                                              <td class="px-1 text-center">
                                                <v-checkbox
                                                  hide-details
                                                  class="shrink mr-0 mt-0"
                                                  v-model="item.flgPromocion"
                                                  dense
                                                  @click="
                                                    seleccionarPromocion(
                                                      item,
                                                      i
                                                    )
                                                  "
                                                ></v-checkbox>
                                              </td>
                                              <td class="px-1">
                                                <v-text-field
                                                  hide-details
                                                  dense
                                                  v-model="item.descuento"
                                                  type="number"
                                                  reverse
                                                  :autocomplete="'off'"
                                                  min="0"
                                                  max="100"
                                                  step="5"
                                                  :disabled="!item.flgPromocion"
                                                  ref="txtDescuento_x"
                                                  @keyup.enter="
                                                    $refs['txtPreVenFin_x'][
                                                      i
                                                    ].focus()
                                                  "
                                                  @keypress.native="
                                                    $numerosDecimales($event, 1)
                                                  "
                                                  @input="
                                                    calcularPvfXdsctoUmDscto(
                                                      $event,
                                                      item
                                                    )
                                                  "
                                                ></v-text-field>
                                              </td>
                                              <td class="px-1">
                                                <v-text-field
                                                  hide-details
                                                  dense
                                                  v-model="
                                                    item.precioVentaFinal
                                                  "
                                                  reverse
                                                  :autocomplete="'off'"
                                                  :disabled="!item.flgPromocion"
                                                  ref="txtPreVenFin_x"
                                                  @keypress="
                                                    $numerosDecimales($event, 2)
                                                  "
                                                  @input="
                                                    calcularDsctoXpvfUmDscto(
                                                      $event,
                                                      item
                                                    )
                                                  "
                                                ></v-text-field>
                                              </td>
                                              <td class="px-1">
                                                <v-menu
                                                  v-model="item.showFecIniPro"
                                                  transition="scale-transition"
                                                  offset-y
                                                  min-width="290px"
                                                  :close-on-content-click="true"
                                                >
                                                  <template
                                                    v-slot:activator="{on, attrs,}"
                                                  >
                                                    <v-text-field
                                                      v-model="item.fecIniProFormatted"
                                                      placeholder="dd/mm/aaaa"
                                                      append-outer-icon="mdi-calendar"
                                                      readonly
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      hide-details
                                                      dense
                                                    ></v-text-field>
                                                  </template>
                                                  <v-date-picker
                                                    v-model="item.fecInicioPromocion"
                                                    no-title
                                                    locale="es-pe"
                                                    :first-day-of-week="1"
                                                    scrollable
                                                    @change="cambiarfecha($event, item, 'fechaInicialPromocion')"
                                                   >
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                      color="error"
                                                      @click="item.showFecIniPro=false"
                                                    >
                                                      Cancelar
                                                    </v-btn>
                                                  </v-date-picker>
                                                </v-menu>
                                              </td>
                                              <td class="px-1">
                                                <v-menu
                                                  v-model="item.showFecFinPro"
                                                  transition="scale-transition"
                                                  offset-y
                                                  min-width="290px"
                                                  :close-on-content-click="true"
                                                >
                                                  <template
                                                    v-slot:activator="{on, attrs,}"
                                                  >
                                                    <v-text-field
                                                      v-model="item.fecFinProFormatted"
                                                      placeholder="dd/mm/aaaa"
                                                      append-outer-icon="mdi-calendar"
                                                      readonly
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      hide-details
                                                      dense
                                                    ></v-text-field>
                                                  </template>
                                                  <v-date-picker
                                                    v-model="item.fecFinalPromocion"
                                                    no-title
                                                    locale="es-pe"
                                                    :first-day-of-week="1"
                                                    scrollable
                                                    @change="cambiarfecha($event, item, 'fechaFinalPromocion')"
                                                   >
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                      color="error"
                                                      @click="item.showFecFinPro=false"
                                                    >
                                                      Cancelar
                                                    </v-btn>
                                                  </v-date-picker>
                                                </v-menu>
                                              </td>
                                              <td class="px-1">
                                                <v-btn
                                                  color="info"
                                                  small
                                                  @click="agregarUmDscto(i)"
                                                >
                                                  <v-icon>add</v-icon>
                                                </v-btn>
                                                <v-btn
                                                  color="error"
                                                  small
                                                  @click="
                                                    quitarUmDscto(
                                                      item.correlativo
                                                    )
                                                  "
                                                >
                                                  <v-icon
                                                    >mdi-delete-forever</v-icon
                                                  >
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
                            </v-card-text>
                          </v-card>
                        </v-tab-item>
                        <v-tab-item>
                          <v-card color="grey lighten-5" flat>
                            <v-card-text>
                              <v-data-table
                                hide-default-footer
                                disable-pagination
                                :headers="headersSedes"
                                :items="sucursales"
                                class="elevation-1"
                                dense
                              >
                                <template v-slot:body="{ items }">
                                  <tbody ref="tbodySedes">
                                    <tr v-for="(item, i) in items" :key="i">
                                      <td>
                                        <v-checkbox
                                          hide-details
                                          class="shrink mr-0 mt-0"
                                          :disabled="item.stock > 0"
                                          v-model="item.flgEnUso"
                                        ></v-checkbox>
                                      </td>
                                      <td>{{ item.nomAlmacen }}</td>
                                      <td>{{ item.stockActual }}</td>
                                      <td>{{ item.nomSucursal }}</td>
                                      <td>{{ item.direccion }}</td>
                                    </tr>
                                  </tbody>
                                </template>
                              </v-data-table>
                            </v-card-text>
                          </v-card>
                        </v-tab-item>
                      </v-tabs-items>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col md="2" class="py-0 px-2"> </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card elevation="1" tile v-show="vista == 1"> </v-card>
      </v-col>
    </v-row>

    <v-overlay :value="overlay" absolute :opacity="'0.36'">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>
<script src="@/assets/js/Scripts/articulo.js"></script>
