<template>
  <div>
    <h1>Esto es prueba</h1>
    <br />
    <!-- <ComPrueba :bValidar="true" :bValidar2 = "validar" bValidar3 :numero="102"  -->
    <!-- @enviarMensaje = "recibirMensaje = $event"></ComPrueba> -->
    <!-- <br>
        <ComPrueba :cadena="'hola'" ></ComPrueba> -->
    <!-- <h1>Mensaje desde el hijo</h1>
        <h2>{{recibirMensaje}}</h2> -->
    <v-btn class="success" @click="show = !show"> ver </v-btn>
    <transition name="fade">
      <p v-if="show">hola</p>
    </transition>

    <hr />
    <h1>slot: scope(avanzado)</h1>
    <ComPrueba2>
      <span>Mensaje enviado desde el padre al ComPrueba2</span>
      <p>Otro mensaje enviado desde el padre al ComPrueba2</p>
    </ComPrueba2>

    <hr />
    <ComPrueba3>
      <template v-slot:slot1>
        <div>
          <h1>Soy el slot1 del ComPrueba3</h1>
        </div>
      </template>
      <template v-slot:slot2>
        <div>
          <h1>Soy el slot2 del ComPrueba3</h1>
        </div>
      </template>
    </ComPrueba3>
    <hr />
    <ComPrueba4>
      <template v-slot:slot1="mensajeSlotComPrueba4">
        <h1>soy el slot1 del ComPrueba4</h1>
        {{ mensajeSlotComPrueba4.slotMensajeComPrueba4 }}
      </template>

      <template v-slot:slot2="{ user }">
        <h3>{{ user }}</h3>
        <h3>{{ user.idCliente }}</h3>
        <h3>{{ user.nomCliente }}</h3>
      </template>
    </ComPrueba4>
    <hr />
    <h1>Pruebas $emit</h1>
    <v-row>
      <v-col cols="12">
        Precio:
        <CurrencyInput v-model="price"></CurrencyInput>
        <!-- <myCurrencyInput :value="price" @input="(value)=>price=value"></myCurrencyInput> -->
        <!-- <myCurrencyInput :value="price" @input="price=$event"></myCurrencyInput> -->
        <p>Precio (en el componente principal):</p>
        <ModalPrueba v-model="bAbrirPrueba"></ModalPrueba>
        <!-- Hace lo mismo que lo de arriba -->
        <!-- <ModalPrueba :value="bAbrirPrueba" @input="(value)=>bAbrirPrueba=value"></ModalPrueba> -->
        <!-- <ModalPrueba :value="bAbrirPrueba" @input="bAbrirPrueba=$event"></ModalPrueba>  -->
        <v-btn @click="bAbrirPrueba=!bAbrirPrueba">Probar</v-btn>
        <hr>
        <ComButton text="Botón de ejemplo" @click="handleClick"></ComButton>
        <hr>
        <ComInputName @click="obtenerNombre(value)" ></ComInputName>
        <ComInputName @actualizar="obtenerNombre($event)" ></ComInputName>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import ComPrueba from "../components/Pruebas/ComPrueba";
import ComPrueba2 from "../components/Pruebas/ComPrueba2";
import ComPrueba3 from "../components/Pruebas/ComPrueba3";
import ComPrueba4 from "../components/Pruebas/ComPrueba4";
import ComButton from "../components/Pruebas/ComButton";
import ComInputName from "../components/Pruebas/ComInputName";

import CurrencyInput from "@/components/CurrencyInput";
import ModalPrueba from "@/components/Pruebas/ModalPrueba";
export default {
  name: "Prueba",
  components: {
    ComPrueba,
    ComPrueba2,
    ComPrueba3,
    ComPrueba4,
    myCurrencyInput,
    ModalPrueba,
    ComButton,
    ComInputName
  },
  data() {
    return {
      validar: true,
      recibirMensaje: "",
      show: true,
      price: 1234,
      bAbrirPrueba: false,
    };
  },
  methods:{
    handleClick(){
      alert("Hizo click");
    },
    obtenerNombre(nombre){
      alert(nombre);
    }
  }
};
</script>
<style >
.fade-enter-active,
.fade-leave-active {
  transition: opacity 2.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>