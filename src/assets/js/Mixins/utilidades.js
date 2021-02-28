export const rowMarked = {
  data() {
    return {
      variasFilas: false,//Opcional, en caso sean varias filas.
      selectedRows: [],
    }
  },
  methods: {
    rowMarked(value) {
      //Quitamos el valor en caso este ya agregado.
      if (this.selectedRows.includes(value)) {
        this.selectedRows.splice(this.selectedRows.indexOf(value), 1);
      } else {
        if (!this.variasFilas)
          this.selectedRows = [];

        //Agregamos el valor a la lista.
        this.selectedRows.push(value);
      }
    },
  },
}