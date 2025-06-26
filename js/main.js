// --- Clase SalonManager ---
class SalonManager {
    constructor() {
        this.salones = [];
        this.cargarSalones();
        this.inicializarEventos();
        this.actualizarUI();
    }

    cargarSalones() {
        const salonesGuardados = JSON.parse(localStorage.getItem('salones_eventos') || '[]');
        if (salonesGuardados.length === 0) {
            this.salones = SALONES_INICIALES;
            this.guardarSalones();
        } else {
            this.salones = salonesGuardados;
        }
        this.renderizarTabla();
        this.renderizarCards();
    }

    guardarSalones() {
        localStorage.setItem('salones_eventos', JSON.stringify(this.salones));
    }

    generarId() {
        return this.salones.length > 0 ? Math.max(...this.salones.map(s => s.id)) + 1 : 1;
    }

    inicializarEventos() {
        const salonForm = document.getElementById('salonForm');
        const btnCancelar = document.getElementById('btnCancelar');
        const btnTabla = document.getElementById('btnTabla');
        const btnCards = document.getElementById('btnCards');

        if (salonForm) salonForm.addEventListener('submit', this.manejarSubmit.bind(this));
        if (btnCancelar) btnCancelar.addEventListener('click', this.cancelarEdicion.bind(this));
        if (btnTabla) btnTabla.addEventListener('click', () => this.cambiarVista('tabla'));
        if (btnCards) btnCards.addEventListener('click', () => this.cambiarVista('cards'));
    }

    manejarSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('salonId').value;
        const nombre = document.getElementById('nombre').value;
        const capacidad = parseInt(document.getElementById('capacidad').value);
        const precio = parseFloat(document.getElementById('precio').value);
        const ubicacion = document.getElementById('ubicacion').value;
        const descripcion = document.getElementById('descripcion').value;
        const imagen = document.getElementById('imagen').value;
        const disponible = document.getElementById('disponible').checked;

        const servicios = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        const nuevoSalon = {
            id: id ? parseInt(id) : this.generarId(),
            nombre, capacidad, precio, ubicacion,
            descripcion, imagen, servicios, disponible
        };

        if (id) {
            this.actualizarSalon(nuevoSalon);
        } else {
            this.agregarSalon(nuevoSalon);
        }

        this.limpiarFormulario();
        this.actualizarUI();
    }

    agregarSalon(salon) {
        this.salones.push(salon);
        this.guardarSalones();
        this.mostrarMensaje('Salón agregado exitosamente!', 'exito');
    }

    actualizarSalon(salonActualizado) {
        const index = this.salones.findIndex(s => s.id === salonActualizado.id);
        if (index !== -1) {
            this.salones[index] = salonActualizado;
            this.guardarSalones();
            this.mostrarMensaje('Salón actualizado exitosamente!', 'exito');
        }
    }

    eliminarSalon(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este salón?')) {
            this.salones = this.salones.filter(s => s.id !== id);
            this.guardarSalones();
            this.mostrarMensaje('Salón eliminado exitosamente!', 'exito');
            this.actualizarUI();
        }
    }

    editarSalon(id) {
        const salon = this.salones.find(s => s.id === id);
        if (salon) {
            document.getElementById('salonId').value = salon.id;
            document.getElementById('nombre').value = salon.nombre;
            document.getElementById('capacidad').value = salon.capacidad;
            document.getElementById('precio').value = salon.precio;
            document.getElementById('ubicacion').value = salon.ubicacion;
            document.getElementById('descripcion').value = salon.descripcion;
            document.getElementById('imagen').value = salon.imagen;
            document.getElementById('disponible').checked = salon.disponible;

            document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = salon.servicios.includes(checkbox.value);
            });

            document.getElementById('form-title').textContent = '✏️ Editar Salón Existente';
            document.getElementById('btnSubmit').value = 'Guardar Cambios';
            document.getElementById('btnCancelar').style.display = 'inline-block';
        }
    }

    cancelarEdicion() {
        this.limpiarFormulario();
        this.mostrarMensaje('Edición cancelada.', 'info');
    }

    limpiarFormulario() {
        const salonForm = document.getElementById('salonForm');
        if (salonForm) salonForm.reset();
        document.getElementById('salonId').value = '';
        document.getElementById('form-title').textContent = '➕ Agregar Nuevo Salón';
        document.getElementById('btnSubmit').value = 'Agregar Salón';
        document.getElementById('btnCancelar').style.display = 'none';
        document.getElementById('disponible').checked = true;
    }

    renderizarTabla() {
        const tbody = document.getElementById('tablaSalones');
        if (!tbody) return;
        tbody.innerHTML = '';
        this.salones.forEach(salon => {
            const row = tbody.insertRow();
            row.insertCell().textContent = salon.id;
            row.insertCell().textContent = salon.nombre;
            row.insertCell().textContent = salon.capacidad;
            row.insertCell().textContent = `$${salon.precio.toLocaleString()}`;
            row.insertCell().textContent = salon.ubicacion;
            row.insertCell().textContent = salon.servicios.join(', ');
            const estado = row.insertCell();
            estado.textContent = salon.disponible ? 'Disponible' : 'No Disponible';
            estado.classList.add(salon.disponible ? 'status-disponible' : 'status-no-disponible');
            const acciones = row.insertCell();
            acciones.innerHTML = `
            <div class="actions">
                <button class="btn-editarsalon" onclick="window.salonManager.editarSalon(${salon.id})">Editar</button>
                <button class="btn-eliminarsalon" onclick="window.salonManager.eliminarSalon(${salon.id})">Eliminar</button>
            </div>
            `;
        });
    }

    renderizarCards() {
        const contenedor = document.getElementById('vistaCards');
        if (!contenedor) return;
        contenedor.innerHTML = '';
        this.salones.forEach(salon => {
            const servicios = salon.servicios.map(s => `<span class="servicio">${s}</span>`).join('');
            contenedor.innerHTML += `
                <div class="card">
                    <h3>${salon.nombre}</h3>
                    <p><b>Descripción:</b> ${salon.descripcion}</p>
                    <img src="${salon.imagen}" alt="Imagen" style="width:100%; height: 200px; object-fit: cover;">
                    <div class="salon-info">
                        <span><b>Capacidad:</b> ${salon.capacidad}</span>
                        <span><b>Precio:</b> $${salon.precio.toLocaleString()}</span>
                        <span><b>Ubicación:</b> ${salon.ubicacion}</span>
                    </div>
                    <p class="servicios"><b>Servicios:</b> ${servicios || 'Ninguno'}</p>
                    <p><b>Estado:</b> <span class="${salon.disponible ? 'status-disponible' : 'status-no-disponible'}">${salon.disponible ? 'Disponible' : 'No Disponible'}</span></p>
                    <div class="actions">
                        <button class="btn-editarsalon" onclick="window.salonManager.editarSalon(${salon.id})">Editar</button>
                        <button class="btn-eliminarsalon" onclick="window.salonManager.eliminarSalon(${salon.id})">Eliminar</button>
                    </div>
                </div>`;
        });
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.getElementById('mensaje');
        if (!mensajeDiv) return;
        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = `mensaje show mensaje-${tipo}`;
        setTimeout(() => mensajeDiv.classList.remove('show'), 3000);
    }

    cambiarVista(vista) {
        document.getElementById('vistaTabla').style.display = vista === 'tabla' ? 'block' : 'none';
        document.getElementById('vistaCards').style.display = vista === 'cards' ? 'grid' : 'none';
        document.getElementById('btnTabla').classList.toggle('active', vista === 'tabla');
        document.getElementById('btnCards').classList.toggle('active', vista === 'cards');
    }

    actualizarUI() {
        this.renderizarTabla();
        this.renderizarCards();
    }

    obtenerEstadisticas() {
        const total = this.salones.length;
        const disponibles = this.salones.filter(s => s.disponible).length;
        const noDisponibles = total - disponibles;
        const capacidadTotal = this.salones.reduce((sum, s) => sum + s.capacidad, 0);
        const precioPromedio = total > 0 ? this.salones.reduce((sum, s) => sum + s.precio, 0) / total : 0;

        return { total, disponibles, noDisponibles, capacidadTotal, precioPromedio: precioPromedio.toFixed(2) };
    }
}

// --- Login y lógica CRUD ---
document.addEventListener('DOMContentLoaded', () => {
    const accessToken = sessionStorage.getItem('accessToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    function updateNavLinks() {
        const links = [
            ['adminNavLink', accessToken],
            ['adminNavLinkSidebar', accessToken],
            ['usersNavLink', accessToken],
            ['usersNavLinkSidebar', accessToken],
        ];
        links.forEach(([id, cond]) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden-admin', !cond);
        });

        const loginLink = document.getElementById('loginLogoutLink');
        const loginSidebar = document.getElementById('loginLogoutLinkSidebar');
        [loginLink, loginSidebar].forEach(link => {
            if (!link) return;
            const a = link.querySelector('a');
            if (!a) return;
            if (accessToken) {
                a.textContent = `Cerrar Sesión (${currentUser.username})`;
                a.href = '#';
                a.onclick = e => {
                    e.preventDefault();
                    sessionStorage.clear();
                    alert('Sesión cerrada.');
                    window.location.href = 'index.html';
                };
            } else {
                a.textContent = 'Iniciar Sesión';
                a.href = 'login.html';
                a.onclick = null;
            }
        });
        //Reubicar "Presupuesto" después de "Usuarios" si está logueado
            if (accessToken) {
                // Navbar
                const presupuestoNav = document.querySelector('a[href="./presupuesto.html"]')?.parentElement;
                const usersNav = document.getElementById('usersNavLink');
                if (presupuestoNav && usersNav) {
                  usersNav.parentElement.insertBefore(presupuestoNav, usersNav.nextSibling);
                }

                // Sidebar
                const presupuestoSidebar = document.querySelector('#sidebarMenu a[href="./presupuesto.html"]')?.parentElement;
                const usersSidebar = document.getElementById('usersNavLinkSidebar');
                if (presupuestoSidebar && usersSidebar) {
                  usersSidebar.parentElement.insertBefore(presupuestoSidebar, usersSidebar.nextSibling);
                }
            }
    }
    updateNavLinks();

    if (window.location.pathname.includes('salones-crud.html')) {
        if (!accessToken) {
            alert('Acceso no autorizado. Por favor, inicie sesión.');
            window.location.href = 'login.html';
            return;
        }

        document.querySelectorAll('.hidden-admin').forEach(el => el.classList.remove('hidden-admin'));

        window.salonManager = new SalonManager();
        renderizarCheckboxServicios();

        if (typeof inicializarGestionServicios === 'function') {
            inicializarGestionServicios();
        }

        console.log(`Bienvenido, ${currentUser.firstName}! Has iniciado sesión en el CRUD.`);
    }
});

// --- Utilidades ---
function renderizarCheckboxServicios() {
    const servicios = JSON.parse(localStorage.getItem("servicios_eventos") || "[]");
    const contenedor = document.getElementById("checkboxServicios");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    servicios.forEach(servicio => {
        const div = document.createElement("div");
        div.className = "checkbox-item";
        div.innerHTML = `
            <input type="checkbox" id="${servicio.valor}" value="${servicio.valor}">
            <label for="${servicio.valor}">${servicio.nombre}</label>
        `;
        contenedor.appendChild(div);
    });
}
