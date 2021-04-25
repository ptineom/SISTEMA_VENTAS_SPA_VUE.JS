<template>
  <div>
    <v-row>
      <v-col cols="12" class="py-0">
        <v-card elevation="1" tile v-show="vista == 2">
          <v-card-text class="pt-2 pb-0">
            <v-row>
              <v-col cols="12" lg="10" class="py-0 px-2">
                <v-row>
                  <v-col cols="12" md="2" class="py-1 px-1">
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
                  <v-col cols="12" md="10" class="py-1 px-1">
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
                  <v-col cols="12" md="9" class="py-1 px-1">
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
                  <v-col cols="12" sm="5" md="3" class="py-1 px-1">
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
                  <v-col cols="12" sm="7" md="6" class="py-1 px-1">
                    <v-text-field
                      label="Marca"
                      type="text"
                      outlined
                      dense
                      :autocomplete="'off'"
                      ref="txtNroDoc"
                      clearable
                      hide-details
                      v-model="nomMarca"
                      readonly
                      @click:clear="modelo.idMarca = ''"
                    >
                      <template slot="prepend">
                        <v-icon
                          @click="abrirDlgMarca(2)"
                          title="Nuevo"
                          style="cursor: pointer; color: #82b1ff"
                          >mdi-file-outline
                        </v-icon>
                      </template>
                      <template slot="append">
                        <v-btn
                          @click="abrirDlgMarca(1)"
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
                  <v-col cols="12" sm="6" md="3" class="py-1 px-1">
                    <v-select
                      dense
                      label="Grupo"
                      outlined
                      hide-details
                      :items="listaGrupo"
                      v-model="modelo.idGrupo"
                      @change="llenarCboFamilia()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="3" class="py-1 px-1">
                    <v-select
                      dense
                      label="Familia"
                      outlined
                      hide-details
                      :items="listaFamilia"
                      v-model="modelo.idFamilia"
                      @change="llenarCboUm()"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="2" class="py-1 px-1">
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
                      :autocomplete="'off'"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="2" class="py-1 px-1">
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

                  <v-col cols="6" sm="4" md="2" class="py-1 px-1">
                    <v-checkbox
                      label="Importado"
                      hide-details
                      class="shrink mr-0 mt-0"
                      v-model="modelo.flgImportado"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6" sm="4" md="2" class="py-1 px-1">
                    <v-checkbox
                      label="Inactivo"
                      hide-details
                      class="shrink mr-0 mt-0"
                      v-model="modelo.flgInactivo"
                    ></v-checkbox>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="2"
                    offset-md="2"
                    class="py-1 px-1"
                  >
                    <v-text-field
                      label="Moneda"
                      type="text"
                      dense
                      hide-details
                      readonly
                      outlined
                      v-model="monedaLocal.sgnMoneda"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="px-1 pt-1">
                    <v-card color="light-green lighten-5" elevation="4">
                      <v-tabs
                        v-model="tab"
                        background-color="transparent"
                        fixed-tabs
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
                                        :mobile-breakpoint="0"
                                      >
                                        <template v-slot:body="{ items }">
                                          <tbody ref="tbodyUmDscto">
                                            <tr
                                              v-for="(item, i) in items"
                                              :key="i"
                                            >
                                              <td>
                                                <v-select
                                                  hide-details
                                                  v-model="item.idUm"
                                                  single-line
                                                  dense
                                                  label="Unidad medida"
                                                  :items="item.listaUm"
                                                  @change="
                                                    seleccionarUM(item, i)
                                                  "
                                                >
                                                </v-select>
                                              </td>
                                              <td>
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
                                              <td class="text-right">
                                                {{ item.precioVenta }}
                                              </td>
                                              <td class="text-center">
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
                                              <td>
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
                                                  @paste.native="
                                                    (event) =>
                                                      event.preventDefault()
                                                  "
                                                ></v-text-field>
                                              </td>
                                              <td>
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
                                              <td>
                                                <v-menu
                                                  v-model="item.showFecIniPro"
                                                  transition="scale-transition"
                                                  offset-y
                                                  min-width="290px"
                                                  :close-on-content-click="true"
                                                >
                                                  <template
                                                    v-slot:activator="{
                                                      on,
                                                      attrs,
                                                    }"
                                                  >
                                                    <v-text-field
                                                      v-model="
                                                        item.fecIniProFormatted
                                                      "
                                                      placeholder="dd/mm/aaaa"
                                                      append-outer-icon="mdi-calendar"
                                                      readonly
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      hide-details
                                                      dense
                                                      :disabled="
                                                        !item.flgPromocion
                                                      "
                                                    ></v-text-field>
                                                  </template>
                                                  <v-date-picker
                                                    v-model="
                                                      item.fecInicioPromocion
                                                    "
                                                    no-title
                                                    locale="es-pe"
                                                    :first-day-of-week="1"
                                                    scrollable
                                                    @change="
                                                      cambiarfecha(
                                                        $event,
                                                        item,
                                                        'fechaInicialPromocion'
                                                      )
                                                    "
                                                  >
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                      color="error"
                                                      @click="
                                                        item.showFecIniPro = false
                                                      "
                                                    >
                                                      Cancelar
                                                    </v-btn>
                                                  </v-date-picker>
                                                </v-menu>
                                              </td>
                                              <td>
                                                <v-menu
                                                  v-model="item.showFecFinPro"
                                                  transition="scale-transition"
                                                  offset-y
                                                  min-width="290px"
                                                  :close-on-content-click="true"
                                                >
                                                  <template
                                                    v-slot:activator="{
                                                      on,
                                                      attrs,
                                                    }"
                                                  >
                                                    <v-text-field
                                                      v-model="
                                                        item.fecFinProFormatted
                                                      "
                                                      placeholder="dd/mm/aaaa"
                                                      append-outer-icon="mdi-calendar"
                                                      readonly
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      hide-details
                                                      dense
                                                      :disabled="
                                                        !item.flgPromocion
                                                      "
                                                    ></v-text-field>
                                                  </template>
                                                  <v-date-picker
                                                    v-model="
                                                      item.fecFinalPromocion
                                                    "
                                                    no-title
                                                    locale="es-pe"
                                                    :first-day-of-week="1"
                                                    scrollable
                                                    @change="
                                                      cambiarfecha(
                                                        $event,
                                                        item,
                                                        'fechaFinalPromocion'
                                                      )
                                                    "
                                                  >
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                      color="error"
                                                      @click="
                                                        item.showFecFinPro = false
                                                      "
                                                    >
                                                      Cancelar
                                                    </v-btn>
                                                  </v-date-picker>
                                                </v-menu>
                                              </td>
                                              <td>
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
                              <v-row>
                                <v-col cols="12">
                                  <v-data-table
                                    hide-default-footer
                                    disable-pagination
                                    :headers="headersSedes"
                                    :items="listaSucursal"
                                    class="elevation-1"
                                    dense
                                    v-model="sucursalesSeleccionados"
                                    show-select
                                    item-key="idSucursal"
                                    :single-select="singleSelect"
                                  >
                                  </v-data-table>
                                </v-col>
                              </v-row>
                            </v-card-text>
                          </v-card>
                        </v-tab-item>
                      </v-tabs-items>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" lg="2" class="py-0 px-2">
                <v-row>
                  <v-col cols="12" sm="6" md="4" lg="12" class="py-1">
                    <v-file-input
                      label="Foto"
                      prepend-icon="mdi-camera"
                      @change.native="getFile($event)"
                      clearable
                      @click:clear="limpiarFoto"
                      accept="image/*"
                      v-model="file"
                      hide-details
                      style="cursor: pointer"
                    ></v-file-input>
                  </v-col>
                  <v-col cols="12" sm="6" md="4" lg="12" class="py-1">
                    <v-card elevation="1" tile class="mb-2">
                      <v-card-text class="py-1 px-1">
                        <v-img :src="srcImg" class="mb-2"></v-img>
                      </v-card-text>
                    </v-card>
                    <v-chip>
                      <v-icon left> mdi-attachment </v-icon>
                      {{ fileSize }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col md="12" class="pt-0">
                <div class="text-left">
                  <v-btn color="success" class="mr-1" @click="grabar">
                    <v-icon>mdi-content-save</v-icon>
                    Grabar
                  </v-btn>
                  <v-btn class="mr-1" color="error" @click="cancelar">
                    <v-icon> mdi-cancel </v-icon>
                    Cancelar
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card elevation="1" tile v-show="vista == 1">
          <v-card-title class="py-0 text-button">
            <v-icon>mdi-filter</v-icon> Búsqueda por filtros
            <!-- <v-btn-toggle v-model="toggle_exclusive">
          
            </v-btn-toggle> -->
            <v-spacer></v-spacer>
              <v-btn dense  icon  small class="me-1"><v-icon color="red"> mdi-file-pdf </v-icon> </v-btn>
              <v-btn dense  icon  small ><v-icon color="success"> mdi-file-excel </v-icon>
              </v-btn>
          </v-card-title>

          <v-divider></v-divider>
          <v-card-text class="px-1 py-0">
            <v-row>
              <v-col cols="12" class="py-0">
                <v-card elevation="1" tile>
                  <v-card-text class="pt-2 pb-0">
                    <v-row>
                      <v-col cols="12" class="pt-0 pb-3">
                        <v-radio-group
                          row
                          class="mt-0"
                          hide-details
                          v-model="porTipoFiltro"
                        >
                          <v-radio label="Por código" value="codigo"></v-radio>
                          <v-radio
                            label="Por descripción"
                            value="descripcion"
                          ></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="6" class="py-1 px-0">
                        <v-text-field
                          label="Filtro"
                          type="text"
                          outlined
                          dense
                          class="text-right"
                          hide-details
                          :autocomplete="'off'"
                          placeholder="Ingrese el filtro"
                          autofocus
                          ref="txtFiltro"
                          v-model="filtro"
                          @keyup.enter="consultar"
                        />
                      </v-col>
                      <v-col class="pt-1">
                        <v-btn
                          dense
                          color="primary"
                          @click="consultar()"
                          class="mb-1"
                          ><v-icon> mdi-magnify </v-icon> Consultar</v-btn
                        >
                        <v-btn
                          class="ml-1 mb-1"
                          dense
                          color="info"
                          @click="nuevo()"
                          ><v-icon> mdi-file-plus </v-icon> Nuevo</v-btn
                        >
                        <v-btn
                          class="ml-1 mb-1"
                          dense
                          color="default"
                          @click="consultarVentas()"
                          ><v-icon color="green"> mdi-file-excel </v-icon>
                          Exportar</v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-data-table
                  :headers="headersConsulta"
                  :items="detalleConsulta"
                  class="elevation-1"
                  dense
                  tile
                  :mobile-breakpoint="0"
                >
                  <template v-slot:body="{ items }">
                    <tbody>
                      <tr v-for="item in items" :key="item.comprobante">
                        <td>{{ item.idArticulo }}</td>
                        <td class="text-caption">{{ item.nomArticulo }}</td>
                        <td class="text-caption">{{ item.nomMarca }}</td>
                        <td class="text-caption">{{ item.nomGrupo }}</td>
                        <td class="text-caption">{{ item.nomFamilia }}</td>
                        <td class="text-caption">{{ item.codigoBarra }}</td>
                        <td class="text-right text-caption">
                          {{
                            `${monedaLocal.sgnMoneda} ${$formatoMiles(
                              item.precioVentaFinal,
                              2
                            )}`
                          }}
                        </td>
                        <td>
                          <v-simple-checkbox
                            v-model="item.flgInactivo"
                            disabled
                          ></v-simple-checkbox>
                        </td>

                        <td class="px-1">
                          <v-btn
                            color="warning"
                            small
                            title="Editar"
                            @click="obtenerArticuloPorId(item.idArticulo)"
                          >
                            <v-icon>mdi-gesture-tap</v-icon>
                          </v-btn>
                          <v-btn
                            color="error"
                            small
                            class="mx-1"
                            title="Eliminar"
                            @click="eliminar(item.idArticulo, item.correlativo)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                          <v-btn color="teal" small title="Ver foto">
                            <v-icon color="white">mdi-camera</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay :value="overlay" absolute :opacity="'0.36'">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <DlgMarca ref="dlgMarca"></DlgMarca>
  </div>
</template>
<script src="@/assets/js/Scripts/articulo.js"></script>
