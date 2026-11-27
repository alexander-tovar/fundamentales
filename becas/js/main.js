// 1. Menú del celular: abre y cierra la lista al tocar el botón
const boton = document.getElementById("btn-menu");
const lista = document.querySelector("#menu ul");
boton.addEventListener("click", () => {
  const abierto = lista.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", abierto);
});

// 2. Año del pie de página (solo si existe el elemento, para no romper el código)
const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

// 3. Logos: si un logo no carga, se muestra el nombre de la beca en su lugar
document.querySelectorAll(".logo-emp").forEach((img) => {
  img.addEventListener("error", () => {
    const texto = document.createElement("span");
    texto.className = "logo-nombre";
    texto.textContent = img.alt.replace("Logo de ", "");
    img.replaceWith(texto);
  });
});

// ===== Alertas (pop-ups) =====
const ventana = document.getElementById("modal");
const modalIcono = document.getElementById("modal-icono");
const modalTitulo = document.getElementById("modal-titulo");
const modalTexto = document.getElementById("modal-texto");
const btnOk = document.getElementById("modal-ok");
const btnCancelar = document.getElementById("modal-cancelar");
// Si el navegador no soporta <dialog>, se usan los alert() y confirm() normales
const soportaDialog = ventana && typeof ventana.showModal === "function";

// 4. Ventana emergente reutilizable. Devuelve una promesa: true si presiona el botón principal
function mostrarAlerta({ titulo, texto, icono = "info", aceptar = "Entendido", cancelar = null, color = null }) {
  if (!soportaDialog) {
    if (cancelar) return Promise.resolve(window.confirm(titulo + "\n\n" + texto));
    window.alert(titulo + "\n\n" + texto);
    return Promise.resolve(true);
  }
  return new Promise((resolver) => {
    modalTitulo.textContent = titulo;
    modalTexto.textContent = texto;
    modalIcono.setAttribute("href", "#i-" + icono);
    btnOk.textContent = aceptar;
    btnCancelar.textContent = cancelar || "Cancelar";
    btnCancelar.hidden = !cancelar;
    // El color de la ventana cambia según la beca (verde, dorado, rojo o guinda)
    if (color) ventana.style.setProperty("--ac", color);
    else ventana.style.removeProperty("--ac");
    ventana.returnValue = "";
    ventana.addEventListener("close", () => resolver(ventana.returnValue === "ok"), { once: true });
    ventana.showModal();
    btnOk.focus();
  });
}

// Cerrar al hacer clic fuera de la ventana
if (soportaDialog) {
  ventana.addEventListener("click", (e) => {
    if (e.target === ventana) ventana.close("cancel");
  });
}

// 5. Aviso corto que desaparece solo
const toast = document.getElementById("toast");
let temporizador;
function mostrarAviso(mensaje) {
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast.classList.remove("visible"), 2800);
}

// 6. Bienvenida: una sola vez por visita
window.addEventListener("load", () => {
  let vista = false;
  try { vista = sessionStorage.getItem("bienvenida") === "1"; } catch (e) {}
  if (vista) return;
  setTimeout(() => {
    mostrarAlerta({
      titulo: "Antes de continuar",
      texto: "La información de esta página se consultó en octubre de 2026. Las fechas y montos pueden cambiar, así que confirma todo en la página oficial antes de aplicar.",
      icono: "bell",
      aceptar: "Entendido",
    });
    try { sessionStorage.setItem("bienvenida", "1"); } catch (e) {}
  }, 600);
});

// 7. Botones "Ir a...": piden confirmación antes de salir a otro sitio
document.querySelectorAll("a.boton").forEach((enlace) => {
  enlace.addEventListener("click", async (e) => {
    e.preventDefault();
    const beca = enlace.closest("article");
    const nombre = beca.querySelector("h2").textContent;
    const color = getComputedStyle(beca).getPropertyValue("--ac").trim();
    const continuar = await mostrarAlerta({
      titulo: "Vas a salir de esta página",
      texto: "Se abrirá en una pestaña nueva el sitio oficial de «" + nombre + "».",
      icono: "external",
      aceptar: "Continuar",
      cancelar: "Quedarme aquí",
      color: color,
    });
    if (continuar) window.open(enlace.href, "_blank", "noopener");
  });
});

// 8. Estado "Cerrada" en la tabla de fechas: explica qué significa
document.querySelectorAll(".estado").forEach((boton) => {
  boton.addEventListener("click", () => {
    mostrarAlerta({
      titulo: boton.dataset.beca + ": convocatoria cerrada",
      texto: boton.dataset.msg,
      icono: "clock",
    });
  });
});

// 9. Copiar correo al portapapeles
document.querySelectorAll(".copiar").forEach((boton) => {
  boton.addEventListener("click", async () => {
    const correo = boton.dataset.copiar;
    try {
      await navigator.clipboard.writeText(correo);
      mostrarAviso("Correo copiado: " + correo);
    } catch (e) {
      mostrarAlerta({
        titulo: "No se pudo copiar",
        texto: "Cópialo manualmente: " + correo,
        icono: "alert",
      });
    }
  });
});
