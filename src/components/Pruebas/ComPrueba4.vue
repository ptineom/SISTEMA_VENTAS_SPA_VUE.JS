<template>
    <div>
        <h1>Soy el ComPrueba4</h1>
        <slot name="slot1" :slotMensajeComPrueba4="mensaje" />
        <slot name="slot2" :user="cliente" />
    </div>
</template>
<script>
export default {
    data(){
        return {
            mensaje:"Mensaje desde el ComPrueba4",
            cliente: {
                idCliente:"0001",
                nomCliente: "Ransa comercial"
            }
        }
    }
}
</script>