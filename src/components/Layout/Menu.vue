<template>
  <div>
    <template v-if="menuItem.Children == null">
      <v-list-item
        :class="menuItem.FlgRaiz ? 'border-menu' : 'fondo-sub-item'"
        link
        exact
        @click="
          menuItem.Route == null
            ? undefined
            : abrirVista({
                breadcrumbs: menuItem.Breadcrumbs,
                titleForm: menuItem.Label,
                iconForm: menuItem.Icon,
                route: menuItem.Route,
                flgHome: menuItem.FlgHome
              })
        "
      >
        <v-list-item-icon>
          <v-icon v-show="menuItem.FlgRaiz">{{ menuItem.FlgRaiz ? menuItem.Icon : undefined }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-text="menuItem.Label"></v-list-item-title>
      </v-list-item>
    </template>

    <template v-else>
      <v-list-group 
        :prepend-icon="menuItem.FlgRaiz ? menuItem.Icon : undefined"
        :class="menuItem.FlgRaiz ? 'border-menu' : 'fondo-sub-item'"
        color="blueTool1"
        :sub-group="!menuItem.FlgRaiz"
        :no-action="!menuItem.FlgRaiz"
      >
        <template v-slot:activator exact>
          <v-list-item-title v-text="menuItem.Label"></v-list-item-title>
        </template>
        <Menu
          v-for="(elem, idx) in menuItem.Children"
          :key="idx"
          :menuItem="elem"
        ></Menu>
      </v-list-group>
    </template>
  </div>
</template>
<script>
import { mapActions } from "vuex";
export default {
  name: "Menu",
  props: {
    menuItem: {},
  },
  methods: {
    ...mapActions("ModLayout", ["setHeaderForm_vx"]),
    abrirVista(obj) {
      if(this.$route.name != obj.route){
        this.$router.push({ name: obj.route});
      }
      //Agregamos el titulo, icono y breadcrums al formulario abierto.
      //Se reflejará en app.vue
      this.setHeaderForm_vx(obj);
    },
  },
  //   props: ["menuItem", "primerNivel"]
};
</script>