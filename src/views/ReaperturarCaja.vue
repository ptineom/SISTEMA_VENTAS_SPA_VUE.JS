<template>
  <div>
    <v-card elevation="1" tile class="mb-1">
      <v-card-title class="py-0 text-button">
        <span class="headline text-button">
          <v-icon>mdi-filter</v-icon>
          Búsqueda por filtros
        </span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pb-1">
        <v-row>
          <v-col cols="12" md="3" class="pt-0">
            <v-select
              dense
              label="Caja"
              outlined
              :items="listaCaja"
              hide-details
              v-model="idCaja"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3" class="pt-0">
            <v-select
              dense
              label="Usuario"
              outlined
              :items="listaUsuario"
              hide-details
              v-model="idUsuario"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4" class="pt-0">
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
                  hide-details
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
          <v-col cols="6" md="2" class="pt-0 px-0">
            <v-btn dense color="info" @click="consultar()"
              ><v-icon> mdi-magnify </v-icon> Consultar</v-btn
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card tile>
      <v-card-title class="py-1 pl-1">
        <span class="headline text-body-1">
          <v-icon>mdi-clipboard-text</v-icon>
          Listado de cajas aperturadas
        </span>
      </v-card-title>
      <v-card-text class="px-0" tile>
        <v-data-table
          :headers="headersConsulta"
          :items="listaCajaApertura"
          class="elevation-1"
          dense
          tile
          :mobile-breakpoint="0"
          :items-per-page="
            $vuetify.breakpoint.xsOnly || $vuetify.breakpoint.smOnly ? 5 : 10
          "
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.comprobante">
                <td class="pl-1 pr-0 text-caption">
                  <v-btn color="warning" small style="cursor: pointer" @click="reaperturarCaja(item)"
                  :disabled="item.flgCierre?false:true">
                    <v-icon>mdi-gesture-tap</v-icon>
                  </v-btn>
                </td>
                <td class="text-caption">{{ item.nomCaja }}</td>
                <td class="text-caption">{{ item.nomUsuario }}</td>
                <td class="text-caption">{{ item.fechaApertura }}</td>
                <td class="text-caption">{{ item.fechaCierre }}</td>
                <td class="text-right text-caption">
                  {{
                    `${item.sgnMoneda} ${$formatoMiles(item.montoApertura, 2)}`
                  }}
                </td>
                <td class="text-right text-caption">
                  {{ `${item.sgnMoneda} ${$formatoMiles(item.montoTotal, 2)}` }}
                </td>
                <td class="text-caption">
                  <v-chip
                    :color="getColorEstadoCaja(item.flgCierre)"
                    dark
                    small
                  >
                    {{ item.flgCierre?'Cerrado':'Abierto' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>  
<script src="@/assets/js/Scripts/reaperturarCaja.js" ></script>  