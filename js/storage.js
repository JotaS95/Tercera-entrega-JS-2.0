/**
 * storage.js - Manejo persistente de datos
 */

const StorageManager = {
    // Claves para LocalStorage
    KEYS: {
        TRANSACCIONES: "presuFinal_transacciones",
        PRESUPUESTO: "presuFinal_presupuesto"
    },

    // Guardar transacciones
    guardarTransacciones(lista) {
        localStorage.setItem(this.KEYS.TRANSACCIONES, JSON.stringify(lista));
    },

    // Obtener transacciones
    obtenerTransacciones() {
        const data = localStorage.getItem(this.KEYS.TRANSACCIONES);
        return data ? JSON.parse(data) : [];
    },

    // Guardar presupuesto
    guardarPresupuesto(valor) {
        localStorage.setItem(this.KEYS.PRESUPUESTO, valor.toString());
    },

    // Obtener presupuesto
    obtenerPresupuesto() {
        const data = localStorage.getItem(this.KEYS.PRESUPUESTO);
        return data ? parseFloat(data) : 0;
    },

    // Limpiar todo
    limpiarTodo() {
        localStorage.removeItem(this.KEYS.TRANSACCIONES);
        localStorage.removeItem(this.KEYS.PRESUPUESTO);
    }
};
