<template>
  <div class="inputName">
    <input type="text" v-model="name" />
    <button type="button" class="warning" @click="$emit('click', name)">update</button>
    <button type="button" class="success" @click="$emit('actualizar', name)">update</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      name: "",
    };
  },
};
</script>
<style >
    .inputName{
        background: white;
        padding: 5px;
    }
</style>