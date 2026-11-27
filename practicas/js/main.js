// 1. Menú del celular: abre y cierra la lista al tocar el botón
const boton = document.getElementById("btn-menu");
const lista = document.querySelector("#menu ul");
boton.addEventListener("click", () => {
  const abierto = lista.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", abierto);
});

// 2. Videos: si pones el ID de un video de YouTube en data-id, aparece el video
//    Ejemplo: <div class="video" data-id="ABC123xyz00" ...>
document.querySelectorAll(".video").forEach((caja) => {
  const id = caja.dataset.id;
  if (!id) return; // sin ID se queda el enlace a YouTube
  caja.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video: ${caja.dataset.buscar}" allowfullscreen loading="lazy"></iframe>`;
});

// 3. Año del pie de página
const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

// 4. Logos: si un logo no carga, se muestra el nombre de la empresa en su lugar
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
// Si el navegador no soporta <dialog>, se usa el alert() normal
const soportaDialog = ventana && typeof ventana.showModal === "function";

// 5. Ventana emergente reutilizable
function mostrarAlerta({ titulo, texto, icono = "info", aceptar = "Entendido" }) {
  if (!soportaDialog) {
    window.alert(titulo + "\n\n" + texto);
    return Promise.resolve(true);
  }
  return new Promise((resolver) => {
    modalTitulo.textContent = titulo;
    modalTexto.textContent = texto;
    modalIcono.setAttribute("href", "#i-" + icono);
    btnOk.textContent = aceptar;
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

// 6. Aviso corto que desaparece solo
const toast = document.getElementById("toast");
let temporizador;
function mostrarAviso(mensaje) {
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast.classList.remove("visible"), 2800);
}

// 7. Bienvenida: una sola vez por visita
window.addEventListener("load", () => {
  let vista = false;
  try { vista = sessionStorage.getItem("bienvenida") === "1"; } catch (e) {}
  if (vista) return;
  setTimeout(() => {
    mostrarAlerta({
      titulo: "Antes de continuar",
      texto: "Los puestos de esta página son los que encontré en mis búsquedas. Cambian con frecuencia, así que confirma que sigan abiertas en el portal de cada empresa antes de aplicar.",
      icono: "bell",
    });
    try { sessionStorage.setItem("bienvenida", "1"); } catch (e) {}
  }, 600);
});

// 8. Copiar el nombre de un puesto para buscarlo en el portal de empleo
document.querySelectorAll(".copiar").forEach((boton) => {
  boton.addEventListener("click", async () => {
    const puesto = boton.dataset.copiar;
    try {
      await navigator.clipboard.writeText(puesto);
      mostrarAviso("Puesto copiado: " + puesto);
    } catch (e) {
      mostrarAlerta({
        titulo: "No se pudo copiar",
        texto: "Cópialo manualmente: " + puesto,
        icono: "alert",
      });
    }
  });
});
