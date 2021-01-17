export const rowMarked = {
    data(){
        return {
            variasFilas: false,
            selectedRows: [],
        }
    },
    methods: {
        rowMarked(value) {
            //Cada vez que seleccionemos alguna fila en la tabla.
            //Si existe el valor en el array "selectedRows" lo quitamos caso contrario lo agregamos.
            if (this.selectedRows.includes(value)) {
              this.selectedRows.splice(this.selectedRows.indexOf(value), 1);
            } else {
              if (!this.variasFilas) this.selectedRows = [];
              this.selectedRows.push(value);
            }
          },
    },
}