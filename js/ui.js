const FONDOS_PREDEFINIDOS = [
    { id: 'default', nombre: 'Puro y Simple', url: '', color: 'var(--primary)', isDark: false, preview: 'linear-gradient(135deg, #f5f6fa, #eef0fd)' },
    { id: 'bg-dark', nombre: 'Ondas de Color', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&format=webp', color: '#4f46e5', isDark: true, preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=40&w=400&format=webp' },
    { id: 'bg-neon', nombre: 'Burbujas Neón', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&format=webp', color: '#ec4899', isDark: true, preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=40&w=400&format=webp' },
    { id: 'bg-nature', nombre: 'Montañas Serenas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&format=webp', color: '#d97706', isDark: false, preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=40&w=400&format=webp' },
    { id: 'bg-forest', nombre: 'Bosque Místico', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&format=webp', color: '#059669', isDark: true, preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=40&w=400&format=webp' },
    { id: 'bg-cyber', nombre: 'Onda Cyber', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&format=webp', color: '#a855f7', isDark: true, preview: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=40&w=400&format=webp' },
    { id: 'bg-stars', nombre: 'Cielo Estrellado', url: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=2000&format=webp', color: '#0284c7', isDark: true, preview: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=40&w=400&format=webp' },
    { id: 'bg-sunset', nombre: 'Atardecer Cálido', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&format=webp', color: '#ea580c', isDark: true, preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=40&w=400&format=webp' },
    { id: 'bg-nebula', nombre: 'Nebulosa Púrpura', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&format=webp', color: '#9333ea', isDark: true, preview: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=40&w=400&format=webp' }
];

const UIManager = {
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 2
        }).format(valor);
    },

    formatearFecha(timestamp) {
        const fecha = new Date(timestamp);
        return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatearHora(timestamp) {
        const fecha = new Date(timestamp);
        return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    },

    // Obtener clave de día para agrupar
    claveDelDia(timestamp) {
        const f = new Date(timestamp);
        return `${f.getDate().toString().padStart(2, '0')}/${(f.getMonth() + 1).toString().padStart(2, '0')}/${f.getFullYear()}`;
    },

    mostrarLogin() {
        document.getElementById("login-screen").style.display = "flex";
        document.getElementById("app-screen").style.display = "none";
        document.body.classList.remove("has-custom-bg");
        this.aplicarFondo(null); // Resetear al fondo por defecto en login
    },

    mostrarApp(usuario) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("app-screen").style.display = "block";
        document.getElementById("navbar-nombre").innerText = usuario;
        document.getElementById("avatar-inicial").innerText = usuario.charAt(0).toUpperCase();
    },

    // Renderizar chips de usuarios con botón de eliminar
    renderizarUsuarios(usuarios, onLoginChip, onEliminarUsuario) {
        const contenedor = document.getElementById("usuarios-existentes");
        const chips = document.getElementById("chips-container");

        if (usuarios.length === 0) {
            contenedor.style.display = "none";
            return;
        }

        contenedor.style.display = "block";
        chips.innerHTML = "";

        usuarios.forEach(u => {
            const chip = document.createElement("div");
            chip.className = "chip-usuario";

            const nombre = document.createElement("span");
            nombre.textContent = u;
            nombre.onclick = () => onLoginChip(u);

            const btnDel = document.createElement("button");
            btnDel.className = "chip-del";
            btnDel.innerHTML = "✕";
            btnDel.title = `Eliminar usuario ${u}`;
            btnDel.onclick = (e) => {
                e.stopPropagation();
                onEliminarUsuario(u);
            };

            chip.appendChild(nombre);
            chip.appendChild(btnDel);
            chips.appendChild(chip);
        });
    },

    // Actualizar tarjetas de estadísticas
    actualizarStats(presupuesto, transacciones) {
        const totalIngresos = transacciones.filter(t => t.tipo === "ingreso").reduce((acc, t) => acc + t.monto, 0);
        const totalGastos = transacciones.filter(t => t.tipo === "gasto").reduce((acc, t) => acc + t.monto, 0);
        const balance = presupuesto + totalIngresos - totalGastos;

        const elBalance = document.getElementById("balance-valor");
        elBalance.innerText = this.formatearMoneda(balance);
        elBalance.className = "stat-valor " + (balance < 0 ? "valor-negativo" : "valor-positivo");

        document.getElementById("presupuesto-valor").innerText = this.formatearMoneda(presupuesto);
        document.getElementById("total-ingresos").innerText = this.formatearMoneda(totalIngresos);
        document.getElementById("total-gastos").innerText = this.formatearMoneda(totalGastos);

        return { balance, totalGastos, totalIngresos };
    },

    // Actualizar la barra de progreso del presupuesto
    actualizarProgreso(presupuesto, totalGastos, totalIngresos = 0) {
        const card = document.getElementById("card-progreso");
        if (presupuesto <= 0) { card.style.display = "none"; return; }

        card.style.display = "block";

        const totalDisponible = presupuesto + totalIngresos;
        const porcentajeUsado = Math.min((totalGastos / totalDisponible) * 100, 100);
        const restante = totalDisponible - totalGastos;

        // Color de la barra según uso
        let colorBarra = "#06c270"; // verde
        if (porcentajeUsado >= 90) colorBarra = "#ef233c";       // rojo
        else if (porcentajeUsado >= 70) colorBarra = "#d29922";  // naranja

        const barra = document.getElementById("barra-fill");
        barra.style.width = `${porcentajeUsado}%`;
        barra.style.background = colorBarra;

        document.getElementById("progreso-pct").innerText = `${Math.round(porcentajeUsado)}% usado`;
        document.getElementById("progreso-total").innerText = `de ${this.formatearMoneda(totalDisponible)}`;
        document.getElementById("progreso-restante-label").innerText =
            restante >= 0
                ? `${this.formatearMoneda(restante)} disponibles`
                : `${this.formatearMoneda(Math.abs(restante))} sobre el presupuesto`;
        document.getElementById("progreso-restante-label").style.color =
            restante < 0 ? "var(--danger)" : restante < totalDisponible * 0.1 ? "var(--warning)" : "var(--success)";

        return porcentajeUsado;
    },

    // Historial por Mes -> Día
    renderizarLista(transacciones, onEliminar, onExportar) {
        const contenedor = document.getElementById("contenedor-transacciones");
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (transacciones.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📊</div>
                    <p>No hay movimientos registrados todavía.</p>
                </div>`;
            return;
        }

        // Ordenar del más reciente al más antiguo
        const ordenadas = [...transacciones].sort((a, b) => b.id - a.id);

        // Agrupar jerárquicamente: Mes -> Día -> Items
        const meses = {};

        ordenadas.forEach(t => {
            const fecha = new Date(t.id);
            const claveMes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
            const nombreMes = fecha.toLocaleString("es-AR", { month: "long", year: "numeric" });

            if (!meses[claveMes]) {
                meses[claveMes] = { nombre: nombreMes, dias: {}, itemsRaw: [] };
            }

            const claveDia = this.claveDelDia(t.id);
            if (!meses[claveMes].dias[claveDia]) {
                meses[claveMes].dias[claveDia] = { timestamp: t.id, items: [] };
            }
            meses[claveMes].dias[claveDia].items.push(t);
            meses[claveMes].itemsRaw.push(t); // Para exportar el mes completo
        });

        // Renderizar Meses
        Object.keys(meses).forEach((claveMes, index) => {
            const mes = meses[claveMes];

            const mesBlock = document.createElement("div");
            mesBlock.className = "mes-grupo";

            // Carpeta del Mes
            const mesHeader = document.createElement("div");
            mesHeader.className = `mes-header ${index === 0 ? "abierto" : "cerrado"}`;
            mesHeader.innerHTML = `
                <div class="mes-header-info">
                    <span>${mes.nombre}</span>
                </div>
                <div class="mes-header-acciones">
                    <button class="btn-export-mes" title="Exportar este mes a Excel">
                        <svg class="excel-icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM14 3.5 18.5 8H14V3.5zM12 11h2v2h-2v2h-2v-2H8v-2h2v-2h2v2z"/>
                        </svg>
                    </button>
                    <span class="toggle-icon">▼</span>
                </div>
            `;

            const btnExport = mesHeader.querySelector(".btn-export-mes");
            btnExport.onclick = (e) => {
                e.stopPropagation();
                if (onExportar) onExportar(mes.nombre, mes.itemsRaw);
            };

            const mesContenido = document.createElement("div");
            mesContenido.className = "mes-contenido";

            // Rotar ícono si el mes está cerrado desde el inicio
            if (index !== 0) {
                mesHeader.querySelector(".toggle-icon").style.transform = "rotate(-90deg)";
            }

            mesHeader.onclick = () => {
                const isCerrado = mesHeader.classList.contains("cerrado");
                mesHeader.classList.toggle("cerrado", !isCerrado);
                mesHeader.classList.toggle("abierto", isCerrado);
                mesHeader.querySelector(".toggle-icon").style.transform = isCerrado ? "rotate(0deg)" : "rotate(-90deg)";
            };

            // Días dentro del Mes
            Object.keys(mes.dias).forEach(claveDia => {
                const grupoDia = mes.dias[claveDia];

                // Fila del Día
                const diaHeader = document.createElement("div");
                diaHeader.className = "dia-header";
                diaHeader.innerHTML = `<span class="dia-label">📅 ${this.formatearFecha(grupoDia.timestamp)}</span>`;
                mesContenido.appendChild(diaHeader);

                // Movimientos
                grupoDia.items.forEach(t => {
                    const item = document.createElement("div");
                    item.className = `mov-card ${t.tipo}`;

                    const signo = t.tipo === "gasto" ? "-" : "+";
                    const icono = t.tipo === "gasto" ? "📉" : "📈";

                    item.innerHTML = `
                        <div class="mov-icon">${icono}</div>
                        <div class="mov-info">
                            <span class="mov-descripcion">${t.descripcion}</span>
                            <div class="mov-meta">
                                <span class="mov-tipo">${t.tipo}</span>
                                <span class="mov-hora">🕐 ${this.formatearHora(t.id)}</span>
                            </div>
                        </div>
                        <div class="mov-acciones">
                            <span class="mov-monto">${signo}${this.formatearMoneda(t.monto)}</span>
                            <button class="btn-del" title="Eliminar fila">✕</button>
                        </div>
                    `;
                    item.querySelector(".btn-del").onclick = () => onEliminar(t.id);
                    mesContenido.appendChild(item);
                });
            });

            mesBlock.appendChild(mesHeader);
            mesBlock.appendChild(mesContenido);
            contenedor.appendChild(mesBlock);
        });
    },

    notificar(mensaje, tipo = "success") {
        const colores = {
            success: "linear-gradient(135deg, #06c270, #00a86b)",
            error: "linear-gradient(135deg, #ef233c, #c9184a)",
            info: "linear-gradient(135deg, #4361ee, #3a0ca3)"
        };

        // error (alertas presupuesto) = 6s | info (bienvenida) = 2.5s | success = 2s
        const duracion = tipo === "error" ? 6000 : tipo === "info" ? 2500 : 2000;

        Toastify({
            text: mensaje,
            duration: duracion,
            gravity: "top",
            position: "right",
            offset: { x: 0, y: 65 },
            style: {
                background: colores[tipo] || colores.success,
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "'Outfit', sans-serif"
            }
        }).showToast();
    },

    confirmarAccion(titulo, texto, callback) {
        Swal.fire({
            title: titulo, text: texto, icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4361ee",
            cancelButtonColor: "#ef233c",
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar",
            background: "#ffffff",
            color: "#1a1a1a"
        }).then((result) => {
            if (result.isConfirmed) callback();
        });
    },

    aplicarFondo(idFondo) {
        // Buscar el fondo seleccionado, si no existe o es base64 viejo (muy largo), usar default
        let fondo = FONDOS_PREDEFINIDOS.find(f => f.id === idFondo);
        if (!fondo || idFondo?.length > 100) {
            fondo = FONDOS_PREDEFINIDOS[0]; // fallback
        }

        if (fondo.id !== 'default') {
            document.body.style.backgroundImage = `url(${fondo.url})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            document.body.style.backgroundAttachment = "fixed";
            document.body.classList.add("has-custom-bg");
            
            // Aplicar colores dinámicos predefinidos
            document.documentElement.style.setProperty('--dynamic-accent', fondo.color);
            
            if (fondo.isDark) {
                document.documentElement.style.setProperty('--dynamic-text', '#ffffff');
                document.documentElement.style.setProperty('--dynamic-surface', 'rgba(255, 255, 255, 0.12)');
                document.documentElement.style.setProperty('--dynamic-subtext', 'rgba(255, 255, 255, 0.7)');
            } else {
                document.documentElement.style.setProperty('--dynamic-text', '#0d1117');
                document.documentElement.style.setProperty('--dynamic-surface', 'rgba(0, 0, 0, 0.1)');
                document.documentElement.style.setProperty('--dynamic-subtext', 'rgba(0, 0, 0, 0.6)');
            }
        } else {
            // Fondo default (malla CSS)
            document.body.style.backgroundImage = "";
            document.body.classList.remove("has-custom-bg");
            document.documentElement.style.removeProperty('--dynamic-accent');
            document.documentElement.style.removeProperty('--dynamic-text');
            document.documentElement.style.removeProperty('--dynamic-surface');
            document.documentElement.style.removeProperty('--dynamic-subtext');
        }
    },

    mostrarSelectorFondo(fondoActual, callbackGuardar) {
        // Construir la grilla visual de los fondos
        const grillaHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-top: 10px;">
                ${FONDOS_PREDEFINIDOS.map(f => `
                    <div class="fondo-option" data-id="${f.id}" style="
                        border-radius: 12px; height: 90px; cursor: pointer;
                        background: ${f.preview.startsWith('http') ? `url('${f.preview}') center/cover` : f.preview};
                        border: 3px solid ${fondoActual === f.id || (!fondoActual && f.id === 'default') ? 'var(--primary)' : 'transparent'};
                        transition: transform 0.2s, border-color 0.2s;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        position: relative; overflow: hidden;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="position: absolute; bottom: 0; left:0; right:0; padding: 4px; background: rgba(0,0,0,0.6); color: white; font-size: 0.75rem; text-align: center;">
                            ${f.nombre}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        Swal.fire({
            title: "Seleccioná tu Fondo",
            html: grillaHTML,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'glass-modal'
            },
            didOpen: () => {
                const el = Swal.getHtmlContainer();
                const options = el.querySelectorAll('.fondo-option');
                options.forEach(opt => {
                    opt.onclick = () => {
                        const id = opt.getAttribute('data-id');
                        callbackGuardar(id);
                        Swal.close();
                    };
                });
            }
        });
    },

    // Limpieza Inteligente
    mostrarPanelLimpieza(callback) {
        Swal.fire({
            title: "🧹 Limpieza Inteligente",
            text: "¿Qué parte de tu información querés borrar?",
            icon: "info",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#4361ee",
            input: "radio",
            inputOptions: {
                "historial": "Solo el historial de transacciones",
                "presupuesto": "Solo el presupuesto (poner a $0)",
                "gastos": "Solo los gastos (mantener ingresos)",
                "todo": "Borrar todo (reinicio completo)"
            },
            inputValidator: (value) => {
                if (!value) return "¡Tenés que elegir una opción!";
            },
            customClass: {
                popup: 'glass-modal',
                confirmButton: 'btn-swal-confirm'
            }
        }).then(result => {
            if (result.isConfirmed) {
                callback(result.value);
            }
        });
    }
};
