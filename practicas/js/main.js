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
document.getElementById("anio").textContent = new Date().getFullYear();

// 4. Logos: si un logo no carga, se muestra el nombre de la empresa en su lugar
document.querySelectorAll(".logo-emp").forEach((img) => {
  img.addEventListener("error", () => {
    const texto = document.createElement("span");
    texto.className = "logo-nombre";
    texto.textContent = img.alt.replace("Logo de ", "");
    img.replaceWith(texto);
  });
});
