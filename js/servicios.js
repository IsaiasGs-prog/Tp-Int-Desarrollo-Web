// Gestión de Servicios
const SERVICIOS_INICIALES = [
  { id: 1, nombre: "🎵 Sistema de Sonido", valor: "10000" },
  { id: 2, nombre: "🎨 Decoración Temática", valor: "8000" },
  { id: 3, nombre: "🎭 Animación", valor: "15000" },
  { id: 4, nombre: "🍰 Catering", valor: "14500" },
  { id: 5, nombre: "🎮 Juegos Infantiles", valor: "30000" },
];

class ServicioManager {
  constructor() {
    this.servicios = JSON.parse(localStorage.getItem("servicios_eventos") || "[]");
    if (this.servicios.length === 0) {
      this.servicios = SERVICIOS_INICIALES;
      this.guardarServicios();
    }
    this.renderizarTabla();
    this.renderizarCardsServicios();
    this.inicializarEventos();
  }

  guardarServicios() {
    localStorage.setItem("servicios_eventos", JSON.stringify(this.servicios));
  }

  generarId() {
    return this.servicios.length > 0 ? Math.max(...this.servicios.map(s => s.id)) + 1 : 1;
  }

  inicializarEventos() {
    const form = document.getElementById("formServicio");
    const btnCancelar = document.getElementById("btnCancelarServicio");
    const btnTabla = document.getElementById("btnTablaServicios");
    const btnCards = document.getElementById("btnCardsServicios");

    if (!form || !btnCancelar) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("servicioId").value;
      const nombre = document.getElementById("nombreServicio").value.trim();
      const valor = document.getElementById("valorServicio").value.trim();

      if (!nombre || !valor) return alert("Por favor, completá todos los campos.");

      if (id) {
        this.actualizarServicio({ id: parseInt(id), nombre, valor });
      } else {
        this.agregarServicio({ id: this.generarId(), nombre, valor });
      }

      this.limpiarFormulario();
      this.renderizarTabla();
      this.renderizarCardsServicios();
      renderizarCheckboxServicios();
    });

    btnCancelar.addEventListener("click", () => {
      this.limpiarFormulario();
    });

    if (btnTabla) {
      btnTabla.addEventListener("click", () => this.cambiarVistaServicios("tabla"));
    }
    if (btnCards) {
      btnCards.addEventListener("click", () => this.cambiarVistaServicios("cards"));
    }
  }

  agregarServicio(servicio) {
    this.servicios.push(servicio);
    this.guardarServicios();
  }

  actualizarServicio(servicioEditado) {
    const index = this.servicios.findIndex(s => s.id === servicioEditado.id);
    if (index !== -1) {
      this.servicios[index] = servicioEditado;
      this.guardarServicios();
      this.mostrarMensaje("Servicio actualizado correctamente", "exito");
    }
  }

  cargarServicio(id) {
    const servicio = this.servicios.find(s => s.id === id);
    if (!servicio) return;
    document.getElementById("servicioId").value = servicio.id;
    document.getElementById("nombreServicio").value = servicio.nombre;
    document.getElementById("valorServicio").value = servicio.valor;
    document.getElementById("formServicioTitle").textContent = "✏️ Editar Servicio Existente";
    document.getElementById("btnSubmitServicio").value = "Guardar Cambios";
    document.getElementById("btnCancelarServicio").style.display = "inline-block";
  }

  eliminarServicio(id) {
    if (confirm("¿Seguro que querés eliminar este servicio?")) {
      this.servicios = this.servicios.filter(s => s.id !== id);
      this.guardarServicios();
      this.renderizarTabla();
      this.renderizarCardsServicios();
      renderizarCheckboxServicios();
    }
  }

  limpiarFormulario() {
    const form = document.getElementById("formServicio");
    if (form) form.reset();
    document.getElementById("servicioId").value = "";
    document.getElementById("btnCancelarServicio").style.display = "none";
    document.getElementById("formServicioTitle").textContent = "➕ Agregar Nuevo Servicio";
    document.getElementById("btnSubmitServicio").value = "Agregar Servicio";
  }

  renderizarTabla() {
    const tbody = document.getElementById("tablaServicios");
    if (!tbody) return;
    tbody.innerHTML = "";
    this.servicios.forEach(s => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${s.id}</td>
        <td>${s.nombre}</td>
        <td>$${parseFloat(s.valor).toLocaleString('es-AR')}</td>
        <td>
          <button onclick="window.servicioManager.cargarServicio(${s.id})" class="btn btn-warning btn-small">Editar</button>
          <button onclick="window.servicioManager.eliminarServicio(${s.id})" class="btn btn-danger btn-small">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  renderizarCardsServicios() {
    const contenedor = document.getElementById("vistaCardsServicios");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    this.servicios.forEach(s => {
      const card = document.createElement("div");
      card.className = "card-servicio";
      card.innerHTML = `
        <h4>${s.nombre}</h4>
        <p><strong>Precio:</strong> $${parseFloat(s.valor).toLocaleString('es-AR')}</p>
        <div class="actions">
          <button onclick="window.servicioManager.cargarServicio(${s.id})" class="btn btn-warning btn-small">Editar</button>
          <button onclick="window.servicioManager.eliminarServicio(${s.id})" class="btn btn-danger btn-small">Eliminar</button>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }

  cambiarVistaServicios(vista) {
    const btnTabla = document.getElementById("btnTablaServicios");
    const btnCards = document.getElementById("btnCardsServicios");
    const tabla = document.getElementById("vistaTablaServicios");
    const cards = document.getElementById("vistaCardsServicios");

    if (!btnTabla || !btnCards || !tabla || !cards) return;

    if (vista === "tabla") {
      tabla.style.display = "block";
      cards.style.display = "none";
      btnTabla.classList.add("active");
      btnCards.classList.remove("active");
    } else {
      tabla.style.display = "none";
      cards.style.display = "grid";
      btnTabla.classList.remove("active");
      btnCards.classList.add("active");
    }
  }

  mostrarMensaje(texto, tipo) {
    alert(texto); // Podés cambiar esto por un mensaje más estético si querés
  }
}

// Inicialización segura desde main.js o script
function inicializarGestionServicios() {
  window.servicioManager = new ServicioManager();
  renderizarCheckboxServicios();
}

// Función auxiliar para los checkboxes (en el formulario de salones)
function renderizarCheckboxServicios() {
  const servicios = JSON.parse(localStorage.getItem("servicios_eventos") || "[]");
  const container = document.querySelector(".checkbox-group");
  if (!container) return;
  container.innerHTML = "";
  if (servicios.length === 0) {
    container.innerHTML = `<p style="color:#999; font-style:italic;">⚠️ No hay servicios disponibles. Agregalos desde la sección de administración.</p>`;
    return;
  }
  servicios.forEach(s => {
    const div = document.createElement("div");
    div.className = "checkbox-item";
    div.innerHTML = `
      <input type="checkbox" id="${s.valor}" value="${s.valor}">
      <label for="${s.valor}">${s.nombre}</label>
    `;
    container.appendChild(div);
  });
} 