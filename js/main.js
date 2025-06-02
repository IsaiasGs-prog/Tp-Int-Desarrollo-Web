const SALONES_INICIALES = [
    {
        id: 1,
        nombre: "Salón Arcoíris",
        capacidad: 50,
        precio: 25000,
        ubicacion: "Nicaragua 2873, Concordia (Entre Rios)",
        descripcion: "Salón colorido y alegre, perfecto para fiestas infantiles con temática de arcoíris.",
        imagen: "https://i.pinimg.com/736x/93/b0/c5/93b0c54d7c62bfadef8dd874cc95d036.jpg",
        servicios: ["sonido", "decoracion", "animacion"],
        disponible: true
    },
    {
        id: 2,
        nombre: "Salón Aventura",
        capacidad: 75,
        precio: 35000,
        ubicacion: "Alfonsín 345, Concordia (Entre Rios)",
        descripcion: "Espacio amplio con juegos de aventura y zona de escalada para niños.",
        imagen: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
        servicios: ["sonido", "juegos", "catering"],
        disponible: true
    },
    {
        id: 3,
        nombre: "Salón Princesas",
        capacidad: 40,
        precio: 30000,
        ubicacion: "Mantilla 87, Concordia (Entre Rios)",
        descripcion: "Decorado especialmente para fiestas de princesas con castillo inflable.",
        imagen: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
        servicios: ["decoracion", "animacion", "catering"],
        disponible: false
    }
];

class SalonManager {
    constructor() {
        this.storageKey = 'salones_eventos';
        this.inicializarStorage();
        this.setupEventListeners();
        this.currentView = 'tabla'; 
        this.cargarSalones(); 
    }

    
    inicializarStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(SALONES_INICIALES));
            console.log('LocalStorage inicializado con datos por defecto.');
        }
    }

    
    obtenerSalones() {
        const salones = localStorage.getItem(this.storageKey);
        return salones ? JSON.parse(salones) : [];
    }

    
    guardarSalones(salones) {
        localStorage.setItem(this.storageKey, JSON.stringify(salones));
    }

    
    generarNuevoId() {
        const salones = this.obtenerSalones();
        return salones.length > 0 ? Math.max(...salones.map(s => s.id)) + 1 : 1;
    }

    
    setupEventListeners() {
        
        document.getElementById('salonForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.procesarFormulario();
        });

        
        document.getElementById('btnCancelar').addEventListener('click', () => {
            this.cancelarEdicion();
        });

        
        document.getElementById('btnTabla').addEventListener('click', () => {
            this.cambiarVista('tabla');
        });

        document.getElementById('btnCards').addEventListener('click', () => {
            this.cambiarVista('cards');
        });
    }

    
    procesarFormulario() {
        const salonId = document.getElementById('salonId').value;
        const isEditing = salonId !== '';

        
        const salonData = {
            nombre: document.getElementById('nombre').value.trim(),
            capacidad: parseInt(document.getElementById('capacidad').value),
            precio: parseFloat(document.getElementById('precio').value),
            ubicacion: document.getElementById('ubicacion').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            imagen: document.getElementById('imagen').value.trim(),
            servicios: this.obtenerServiciosSeleccionados(),
            disponible: document.getElementById('disponible').checked
        };

        
        if (!this.validarDatos(salonData)) {
            return;
        }

        if (isEditing) {
            this.modificarSalon(parseInt(salonId), salonData);
        } else {
            this.crearSalon(salonData);
        }
    }

    
    validarDatos(data) {
        if (!data.nombre) {
            this.mostrarMensaje('El nombre del salón es obligatorio.', 'error');
            return false;
        }
        if (isNaN(data.capacidad) || data.capacidad <= 0) {
            this.mostrarMensaje('La capacidad debe ser un número positivo.', 'error');
            return false;
        }
        if (isNaN(data.precio) || data.precio < 0) {
            this.mostrarMensaje('El precio debe ser un número no negativo.', 'error');
            return false;
        }
        if (!data.ubicacion) {
            this.mostrarMensaje('Debe seleccionar una ubicación.', 'error');
            return false;
        }

        
        const salones = this.obtenerSalones();
        const salonId = document.getElementById('salonId').value; 
        const nombreExiste = salones.some(salon =>
            salon.nombre.toLowerCase() === data.nombre.toLowerCase() &&
            (!salonId || salon.id !== parseInt(salonId)) 
        );

        if (nombreExiste) {
            this.mostrarMensaje('Ya existe un salón con ese nombre.', 'error');
            return false;
        }

        return true;
    }

    
    obtenerServiciosSeleccionados() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#disponible)');
        const servicios = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                servicios.push(checkbox.value);
            }
        });
        return servicios;
    }

    
    crearSalon(salonData) {
        const salones = this.obtenerSalones();
        const nuevoSalon = {
            id: this.generarNuevoId(),
            ...salonData
        };

        salones.push(nuevoSalon);
        this.guardarSalones(salones);
        this.mostrarMensaje('Salón agregado exitosamente: "' + nuevoSalon.nombre + '"', 'exito');
        this.limpiarFormulario();
        this.cargarSalones(); 
    }

    
    modificarSalon(id, salonData) {
        const salones = this.obtenerSalones();
        const index = salones.findIndex(salon => salon.id === id);

        if (index !== -1) {
            salones[index] = { id, ...salonData };
            this.guardarSalones(salones);
            this.mostrarMensaje('Salón "' + salonData.nombre + '" modificado exitosamente!', 'exito');
            this.cancelarEdicion();
            this.cargarSalones(); 
        } else {
            this.mostrarMensaje('Error: Salón no encontrado para modificar.', 'error');
        }
    }

    
    eliminarSalon(id) {
        if (confirm('¿Está seguro que desea eliminar este salón? Esta acción no se puede deshacer.')) {
            const salones = this.obtenerSalones();
            const salonesActualizados = salones.filter(salon => salon.id !== id);
            this.guardarSalones(salonesActualizados);
            this.mostrarMensaje('Salón eliminado exitosamente!', 'exito');
            this.cargarSalones(); 
            this.cancelarEdicion(); 
        }
    }

    
    editarSalon(id) {
        const salones = this.obtenerSalones();
        const salon = salones.find(s => s.id === id);

        if (salon) {
            
            document.getElementById('form-title').textContent = 'Modificar Salón';
            document.getElementById('btnSubmit').value = 'Guardar Cambios';
            document.getElementById('btnCancelar').style.display = 'inline-block';

            document.getElementById('salonId').value = salon.id;
            document.getElementById('nombre').value = salon.nombre;
            document.getElementById('capacidad').value = salon.capacidad;
            document.getElementById('precio').value = salon.precio;
            document.getElementById('ubicacion').value = salon.ubicacion;
            document.getElementById('descripcion').value = salon.descripcion || '';
            document.getElementById('imagen').value = salon.imagen || '';
            document.getElementById('disponible').checked = salon.disponible;

            this.marcarServicios(salon.servicios || []);

            document.getElementById('salonForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    marcarServicios(servicios) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#disponible)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = servicios.includes(checkbox.value);
        });
    }

    cancelarEdicion() {
        document.getElementById('form-title').textContent = '➕ Agregar Nuevo Salón';
        document.getElementById('btnSubmit').value = 'Agregar Salón';
        document.getElementById('btnCancelar').style.display = 'none';
        this.limpiarFormulario();
    }

    limpiarFormulario() {
        document.getElementById('salonForm').reset();
        document.getElementById('salonId').value = '';
        document.getElementById('disponible').checked = true; 
    }

    cargarSalones() {
        const salones = this.obtenerSalones();
        if (this.currentView === 'tabla') {
            this.renderizarTabla(salones);
            document.getElementById('vistaTabla').style.display = 'block';
            document.getElementById('vistaCards').style.display = 'none';
        } else {
            this.renderizarCards(salones);
            document.getElementById('vistaTabla').style.display = 'none';
            document.getElementById('vistaCards').style.display = 'block';
        }
    }

    renderizarTabla(salones) {
        const tbody = document.getElementById('tablaSalones');
        tbody.innerHTML = ''; 

        if (salones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">No hay salones registrados</td></tr>';
            return;
        }

        salones.forEach(salon => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${salon.id}</td>
                <td><strong>${salon.nombre}</strong></td>
                <td>${salon.capacidad} personas</td>
                <td>$${salon.precio.toLocaleString()}</td>
                <td>${salon.ubicacion}</td>
                <td>${this.formatearServicios(salon.servicios || [])}</td>
                <td>
                    <span class="${salon.disponible ? 'status-disponible' : 'status-no-disponible'}">
                        ${salon.disponible ? '✅ Disponible' : '❌ No Disponible'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-ver btn-small" onclick="window.salonManager.visualizarSalon(${salon.id})" title="Ver detalles">
                        👁Ver
                    </button>
                    <button class="btn-editar btn-small" onclick="window.salonManager.editarSalon(${salon.id})" title="Editar">
                        ✏️Editar
                    </button>
                    <button class="btn-danger btn-small" onclick="window.salonManager.eliminarSalon(${salon.id})" title="Eliminar">
                        🗑Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderizarCards(salones) {
        const container = document.getElementById('vistaCards');
        container.innerHTML = ''; 

        if (salones.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666; grid-column: 1/-1;">No hay salones registrados</div>';
            return;
        }

        salones.forEach(salon => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${salon.nombre}</h3>
                <div class="salon-info">
                    <span><strong>Capacidad:</strong> ${salon.capacidad} personas</span>
                    <span><strong>Precio:</strong> $${salon.precio.toLocaleString()}</span>
                    <span><strong>Ubicación:</strong> ${salon.ubicacion}</span>
                </div>
                ${salon.descripcion ? `<p>${salon.descripcion}</p>` : ''}
                ${salon.imagen ? `<img src="${salon.imagen}" alt="${salon.nombre}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin: 10px 0;">` : ''}
                <div class="servicios">
                    <strong>Servicios:</strong>
                    ${this.renderizarServiciosCards(salon.servicios || [])}
                </div>
                <div style="margin: 15px 0;">
                    <span class="${salon.disponible ? 'status-disponible' : 'status-no-disponible'}">
                        ${salon.disponible ? '✅ Disponible' : '❌ No Disponible'}
                    </span>
                </div>
                <div class="actions" style="display: flex; gap: 5px; justify-content: center;">
                    <button class="btn-ver btn-small" onclick="window.salonManager.visualizarSalon(${salon.id})" title="Ver detalles">
                        👁Ver
                    </button>
                    <button class="btn-editar btn-small" onclick="window.salonManager.editarSalon(${salon.id})" title="Editar">
                        ✏️Editar
                    </button>
                    <button class="btn-danger btn-small" onclick="window.salonManager.eliminarSalon(${salon.id})" title="Eliminar">
                        🗑Eliminar
                    </button>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    formatearServicios(servicios) {
        if (servicios.length === 0) return 'Sin servicios';

        const iconos = {
            sonido: '🎵',
            decoracion: '🎨',
            animacion: '🎭',
            catering: '🍰',
            juegos: '🎮'
        };

        return servicios.map(servicio => iconos[servicio] || '•').join(' ');
    }

    renderizarServiciosCards(servicios) {
        if (servicios.length === 0) return '<span style="color: #666;">Sin servicios adicionales</span>';

        const nombres = {
            sonido: '🎵 Sonido',
            decoracion: '🎨 Decoración',
            animacion: '🎭 Animación',
            catering: '🍰 Catering',
            juegos: '🎮 Juegos'
        };

        return servicios.map(servicio =>
            `<span class="servicio">${nombres[servicio] || servicio}</span>`
        ).join('');
    }

    visualizarSalon(id) {
        const salones = this.obtenerSalones();
        const salon = salones.find(s => s.id === id);

        if (salon) {
            const serviciosTexto = salon.servicios && salon.servicios.length > 0
                ? salon.servicios.map(s => {
                    const nombres = {
                        sonido: 'Sistema de Sonido',
                        decoracion: 'Decoración Temática',
                        animacion: 'Animación',
                        catering: 'Catering',
                        juegos: 'Juegos Infantiles'
                    };
                    return nombres[s] || s;
                }).join(', ')
                : 'Sin servicios adicionales';

            const mensaje = `
                📍 DETALLES DEL SALÓN

                🏢 Nombre: ${salon.nombre}
                👥 Capacidad: ${salon.capacidad} personas
                💰 Precio: $${salon.precio.toLocaleString()}
                📍 Ubicación: ${salon.ubicacion}
                📝 Descripción: ${salon.descripcion || 'Sin descripción'}
                🎉 Servicios: ${serviciosTexto}
                ✅ Estado: ${salon.disponible ? 'Disponible' : 'No Disponible'}
                ${salon.imagen ? `\n🖼️ Imagen: ${salon.imagen}` : ''}
            `;

            alert(mensaje);
        }
    }

    cambiarVista(vista) {
        this.currentView = vista;

       
        document.getElementById('btnTabla').classList.toggle('active', vista === 'tabla');
        document.getElementById('btnCards').classList.toggle('active', vista === 'cards');

        this.cargarSalones();
    }

    mostrarMensaje(texto, tipo) {
        const mensaje = document.getElementById('mensaje');
        mensaje.textContent = texto;
        mensaje.className = `mensaje mensaje-${tipo} show`;

        setTimeout(() => {
            mensaje.classList.remove('show');
        }, 5000);
    }

    obtenerEstadisticas() {
        const salones = this.obtenerSalones();
        return {
            total: salones.length,
            disponibles: salones.filter(s => s.disponible).length,
            capacidadTotal: salones.reduce((sum, s) => sum + s.capacidad, 0),
            precioPromedio: salones.length > 0 ? salones.reduce((sum, s) => sum + s.precio, 0) / salones.length : 0
        };
    }
}



let salonManager; 

document.addEventListener('DOMContentLoaded', function() {
    window.salonManager = new SalonManager(); 
    console.log('Sistema de gestión de salones inicializado.');

    
    const stats = window.salonManager.obtenerEstadisticas();
    console.log('Estadísticas actuales de salones:', stats);
});


function exportarDatos() {
    const salones = JSON.parse(localStorage.getItem('salones_eventos') || '[]');
    const dataStr = JSON.stringify(salones, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'salones_backup.json';
    link.click();
    URL.revokeObjectURL(url); 


function importarDatos(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const salones = JSON.parse(e.target.result);
                localStorage.setItem('salones_eventos', JSON.stringify(salones));
                window.salonManager.cargarSalones();
                window.salonManager.mostrarMensaje('Datos importados exitosamente!', 'exito');
            } catch (error) {
                window.salonManager.mostrarMensaje('Error al importar datos: ' + error.message, 'error');
                console.error('Error al parsear JSON importado:', error);
            }
        };
        reader.readAsText(file);
    }
}
    }