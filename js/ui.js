/**
 * ui.js - Manipulación del DOM y Renderizado
 */

const UIManager = {
    // Elementos del DOM
    selectores: {
        contenedor: "contenedor-transacciones",
        presupuesto: "presupuesto-valor",
        balance: "balance-valor",
        form: "formulario-gastos"
    },

    // Formatear moneda
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(valor);
    },

    // Actualizar los totales en el encabezado
    actualizarCabecera(presupuesto, balance) {
        const elPresu = document.getElementById(this.selectores.presupuesto);
        const elBalance = document.getElementById(this.selectores.balance);
        
        if (elPresu) elPresu.innerText = this.formatearMoneda(presupuesto);
        if (elBalance) {
            elBalance.innerText = this.formatearMoneda(balance);
            // Cambiar color si es negativo
            elBalance.style.color = balance < 0 ? "#ff4757" : "#4a90e2";
        }
    },

    // Renderizar la lista de transacciones
    renderizarLista(transacciones, onEliminar) {
        const contenedor = document.getElementById(this.selectores.contenedor);
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (transacciones.length === 0) {
            contenedor.innerHTML = `<p style="text-align:center; color:#b2bec3; margin-top:20px;">No hay movimientos aún.</p>`;
            return;
        }

        transacciones.forEach(t => {
            const div = document.createElement("div");
            div.className = `tarjeta tarjeta-${t.tipo}`;
            
            const montoFormateado = this.formatearMoneda(t.monto);
            const claseMonto = t.tipo === "gasto" ? "monto-gasto" : "monto-ingreso";
            const signo = t.tipo === "gasto" ? "-" : "+";

            div.innerHTML = `
                <div class="tarjeta-info">
                    <strong>${t.descripcion}</strong>
                    <span class="monto ${claseMonto}">${signo} ${montoFormateado}</span>
                </div>
                <button class="btn-borrar" data-id="${t.id}">Borrar</button>
            `;

            contenedor.appendChild(div);

            // Evento para borrar (usando delegation u objeto directo)
            div.querySelector(".btn-borrar").onclick = () => onEliminar(t.id);
        });
    },

    // Mostrar notificaciones con Toastify
    notificar(mensaje, tipo = "success") {
        Toastify({
            text: mensaje,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: tipo === "success" ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
                borderRadius: "8px",
                fontSize: "14px"
            }
        }).showToast();
    },

    // Confirmación con SweetAlert2
    confirmarAccion(titulo, texto, callback) {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4a90e2',
            cancelButtonColor: '#ff4757',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }
};
