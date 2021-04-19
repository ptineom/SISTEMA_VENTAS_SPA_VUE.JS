export const rowMarked = {
  data() {
    return {
      selectedRows: [],
    }
  },
  methods: {
    rowSelected(value) {
      //Quitamos el valor en caso este ya agregado.
      if (this.selectedRows.includes(value)) {
        this.selectedRows.splice(this.selectedRows.indexOf(value), 1);
      } else {
        this.selectedRows = [];
        //Agregamos el valor a la lista.
        this.selectedRows.push(value);
      }
    },
  },
}