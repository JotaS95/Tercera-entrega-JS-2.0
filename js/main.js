/**
 * main.js - Lógica principal y orquestación
 */

// Estado global de la aplicación
const App = {
    transacciones: [],
    presupuesto: 0,
    categoriasCargadas: [],

    // Inicializar la aplicación
    async iniciar() {
        console.log("Iniciando Billetera Virtual...");
        
        // Cargar datos asíncronos (Fetch con Try-Catch)
        await this.cargarCategorias();

        // Cargar datos de Storage
        this.transacciones = StorageManager.obtenerTransacciones();
        this.presupuesto = StorageManager.obtenerPresupuesto();

        // Configurar Event Listeners
        this.configurarEventos();

        // Renderizar estado inicial
        this.actualizarUI();
    },

    // Cargar categorías desde JSON local
    async cargarCategorias() {
        try {
            const respuesta = await fetch("data/transacciones.json");
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo de datos");
            
            this.categoriasCargadas = await respuesta.json();
            console.log("Categorías cargadas:", this.categoriasCargadas);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            UIManager.notificar("Error al conectar con el servidor de datos", "error");
        } finally {
            // Esto siempre se ejecuta, podrías ocultar un loader aquí
            console.log("Carga de datos finalizada.");
        }
    },

    // Configurar escuchadores de eventos
    configurarEventos() {
        // Formulario de gastos
        const form = document.getElementById("formulario-gastos");
        form.onsubmit = (e) => this.procesarNuevaTransaccion(e);

        // Guardar presupuesto
        const btnPresu = document.getElementById("btn-guardar-presupuesto");
        btnPresu.onclick = () => this.cambiarPresupuesto();

        // Reiniciar todo
        const btnReset = document.getElementById("btn-reiniciar-todo");
        btnReset.onclick = () => this.reiniciarAplicacion();
    },

    // Lógica para agregar transacción
    procesarNuevaTransaccion(e) {
        e.preventDefault();

        const inputDesc = document.getElementById("input-descripcion");
        const inputMonto = document.getElementById("input-monto");
        const selectTipo = document.getElementById("select-tipo");

        // VALIDACIÓN (Sugerencia del tutor: .trim() y no-cero)
        const descripcion = inputDesc.value.trim();
        const monto = parseFloat(inputMonto.value);

        if (descripcion === "") {
            UIManager.notificar("La descripción no puede estar vacía", "error");
            return;
        }

        if (isNaN(monto) || monto <= 0) {
            UIManager.notificar("El monto debe ser un número mayor a 0", "error");
            return;
        }

        // Crear objeto de transacción
        const nueva = {
            id: Date.now(),
            descripcion: descripcion,
            monto: monto,
            tipo: selectTipo.value
        };

        // Actualizar estado
        this.transacciones.push(nueva);
        StorageManager.guardarTransacciones(this.transacciones);

        // Limpiar form y notificar
        e.target.reset();
        UIManager.notificar("Movimiento registrado con éxito");
        
        this.actualizarUI();
    },

    // Lógica para cambiar presupuesto
    cambiarPresupuesto() {
        const input = document.getElementById("input-presupuesto");
        const valor = parseFloat(input.value);

        if (!isNaN(valor) && valor >= 0) {
            this.presupuesto = valor;
            StorageManager.guardarPresupuesto(this.presupuesto);
            input.value = "";
            UIManager.notificar("Presupuesto actualizado");
            this.actualizarUI();
        } else {
            UIManager.notificar("Ingresa un monto válido", "error");
        }
    },

    // Lógica para eliminar una transacción
    eliminarTransaccion(id) {
        UIManager.confirmarAccion(
            "¿Estás seguro?",
            "Esta acción no se puede deshacer.",
            () => {
                this.transacciones = this.transacciones.filter(t => t.id !== id);
                StorageManager.guardarTransacciones(this.transacciones);
                UIManager.notificar("Elemento eliminado");
                this.actualizarUI();
            }
        );
    },

    // Lógica para reiniciar
    reiniciarAplicacion() {
        UIManager.confirmarAccion(
            "¿Reiniciar todo?",
            "Se borrarán todos los movimientos y el presupuesto.",
            () => {
                this.transacciones = [];
                this.presupuesto = 0;
                StorageManager.limpiarTodo();
                UIManager.notificar("Datos borrados");
                this.actualizarUI();
            }
        );
    },

    // El "motor" de renderizado
    actualizarUI() {
        // Calcular balance actual
        const totalMovimientos = this.transacciones.reduce((acc, t) => {
            return t.tipo === "ingreso" ? acc + t.monto : acc - t.monto;
        }, 0);

        const balanceTotal = this.presupuesto + totalMovimientos;

        // Actualizar Cabecera
        UIManager.actualizarCabecera(this.presupuesto, balanceTotal);

        // Actualizar Lista
        UIManager.renderizarLista(this.transacciones, (id) => this.eliminarTransaccion(id));
    }
};

// Arrancar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    App.iniciar();
});
