<template>
  <div>
     <p v-if="errors.length" class="red--text px-4">
                <b>Por favor, corrija el(los) siguiente(s) error(es):</b>
                <ul>
                  <li v-for="(error,idx) in errors" :key="idx">{{ error }}</li>
                </ul>
     </p>
  </div>
</template>
<script>
export default {
  name: "ShowError",
  props: ["errors"],

};
</script>

