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
