<template>
<div>
    <h1>Validar: {{bValidar}}</h1>
    <br>
    <h1>Validar2: {{bValidar2}}</h1>
    <br>
     <h1>Validar3: {{bValidar3}}</h1>
    <br>
    <h1>Cadena: {{cadena}}</h1>
    <br>
    <input type="text" @keypress="soloNumerosEnteros($event)">
    <v-text-field  @keypress.native="soloNumerosEnteros($event)"></v-text-field>
    {{probando}}
    <hr>
    <br>
    <v-text-field v-model="mensaje" type="text" color="green"></v-text-field>
    <v-btn color="success" @click="probandoEnviar()">ver</v-btn>
</div>
</template>
<script>

import {rowMarked} from '@/assets/js/Mixins/utilidades'
export default {
    name:"ComPrueba",
    mixins: [rowMarked],
    // props:["bValidar", "bValidar2", "bValidar3", "cadena"]
    props:{
        bValidar:Boolean,
        bValidar2:Boolean,
        bValidar3:Boolean,
        cadena: String,
        numero: Number
    },
    methods:{
        probandoEnviar(){
               this.$emit("enviarMensaje", this.mensaje)
        }
    },
    data(){
        return {
            mensaje: "torito"
        }
    },
    mounted() {
        this.$emit("enviarMensaje", this.mensaje)
    },

}
</script>