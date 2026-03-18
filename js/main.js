/**
 * main.js - Lógica principal y orquestación
 */

const App = {
    usuario: null,
    transacciones: [],
    presupuesto: 0,

    async iniciar() {
        const usuarios = StorageManager.obtenerUsuarios();
        UIManager.renderizarUsuarios(usuarios,
            (u) => this.seleccionarUsuario(u),
            (u) => this.confirmarEliminarUsuario(u)
        );

        document.getElementById("btn-ingresar").onclick = () => this.login();
        document.getElementById("input-login-usuario").onkeydown = (e) => {
            if (e.key === "Enter") this.login();
        };
    },

    login() {
        const input = document.getElementById("input-login-usuario");
        const nombre = input.value.trim();

        if (nombre === "") {
            UIManager.notificar("Ingresá tu nombre para continuar", "error");
            return;
        }

        this.seleccionarUsuario(nombre);
    },

    seleccionarUsuario(nombre) {
        this.usuario = nombre;
        StorageManager.registrarUsuario(nombre);
        this.cargarDatosUsuario();
    },

    async cargarDatosUsuario() {
        await this.cargarCategorias();

        this.transacciones = StorageManager.obtenerTransacciones(this.usuario);
        this.presupuesto = StorageManager.obtenerPresupuesto(this.usuario);

        UIManager.mostrarApp(this.usuario);
        UIManager.notificar(`¡Bienvenido, ${this.usuario}! 👋`, "info");

        this.configurarEventos();
        this.actualizarUI();
    },

    async cargarCategorias() {
        try {
            const respuesta = await fetch("data/transacciones.json");
            if (!respuesta.ok) throw new Error("No se pudo cargar el JSON");
            const categorias = await respuesta.json();
            console.log("Categorías cargadas:", categorias);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        } finally {
            console.log("Carga de datos finalizada.");
        }
    },

    configurarEventos() {
        document.getElementById("formulario-gastos").onsubmit = (e) => this.procesarNuevaTransaccion(e);
        document.getElementById("btn-guardar-presupuesto").onclick = () => this.cambiarPresupuesto();
        document.getElementById("btn-cerrar-sesion").onclick = () => this.cerrarSesion();
        document.getElementById("btn-reiniciar-todo").onclick = () => this.reiniciarDatos();
    },

    procesarNuevaTransaccion(e) {
        e.preventDefault();

        const descripcion = document.getElementById("input-descripcion").value.trim();
        const monto = this.parsearMonto(document.getElementById("input-monto").value);
        const tipo = document.getElementById("select-tipo").value;

        if (descripcion === "") {
            UIManager.notificar("La descripción no puede estar vacía", "error");
            return;
        }

        if (isNaN(monto) || monto <= 0) {
            UIManager.notificar("Ingresá un monto válido mayor a 0 (ej: 1500 o 1500,50)", "error");
            return;
        }

        const nueva = {
            id: Date.now(),
            descripcion: descripcion,
            monto: monto,
            tipo: tipo
        };

        this.transacciones.push(nueva);
        StorageManager.guardarTransacciones(this.usuario, this.transacciones);
        e.target.reset();
        UIManager.notificar("Movimiento registrado ✓");
        this.actualizarUI();
    },

    // Normalizar montos argentinos: acepta 1000 / 1000.50 / 1000,50 / 1.000,50
    parsearMonto(valor) {
        let raw = String(valor).trim();
        // Estilo europeo/AR con punto de miles y coma decimal: "1.500,50"
        if (raw.includes(".") && raw.includes(",")) {
            raw = raw.replace(/\./g, "").replace(",", ".");
        }
        // Solo coma como decimal: "1500,50"
        else if (raw.includes(",")) {
            raw = raw.replace(",", ".");
        }
        // Solo punto → si es "1.000" (3 dígitos exactos al final) lo trata como miles
        else if (/^\d+\.\d{3}$/.test(raw)) {
            raw = raw.replace(".", "");
        }
        return parseFloat(raw);
    },

    cambiarPresupuesto() {
        const valor = parseFloat(document.getElementById("input-presupuesto").value);

        if (!isNaN(valor) && valor >= 0) {
            this.presupuesto = valor;
            StorageManager.guardarPresupuesto(this.usuario, this.presupuesto);
            document.getElementById("input-presupuesto").value = "";
            UIManager.notificar("Presupuesto actualizado ✓");
            this.actualizarUI();
        } else {
            UIManager.notificar("Ingresá un valor válido", "error");
        }
    },

    eliminarTransaccion(id) {
        UIManager.confirmarAccion(
            "¿Eliminar movimiento?",
            "Esta acción no se puede deshacer.",
            () => {
                this.transacciones = this.transacciones.filter(t => t.id !== id);
                StorageManager.guardarTransacciones(this.usuario, this.transacciones);
                UIManager.notificar("Movimiento eliminado");
                this.actualizarUI();
            }
        );
    },

    reiniciarDatos() {
        UIManager.confirmarAccion(
            "¿Borrar todos tus datos?",
            "Se borrará el historial y el presupuesto de tu cuenta.",
            () => {
                this.transacciones = [];
                this.presupuesto = 0;
                StorageManager.limpiarUsuario(this.usuario);
                UIManager.notificar("Datos eliminados");
                this.actualizarUI();
            }
        );
    },

    confirmarEliminarUsuario(nombre) {
        UIManager.confirmarAccion(
            `¿Eliminar usuario "${nombre}"?`,
            "Se borrarán todos sus datos y el historial. Esta acción no se puede deshacer.",
            () => {
                StorageManager.eliminarUsuario(nombre);
                UIManager.notificar(`Usuario "${nombre}" eliminado`, "error");
                // Refrescar los chips
                const usuarios = StorageManager.obtenerUsuarios();
                UIManager.renderizarUsuarios(usuarios,
                    (u) => this.seleccionarUsuario(u),
                    (u) => this.confirmarEliminarUsuario(u)
                );
            }
        );
    },

    cerrarSesion() {
        this.usuario = null;
        this.transacciones = [];
        this.presupuesto = 0;
        document.getElementById("input-login-usuario").value = "";
        const usuarios = StorageManager.obtenerUsuarios();
        UIManager.renderizarUsuarios(usuarios,
            (u) => this.seleccionarUsuario(u),
            (u) => this.confirmarEliminarUsuario(u)
        );
        UIManager.mostrarLogin();
    },

    actualizarUI() {
        const { balance, totalGastos } = UIManager.actualizarStats(this.presupuesto, this.transacciones);
        UIManager.renderizarLista(this.transacciones, (id) => this.eliminarTransaccion(id));

        const pct = UIManager.actualizarProgreso(this.presupuesto, totalGastos);

        // Alertas de presupuesto (solo si hay presupuesto definido)
        if (this.presupuesto > 0 && pct !== undefined) {
            if (balance < 0) {
                UIManager.notificar("⛔ ¡Superaste el presupuesto!", "error");
            } else if (pct >= 90) {
                UIManager.notificar("🔴 Atención: usaste más del 90% del presupuesto", "error");
            } else if (pct >= 70 && pct < 90) {
                UIManager.notificar("🟡 Vas por el 70% del presupuesto", "info");
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.iniciar();
});
