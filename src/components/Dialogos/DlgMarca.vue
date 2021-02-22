<template>
  <v-dialog v-model="dialog" :max-width="sizeModal">
    <v-card>
      <v-card-title>
        <span class="headline text-button">
          <v-icon>mdi-bookmark</v-icon>
          {{ getTitulo }}
        </span>
        <v-spacer></v-spacer>
        <v-icon style="cursor: pointer" @click="salir">mdi-window-close</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pb-1 px-1">
        <v-row>
          <v-col cols="12">
            <template v-if="vista == 2">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                  label="Marca"
                  type="text"
                  outlined
                  dense
                  v-model="nomMarca"
                  autofocus
                  :rules="reglas.nomMarca"
                  @keydown.enter="grabar"
                ></v-text-field>
              </v-form>
            </template>
            <template v-else-if="vista == 1">
              <v-row>
                <v-col cols="12" class="py-0">
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
                    hide-details
                  >
                    <template slot="append-outer" class="my-0">
                      <v-btn depressed color="primary" small @click="consultar">
                        <v-icon>mdi-magnify</v-icon>
                        Buscar
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="py-1">
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
                        :items="marcas"
                        tile
                      >
                        <template v-slot:body="{ items }">
                          <tbody ref="tbodyBus">
                            <tr
                              v-for="item in items"
                              :key="item.idMarca"
                            >
                              <td>
                                <v-btn
                                  color="warning"
                                  small
                                  style="cursor: pointer"
                                  @click="rowClicked(item)"
                                >
                                  <v-icon>mdi-gesture-tap</v-icon>
                                </v-btn>
                              </td>
                              <td class="text-right">{{ item.idMarca }}</td>
                              <td>{{ item.nomMarca }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="cardAction2">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="salir"
          ><v-icon>exit_to_app</v-icon> Salir</v-btn
        >
        <v-btn color="success" @click="grabar" v-if="vista == 2"
          ><v-icon>save</v-icon> Grabar
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
import alerta from "@/components/Utilitarios/AlertSB";
export default {
  components: { alerta },
  data() {
    return {
      overlay: false,
      dialog: false,
      resolve: null,
      reject: null,
      nomMarca: "",
      idMarca: "",
      valid: false,
      reglas: {
        nomMarca: [
          (value) => !!value || "Debe de ingresar el nombre de la marca",
        ],
      },
      vista: 1,
      marcas: [],
      filtro: "",
      headers: [
        { text: "", value: "seleccionar", align: "center", width:"80px" },
        { text: "Código", value: "idMarca", width:"90px" },
        { text: "descripción", value: "nomMarca" },
      ],
    };
  },
  methods: {
    show(vista) {
      //1: consulta, 2: registro
      let _self = this;
      _self.dialog = true;
      _self.vista = vista;
      return new Promise((resolve, reject) => {
        _self.resolve = resolve;
        _self.reject = reject;
      });
    },
    limpiar() {
      this.idMarca = "";
      this.nomMarca = "";
    },
    consultar() {
      let _self = this;

      if (_self.filtro.trim().length == 0) {
        _self.$refs.alerta.show("Debe de ingresar al menos un caracter", {
          color: "warning",
        });
        return;
      }

      _self.$root.$axios
        .get(`api/Marca/listaMarca/${_self.filtro}`)
        .then((response) => {
          _self.marcas = response.data.data;
        })
        .catch((error) => {
          _self.$root.$alertSB(error.response.data.Message);
        });
    },
    grabar() {
      let _self = this;
      let validate = _self.$refs.form.validate();
      if (validate) {
        _self.$root
          .$confirm(_self.getTitulo, "¿Desea guardar los datos?")
          .then(() => {
            _self.$axios
              .post("api/Marca/grabarMarca", { nomMarca: _self.nomMarca })
              .then((response) => {
                let data = response.data;
                if (data.bResultado) {
                  _self.resolve({
                    idMarca: data.data,
                    nomMarca: _self.nomMarca,
                  });
                  _self.limpiar();
                  _self.dialog = false;
                }
              })
              .catch((error) => {
                _self.$root.$alertSB(error.response.data.Message, {
                  color: "warning",
                });
              });
          })
          .catch(() => {});
      }
    },
    salir() {
      if (this.vista == 1) {
        this.filtro = "";
        this.marcas = [];
      } else {
        this.$refs.form.resetValidation();
        this.limpiar();
      }
      this.reject();
      this.dialog = false;
    },
    rowClicked(item) {
      this.resolve({
        idMarca: item.idMarca,
        nomMarca: item.nomMarca,
      });
      this.filtro = "";
      this.marcas = [];
      this.dialog = false;
    },
  },
  computed: {
    sizeModal() {
      return this.vista == 1 ? "600px" : "450px";
    },
    getTitulo() {
      return this.vista == 1 ? "Buscar marca" : "Registrar marca";
    },
  },
};
</script>