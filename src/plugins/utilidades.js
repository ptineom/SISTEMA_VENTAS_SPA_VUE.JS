//Objeto plugin, puede exportarse para ser usado en cualquier parte
const MyPlugin = {
    // El método "install" es todo lo que se necesita.
    // Toma el objeto Vue global así como las opciones definidas por el usuario.
    install(Vue, options) {
        let _self = Vue.prototype;

        Vue.prototype.$revertir = (texto) => {
            return texto.split("").reverse().join("");
        };

        Vue.prototype.$soloNumerosEnteros = (event) => {
            // let regex = /^\d+$/;
            let regex = /^[0-9]+$/;
            if (!regex.test(event.key))
                event.preventDefault();
        };

        Vue.prototype.$convertToInt = (numero) => {
            let entera = parseInt(numero);
            let decimal = (parseFloat(numero) - entera);
            let resultado = decimal > 0 ? numero.toFixed(2) : entera;
            return resultado;
        };

        Vue.prototype.$formatoMiles = (numero, decimales, siEsCeroEsvacio) => {
            if (isNaN(numero)) {
                numero = 0;
            }
            if ((decimales != undefined && isNaN(decimales)) || (decimales == undefined)) {
                decimales = 2;
            }

            if (siEsCeroEsvacio != undefined) {
                if (siEsCeroEsvacio && numero == 0)
                    return '';
            }
            //return numero.toFixed(decimales).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,")
            return numero.toFixed(decimales).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
        };
        Vue.prototype.$formatoMiles_old = (numero, decimales) => {
            if (numero == "") return "";
            if (decimales != undefined) numero = parseFloat(numero).toFixed(decimales);//Agregamos los decimales
            numero = numero.toString();
            // Variable que contendrá el resultado final
            let nuevoNumero = "";
            // Si el numero empieza por el valor "-" (numero negativo)
            if (numero[0] == "-") {
                // Cogemos el numero eliminando las posibles comas que tenga, y sin
                // el signo negativo
                nuevoNumero = numero.replace(/\,/g, '').substring(1);
            } else {
                // Cogemos el numero eliminando las posibles comas que tenga
                nuevoNumero = numero.replace(/\,/g, '');
            }
            // Si tiene decimales, se los quitamos al numero
            if (numero.indexOf(".") >= 0) nuevoNumero = nuevoNumero.substring(0, nuevoNumero.indexOf("."));

            // Si tiene mas de 3 caracteres, colocamos las comas correspondientes.
            if (nuevoNumero.length > 3) {
                let seguir = true;

                let numRevertido = _self.$revertir(nuevoNumero.toString());
                while (seguir) {
                    let index = numRevertido.lastIndexOf(',');
                    let inx = index > 0 ? (index + 4) : 3;
                    let cad1 = numRevertido.slice(0, inx);
                    let cad2 = numRevertido.slice(inx);
                    numRevertido = (cad1 + ',' + cad2);
                    if (cad2.length <= 3) seguir = false;
                };
                nuevoNumero = _self.$revertir(numRevertido);
            }
            if (numero.indexOf(".") >= 0) nuevoNumero += numero.substring(numero.indexOf("."));// Si tiene decimales, se lo añadimos al numero una vez forateado con 
            return numero[0] == "-" ? ("-" + nuevoNumero) : nuevoNumero;
        };
        Vue.prototype.$direccionarFilasGrilla = (event, config) => {
            let tbody = config.tbody;
            let txtFiltro = config.txtFiltro;
            let indexColumn = config.indexColumn == undefined ? 0 : config.indexColumn;

            return new Promise((resolve, reject) => {
                //Al presionar la tecla detectamos la selección actual de la fila y retornamos el id
                //del objeto como respueta de la promesa para que mas adelante pueda ser la nueva selección.

                let keyCode =
                    event.keyCode == 40 ||
                    event.keyCode == 38 ||
                    (event.keyCode == 13 && event.target.tagName != "INPUT") || event.keyCode == 27;

                if (!keyCode) {
                    reject('');
                    return;
                }

                let rowsBody = tbody.rows;
                //No existen filas en el tbody
                if (rowsBody.length == 0) {
                    reject('');
                    return;
                };

                //Obtenemos la fila que tenga la clase rowSelect
                let arr = Array.from(rowsBody);
                let rowSelected = arr.find((x) => {
                    if (x.classList.contains("rowSelected")) {
                        return x;
                    }
                });

                let value = "";
                let index = undefined;

                //Quitamos el focus para poder manipular sin problemas el direccionamiento de la tabla.
                if (txtFiltro == undefined) {
                    reject('Debe de ingresar la referencia del filtro');
                    return;
                }
                txtFiltro.blur();

                switch (event.keyCode) {
                    case 40: //Flecha abajo
                        //Si no existe ninguna fila marcada, se marcará la primera fila.

                        if (rowSelected == undefined) {
                            value = rowsBody[0].cells[indexColumn].textContent;
                            resolve(value);
                        } else {
                            index = rowSelected.rowIndex;

                            //Si no existe fila siguiente
                            if (rowsBody[index] == undefined) {
                                reject('');
                                return;
                            };;

                            value = rowsBody[index].cells[indexColumn].textContent;
                            resolve(value);
                        }
                        break;
                    case 38: //Flecha arriba
                        if (rowSelected == undefined) {
                            reject('');
                            return;
                        };

                        index = rowSelected.rowIndex;
                        //Solo podemos subir si la fila seleccionada actual es mayor a 1
                        if (index <= 1) {
                            txtFiltro.focus();
                            resolve("");
                            // reject('');
                            // return;
                        } else if (index > 1) {
                            //Retrocedemos
                            value = rowsBody[index - 2].cells[indexColumn].textContent;
                            resolve(value);
                        }
                        break;
                    case 13: //Enter
                        index = rowSelected.rowIndex;
                        value = rowsBody[index - 1].cells[indexColumn].textContent;
                        resolve(value);
                        break;
                    case 27: //Esc
                        resolve(false);
                        break
                }
            });
        };
        Vue.prototype.$formatoMoneda = (simbolo, numero, decimales) => {
            let numeroEnMiles = _self.$formatoMiles(numero, decimales);
            let nuevoFormato = simbolo + ' ' + (numeroEnMiles == '' ? parseFloat(0).toFixed(decimales) : numeroEnMiles);
            return nuevoFormato;
        };
        Vue.prototype.$numerosDecimales = (evt, decimales) => {
            // Backspace = 8, Enter = 13, ‘0′ = 48, ‘9′ = 57, ‘.’ = 46, ‘-’ = 43
            let key = window.Event ? evt.which : evt.keyCode;
            let chark = String.fromCharCode(key);
            // Se realiza esta lógica por que cuando estan insertados todos los numeros decimales, no permite insertar
            // en la parte entera, ni modificar en cualquier parte del texto.
            // indices de la posicion del cursor.
            // si el selectionStart y selectionEnd son iguales quiere decir que no hubo seleccion de texto, pero el cursor
            // si esta situado en alguna posicion.
            let input = evt.target;
            let si = input.selectionStart;
            let sf = input.selectionEnd
            var resultado = "";
            if (si != sf) {// hubo seleccion de texto
                // capturamos los textos que se encuentra antes y despues del texto seleccionado. 
                let textoInicial = input.value.substring(0, si);
                let textoFinal = input.value.substring(sf, input.value.length);
                resultado = textoInicial + chark + textoFinal;
            } else {// solo situamos el cursor en alguna posicion del texto e intemos escribir.
                let inxPunto = input.value.indexOf('.');
                if (si <= inxPunto) {// si el intento de escribir es en el lado izquierdo del punto.
                    let textoInicial = input.value.substring(0, si);
                    let textoFinal = input.value.substring(si, input.value.length);
                    resultado = textoInicial + chark + textoFinal;
                }
            }
            let tempValue = ''
            if (resultado != "") {
                tempValue = resultado;
            } else {
                tempValue = input.value + chark;
            }
            if (key >= 48 && key <= 57) {
                if (_self.$filter(tempValue, decimales) === false) {
                    evt.preventDefault();
                }
            } else {
                if (key == 8 || key == 13 || key == 0 || key == 46) {
                    if (key == 46) {
                        if (_self.$filter(tempValue, decimales) === false) {
                            evt.preventDefault();
                        }
                    }
                } else {
                    evt.preventDefault();
                }
            }
        };
        // método que se utiliza para verificar que el formato de dicho textbox solo sea numeros con 2 decimales
        Vue.prototype.$filter = (__val__, decimales) => {
            let preg;
            if (decimales != undefined) {
                preg = new RegExp("^([0-9]+\.?[0-9]{0," + decimales + "})$");
            } else {
                preg = /^([0-9]+\.?[0-9]{0,2})$/;
            }
            if (preg.test(__val__) === true) {
                return true;
            } else {
                return false;
            }
        };
        Vue.prototype.$formatDate = (date) => {
            if (!date) return null
            const [year, month, day] = date.split('-')
            return `${day}/${month}/${year}`
        };
        ////////////////////////////Filters
        Vue.filter('capitalize', function (value) {
            if (!value) return ''

            let arr = value.split(' ');
            let count = arr.length;
            for (var i = 0; i < count; i++) {
                let palabra = arr[i].toLowerCase();
                let capitalize = (palabra.substring(0, 1).toUpperCase() + palabra.substring(1, palabra.length));
                arr[i] = capitalize;
            }
            return arr.join(' ');
        });

        Vue.filter('formatNumber', function (value) {
            return _self.$formatoMiles(value, 2);
        });

    }
};

export default MyPlugin;