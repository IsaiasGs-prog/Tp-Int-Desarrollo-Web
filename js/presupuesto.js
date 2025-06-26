class PresupuestoManager {
    constructor() {
        this.salones = [];
        this.servicios = [];
        this.presupuestos = []; 
        this.cargarDatos();
        this.inicializarEventos();
    }

    
    mostrarMensaje(mensaje, tipo) {
        const mensajeFeedback = document.getElementById('mensajeFeedback');
        if (mensajeFeedback) {
            mensajeFeedback.textContent = mensaje;
            mensajeFeedback.className = `mensaje mensaje-${tipo}`;
            mensajeFeedback.style.display = 'block';
            setTimeout(() => {
                mensajeFeedback.style.display = 'none';
            }, 3000);
        }
    }

    
    cargarDatos() {
        this.salones = JSON.parse(localStorage.getItem('salones_eventos')) || [];
        this.servicios = JSON.parse(localStorage.getItem('servicios_eventos')) || [];
        this.presupuestos = JSON.parse(localStorage.getItem('presupuestos_registrados')) || []; 

        this.poblarSalonesSelect();
        this.poblarServiciosCheckboxes();
    }

    
    guardarPresupuestos() {
        localStorage.setItem('presupuestos_registrados', JSON.stringify(this.presupuestos));
    }

   
    generarId() {
        return this.presupuestos.length > 0 ? Math.max(...this.presupuestos.map(p => p.id)) + 1 : 1;
    }

    
    poblarSalonesSelect() {
        const selectSalon = document.getElementById('selectSalon');
        if (!selectSalon) return;

        selectSalon.innerHTML = '<option value="">-- Selecciona un salón --</option>'; 
        this.salones.forEach(salon => {
            if (salon.disponible) { 
                const option = document.createElement('option');
                option.value = salon.id;
                option.textContent = `${salon.nombre} - $${salon.precio.toLocaleString('es-AR')}`;
                option.dataset.precio = salon.precio; 
                selectSalon.appendChild(option);
            }
        });

        if (this.salones.length === 0) {
            this.mostrarMensaje('No hay salones disponibles para presupuestar.', 'info');
        }
    }

    
    poblarServiciosCheckboxes() {
        const serviciosContainer = document.getElementById('serviciosCheckboxContainer');
        if (!serviciosContainer) return;

        serviciosContainer.innerHTML = ''; 

        if (this.servicios.length === 0) {
            serviciosContainer.innerHTML = '<p>No hay servicios adicionales disponibles.</p>';
            return;
        }

        this.servicios.forEach(servicio => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label>
                    <input type="checkbox" name="servicio" value="${servicio.id}" data-valor="${servicio.valor}">
                    ${servicio.nombre} ($${parseFloat(servicio.valor).toLocaleString('es-AR')})
                </label>
            `;
            serviciosContainer.appendChild(div);
        });
    }

    
    inicializarEventos() {
        const presupuestoForm = document.getElementById('presupuestoForm');
        const selectSalon = document.getElementById('selectSalon');
        const serviciosContainer = document.getElementById('serviciosCheckboxContainer');
        const logoutBtn = document.getElementById('logoutBtn');
        const sidebarToggler = document.querySelector('.navbar-toggler');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');


        if (presupuestoForm) presupuestoForm.addEventListener('submit', this.generarPresupuesto.bind(this));
        if (selectSalon) selectSalon.addEventListener('change', this.calcularValorTotal.bind(this));
        if (serviciosContainer) serviciosContainer.addEventListener('change', this.calcularValorTotal.bind(this)); 

        if (sidebarToggler) {
            sidebarToggler.addEventListener('click', () => {
                sidebarMenu.classList.toggle('show');
                sidebarBackdrop.classList.toggle('show');
                document.body.classList.toggle('sidebar-open');
            });
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => {
                sidebarMenu.classList.remove('show');
                sidebarBackdrop.classList.remove('show');
                document.body.classList.remove('sidebar-open');
            });
        }

        
        this.calcularValorTotal();
    }

    
    calcularValorTotal() {
        let total = 0;
        const selectSalon = document.getElementById('selectSalon');
        const valorTotalEstimadoSpan = document.getElementById('valorTotalEstimado');

        
        const selectedSalonOption = selectSalon.options[selectSalon.selectedIndex];
        if (selectedSalonOption && selectedSalonOption.value !== '') {
            total += parseFloat(selectedSalonOption.dataset.precio || 0);
        }

        
        const checkboxesServicios = document.querySelectorAll('#serviciosCheckboxContainer input[type="checkbox"]:checked');
        checkboxesServicios.forEach(checkbox => {
            total += parseFloat(checkbox.dataset.valor || 0);
        });

        valorTotalEstimadoSpan.textContent = `$${total.toLocaleString('es-AR')}`;
    }

    
generarPresupuesto(event) {
    event.preventDefault();

    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const apellidoCliente = document.getElementById('apellidoCliente').value.trim();
    const fechaEvento = document.getElementById('fechaEvento').value;
    const tematica = document.getElementById('tematica').value.trim();
    const selectSalon = document.getElementById('selectSalon');
    const selectedSalonId = parseInt(selectSalon.value);
    const checkboxesServicios = document.querySelectorAll('#serviciosCheckboxContainer input[type="checkbox"]:checked');

    if (!nombreCliente || !apellidoCliente || !fechaEvento || !tematica || !selectedSalonId) {
        this.mostrarMensaje('Por favor, complete todos los campos obligatorios.', 'error');
        return;
    }

    const salonSeleccionado = this.salones.find(s => s.id === selectedSalonId);
    if (!salonSeleccionado) {
        this.mostrarMensaje('El salón seleccionado no es válido.', 'error');
        return;
    }

    const serviciosSeleccionadosDetalle = [];
    let valorServicios = 0;
    checkboxesServicios.forEach(checkbox => {
        const servicioId = parseInt(checkbox.value);
        const servicio = this.servicios.find(s => s.id === servicioId);
        if (servicio) {
            serviciosSeleccionadosDetalle.push({
                idServicio: servicio.id,
                descripcion: servicio.nombre,
                valor: parseFloat(servicio.valor)  
            });
            valorServicios += parseFloat(servicio.valor); 
        }
    });

    const valorTotal = salonSeleccionado.precio + valorServicios;

    const nuevoPresupuesto = {
        id: this.generarId(),
        nombreCliente,
        apellidoCliente,
        fechaEvento,
        tematica,
        idSalonSeleccionado: selectedSalonId,
        salonNombre: salonSeleccionado.nombre,
        salonPrecio: salonSeleccionado.precio,
        serviciosSeleccionados: serviciosSeleccionadosDetalle,
        valorTotal
    };

    this.presupuestos.push(nuevoPresupuesto);
    this.guardarPresupuestos();

    this.mostrarResultadoPresupuesto(nuevoPresupuesto);
    this.mostrarMensaje('Presupuesto generado exitosamente.', 'exito');
}


    
    mostrarResultadoPresupuesto(presupuesto) {
        document.getElementById('resultadoNombre').textContent = presupuesto.nombreCliente;
        document.getElementById('resultadoApellido').textContent = presupuesto.apellidoCliente;
        document.getElementById('resultadoFecha').textContent = presupuesto.fechaEvento;
        document.getElementById('resultadoTematica').textContent = presupuesto.tematica;
        document.getElementById('resultadoSalon').textContent = `${presupuesto.salonNombre} ($${presupuesto.salonPrecio.toLocaleString('es-AR')})`;

        const resultadoServiciosUl = document.getElementById('resultadoServicios');
        resultadoServiciosUl.innerHTML = '';
        if (presupuesto.serviciosSeleccionados.length > 0) {
            presupuesto.serviciosSeleccionados.forEach(servicio => {
                const li = document.createElement('li');
                li.textContent = `${servicio.descripcion} ($${servicio.valor.toLocaleString('es-AR')})`;
                resultadoServiciosUl.appendChild(li);
            });
        } else {
            resultadoServiciosUl.innerHTML = '<li>Ningún servicio adicional seleccionado.</li>';
        }

        document.getElementById('resultadoValorTotal').textContent = `$${presupuesto.valorTotal.toLocaleString('es-AR')}`;

        document.getElementById('presupuestoResultado').style.display = 'block';
        document.getElementById('presupuestoForm').style.display = 'none'; 
    }

    
    logout() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isAdmin');
        alert('Sesión cerrada exitosamente.');
        window.location.href = 'index.html';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new PresupuestoManager();
    console.log('Sistema de presupuestos inicializado.');
});