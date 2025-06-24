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
            nombre,
            capacidad,
            precio,
            ubicacion,
            descripcion,
            imagen,
            servicios,
            disponible
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
        const salonId = document.getElementById('salonId');
        if (salonId) salonId.value = '';
        const formTitle = document.getElementById('form-title');
        if (formTitle) formTitle.textContent = '➕ Agregar Nuevo Salón';
        const btnSubmit = document.getElementById('btnSubmit');
        if (btnSubmit) btnSubmit.value = 'Agregar Salón';
        const btnCancelar = document.getElementById('btnCancelar');
        if (btnCancelar) btnCancelar.style.display = 'none';
        const disponible = document.getElementById('disponible');
        if (disponible) disponible.checked = true; 
    }

    renderizarTabla() {
        const tablaSalonesBody = document.getElementById('tablaSalones');
        if (!tablaSalonesBody) return; 

        tablaSalonesBody.innerHTML = ''; 

        this.salones.forEach(salon => {
            const row = tablaSalonesBody.insertRow();
            row.insertCell().textContent = salon.id;
            row.insertCell().textContent = salon.nombre;
            row.insertCell().textContent = salon.capacidad;
            row.insertCell().textContent = `$${salon.precio.toLocaleString()}`;
            row.insertCell().textContent = salon.ubicacion;
            row.insertCell().textContent = salon.servicios.join(', ');
            
            const estadoCell = row.insertCell();
            estadoCell.textContent = salon.disponible ? 'Disponible' : 'No Disponible';
            estadoCell.classList.add(salon.disponible ? 'status-disponible' : 'status-no-disponible');

            const accionesCell = row.insertCell();
            accionesCell.classList.add('actions');
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.classList.add('btn', 'btn-warning', 'btn-small');
            btnEditar.addEventListener('click', () => this.editarSalon(salon.id));
            accionesCell.appendChild(btnEditar);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.classList.add('btn', 'btn-danger', 'btn-small');
            btnEliminar.addEventListener('click', () => this.eliminarSalon(salon.id));
            accionesCell.appendChild(btnEliminar);
        });
    }

    renderizarCards() {
        const vistaCards = document.getElementById('vistaCards');
        if (!vistaCards) return;

        vistaCards.innerHTML = '';

        this.salones.forEach(salon => {
            const card = document.createElement('div');
            card.classList.add('card');

            const serviciosHtml = salon.servicios.map(servicio => `<span class="servicio">${servicio}</span>`).join('');

            card.innerHTML = `
                <h3>${salon.nombre}</h3>
                <p><b>Descripción:</b> ${salon.descripcion}</p>
                <img src="${salon.imagen}" alt="Imagen de ${salon.nombre}" style="width:100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                <div class="salon-info">
                    <span><b>Capacidad:</b> ${salon.capacidad} personas</span>
                    <span><b>Precio:</b> $${salon.precio.toLocaleString()}</span>
                    <span><b>Ubicación:</b> ${salon.ubicacion}</span>
                </div>
                <p class="servicios"><b>Servicios:</b> ${serviciosHtml || 'Ninguno'}</p>
                <p><b>Estado:</b> <span class="${salon.disponible ? 'status-disponible' : 'status-no-disponible'}">${salon.disponible ? 'Disponible' : 'No Disponible'}</span></p>
                <div class="actions" style="margin-top: 15px;">
                    <button class="btn btn-warning btn-small" onclick="window.salonManager.editarSalon(${salon.id})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="window.salonManager.eliminarSalon(${salon.id})">Eliminar</button>
                </div>
            `;
            vistaCards.appendChild(card);
        });
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.getElementById('mensaje');
        if (!mensajeDiv) return; 

        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = `mensaje show mensaje-${tipo}`; 
        setTimeout(() => {
            mensajeDiv.classList.remove('show'); 
        }, 3000);
    }

    cambiarVista(vista) {
        const btnTabla = document.getElementById('btnTabla');
        const btnCards = document.getElementById('btnCards');
        const vistaTabla = document.getElementById('vistaTabla');
        const vistaCards = document.getElementById('vistaCards');

        if (!btnTabla || !btnCards || !vistaTabla || !vistaCards) return; 

        if (vista === 'tabla') {
            vistaTabla.style.display = 'block';
            vistaCards.style.display = 'none';
            btnTabla.classList.add('active');
            btnCards.classList.remove('active');
        } else {
            vistaTabla.style.display = 'none';
            vistaCards.style.display = 'grid'; 
            btnTabla.classList.remove('active');
            btnCards.classList.add('active');
        }
    }

    actualizarUI() {
        this.renderizarTabla();
        this.renderizarCards();
        // 
    }

    obtenerEstadisticas() {
        const totalSalones = this.salones.length;
        const salonesDisponibles = this.salones.filter(s => s.disponible).length;
        const salonesNoDisponibles = totalSalones - salonesDisponibles;

        const capacidadTotal = this.salones.reduce((sum, s) => sum + s.capacidad, 0);
        const precioPromedio = totalSalones > 0 ? this.salones.reduce((sum, s) => sum + s.precio, 0) / totalSalones : 0;

        return {
            totalSalones,
            salonesDisponibles,
            salonesNoDisponibles,
            capacidadTotal,
            precioPromedio: precioPromedio.toFixed(2)
        };
    }
}

//

document.addEventListener('DOMContentLoaded', () => {
  // 1) Recuperamos el token y usuario actual
  const accessToken = sessionStorage.getItem('accessToken');
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

  // 2) Definimos updateNavLinks incorporando Usuarios
  function updateNavLinks() {
    const adminNavLink            = document.getElementById('adminNavLink');
    const adminNavLinkSidebar     = document.getElementById('adminNavLinkSidebar');
    const usersNavLink            = document.getElementById('usersNavLink');
    const usersNavLinkSidebar     = document.getElementById('usersNavLinkSidebar');
    const loginLogoutLink         = document.getElementById('loginLogoutLink');
    const loginLogoutLinkSidebar  = document.getElementById('loginLogoutLinkSidebar');

    // Login / Logout
    if (loginLogoutLink) {
      if (accessToken) {
        loginLogoutLink.querySelector('a').textContent = `Cerrar Sesión (${currentUser.username})`;
        loginLogoutLink.querySelector('a').href = '#';
        loginLogoutLink.querySelector('a').onclick = e => {
          e.preventDefault();
          sessionStorage.clear();
          alert('Sesión cerrada.');
          window.location.href = 'index.html';
        };
      } else {
        loginLogoutLink.querySelector('a').textContent = 'Iniciar Sesión';
        loginLogoutLink.querySelector('a').href = 'login.html';
        loginLogoutLink.querySelector('a').onclick = null;
      }
    }
    if (loginLogoutLinkSidebar) {
      if (accessToken) {
        loginLogoutLinkSidebar.querySelector('a').textContent = `Cerrar Sesión (${currentUser.username})`;
        loginLogoutLinkSidebar.querySelector('a').href = '#';
        loginLogoutLinkSidebar.querySelector('a').onclick = e => {
          e.preventDefault();
          sessionStorage.clear();
          alert('Sesión cerrada.');
          window.location.href = 'index.html';
        };
      } else {
        loginLogoutLinkSidebar.querySelector('a').textContent = 'Iniciar Sesión';
        loginLogoutLinkSidebar.querySelector('a').href = 'login.html';
        loginLogoutLinkSidebar.querySelector('a').onclick = null;
      }
    }

    // Mostrar/Ocultar Administración
    if (adminNavLink)        adminNavLink.classList.toggle('hidden-admin', !accessToken);
    if (adminNavLinkSidebar) adminNavLinkSidebar.classList.toggle('hidden-admin', !accessToken);
    
    // Mostrar/Ocultar Usuarios
    if (usersNavLink)        usersNavLink.classList.toggle('hidden-admin', !accessToken);
    if (usersNavLinkSidebar) usersNavLinkSidebar.classList.toggle('hidden-admin', !accessToken);
  }

  // 3) Ejecutamos updateNavLinks
  updateNavLinks();

  // 4) Protección de la página de CRUD
  if (window.location.pathname.includes('salones-crud.html')) {
    if (!accessToken) {
      alert('Acceso no autorizado. Por favor, inicie sesión.');
      window.location.href = 'login.html';
      return;
    }

    // Si hay token, mostramos todo
    document.querySelectorAll('.hidden-admin').forEach(el => el.classList.remove('hidden-admin'));

    // Inicializamos el CRUD
    window.salonManager = new SalonManager();
    console.log('Sistema de gestión de salones inicializado para administrador.');

    const stats = window.salonManager.obtenerEstadisticas();
    console.log('Estadísticas actuales de salones (CRUD):', stats);

    console.log(`Bienvenido, ${currentUser.firstName}! Has iniciado sesión en el CRUD.`);
  }
});



//Funciones de exportar

function exportarDatos() {
    if (typeof window.salonManager === 'undefined') {
        console.warn('SalonManager no está inicializado. No se pueden exportar datos.');
        return;
    }
    const salones = window.salonManager.salones; 
    const dataStr = JSON.stringify(salones, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'salones_backup.json';
    link.click();
    window.salonManager.mostrarMensaje('Datos exportados exitosamente!', 'exito');
}

function importarDatos(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const salones = JSON.parse(e.target.result);
                if (typeof window.salonManager === 'undefined') {
                    alert('SalonManager no está inicializado. No se pueden importar datos directamente aquí.');
                    return;
                }
                localStorage.setItem('salones_eventos', JSON.stringify(salones));
                window.salonManager.cargarSalones(); 
                window.salonManager.mostrarMensaje('Datos importados exitosamente!', 'exito'); 
            } catch (error) {
                if (typeof window.salonManager !== 'undefined') {
                    window.salonManager.mostrarMensaje('Error al importar datos: ' + error.message, 'error');
                } else {
                    alert('Error al importar datos: ' + error.message);
                }
                console.error('Error al importar datos:', error);
            }
        };
        reader.readAsText(file);
    }
}
