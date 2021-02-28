<template>
  <div>
    <template v-if="menuItem.children == null">
      <v-list-item
        :class="menuItem.flgRaiz ? 'border-menu' : 'fondo-sub-item'"
        link
        exact
        @click="
          menuItem.route == null
            ? undefined
            : abrirVista({
                breadcrumbs: menuItem.breadcrumbs,
                titleForm: menuItem.label,
                iconForm: menuItem.icon,
                route: menuItem.route,
                flgHome: menuItem.flgHome
              })
        "
      >
        <v-list-item-icon>
          <v-icon v-show="menuItem.flgRaiz">{{ menuItem.flgRaiz ? menuItem.icon : undefined }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-text="menuItem.label"></v-list-item-title>
      </v-list-item>
    </template>

    <template v-else>
      <v-list-group 
        :prepend-icon="menuItem.flgRaiz ? menuItem.icon : undefined"
        :class="menuItem.flgRaiz ? 'border-menu' : 'fondo-sub-item'"
        color="blueTool1"
        :sub-group="!menuItem.flgRaiz"
        :no-action="!menuItem.flgRaiz"
      >
        <template v-slot:activator exact>
          <v-list-item-title v-text="menuItem.label"></v-list-item-title>
        </template>
        <Menu
          v-for="(elem, idx) in menuItem.children"
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
    ...mapActions("ModLayout", ["setHeaderForm"]),
    abrirVista(obj) {
      this.$router.push({ name: obj.route });
      //Agregamos el titulo, icono y breadcrums al formulario abierto.
      //Se reflejará en app.vue
      this.setHeaderForm({
        breadcrumbs: obj.breadcrumbs,
        titleForm: obj.titleForm,
        iconForm: obj.iconForm,
        flgHome: obj.flgHome
      });
    },
  },
  //   props: ["menuItem", "primerNivel"]
};
</script>