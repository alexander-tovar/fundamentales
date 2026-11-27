// 1. Menú del celular
const boton = document.getElementById("btn-menu");
const lista = document.querySelector("#menu ul");
boton.addEventListener("click", () => {
  const abierto = lista.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", abierto);
});

// 2. Datos extra de cada universidad (imágenes y enlaces); el resto sale del XML
const EXTRA = {
  UNI01: {
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Escudo-UNAM-escalable.svg?width=200",
    foto: "img/unam.jpg",
    url: "https://www.unaminternacional.unam.mx",
    sitio: "Movilidad en la UNAM",
  },
  UNI02: {
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Logotipo_de_la_Universidad_Complutense_de_Madrid.svg?width=200",
    foto: "img/ucm.jpg",
    url: "https://www.ucm.es",
    sitio: "Sitio de la UCM",
  },
};

// Evita que el texto del XML se interprete como HTML
const limpiar = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// 3. Leer el XML y convertirlo en una lista de objetos
async function leerXML() {
  const respuesta = await fetch("AF02.xml");
  if (!respuesta.ok) throw new Error("No se encontró AF02.xml");
  const xml = new DOMParser().parseFromString(await respuesta.text(), "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("El XML tiene errores");
  const txt = (nodo, etiqueta) => nodo.querySelector(etiqueta).textContent.trim();
  return [...xml.querySelectorAll("universidad")].map((u) => ({
    id: u.getAttribute("id"),
    nombre: txt(u, "nombre"),
    pais: txt(u, "pais"),
    codigo: u.querySelector("pais").getAttribute("codigo"),
    ciudad: txt(u, "ciudad"),
    tipo: txt(u, "tipo"),
    programa: txt(u, "programa"),
    duracion: txt(u, "duracion"),
  }));
}

// Lista de datos con iconos (se usa en la tarjeta y en la ventana emergente)
const filas = (d) => `
  <li><i class="fa-solid fa-flag"></i> ${limpiar(d.pais)} (${limpiar(d.codigo)})</li>
  <li><i class="fa-solid fa-location-dot"></i> ${limpiar(d.ciudad)}</li>
  <li><i class="fa-solid fa-graduation-cap"></i> ${limpiar(d.programa)}</li>
  <li><i class="fa-solid fa-clock"></i> ${limpiar(d.duracion)}</li>`;

// 4. Ventana emergente (modal)
const modal = document.getElementById("modal");
function abrirModal(d) {
  const e = EXTRA[d.id] || {};
  modal.className = d.id;
  document.getElementById("modal-titulo").textContent = d.nombre;
  document.getElementById("modal-datos").innerHTML = `<li><i class="fa-solid fa-globe"></i> Intercambio ${limpiar(d.tipo.toLowerCase())}</li>` + filas(d);
  document.getElementById("modal-enlace").innerHTML = e.url
    ? `<a class="enlace" href="${e.url}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${e.sitio}</a>` : "";
  modal.showModal();
}
document.getElementById("modal-cerrar").addEventListener("click", () => modal.close());
modal.addEventListener("click", (ev) => { if (ev.target === modal) modal.close(); }); // clic fuera = cerrar

// 5. Dibujar las tarjetas
function dibujar(lista) {
  const cont = document.getElementById("tarjetas");
  cont.innerHTML = "";
  lista.forEach((d) => {
    const e = EXTRA[d.id] || {};
    const art = document.createElement("article");
    art.className = `tarjeta ${d.id}`;
    art.innerHTML = `
      <div class="foto"><i class="fa-solid fa-building-columns"></i><img src="${e.foto || ""}" alt="Foto de ${limpiar(d.nombre)}" loading="lazy"></div>
      <div class="cuerpo">
        <img class="logo-uni" src="${e.logo || ""}" alt="Logo de ${limpiar(d.nombre)}" loading="lazy">
        <span class="insignia"><i class="fa-solid fa-globe"></i> ${limpiar(d.tipo)}</span>
        <h3>${limpiar(d.nombre)}</h3>
        <ul class="datos">${filas(d)}</ul>
        <div class="acciones">
          <button class="boton" type="button"><i class="fa-solid fa-circle-info"></i> Ver detalles</button>
          ${e.url ? `<a class="enlace" href="${e.url}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${e.sitio}</a>` : ""}
        </div>
      </div>`;
    art.querySelector("button").addEventListener("click", () => abrirModal(d));
    cont.appendChild(art);
  });
  // Si una imagen no carga: la foto se oculta (queda el degradado) y el logo se cambia por texto
  cont.querySelectorAll(".foto img").forEach((i) => i.addEventListener("error", () => i.remove()));
  cont.querySelectorAll(".logo-uni").forEach((i) => i.addEventListener("error", () => {
    const s = document.createElement("span");
    s.className = "logo-nombre";
    s.textContent = i.alt.replace("Logo de ", "");
    i.replaceWith(s);
  }));
}

// 6. Arranque: cargar el XML y mostrar alertas
leerXML()
  .then((lista) => {
    dibujar(lista);
    try {
      if (!sessionStorage.getItem("avisado")) { // alerta nativa, solo una vez por visita
        alert(`Se cargaron ${lista.length} universidades desde AF02.xml.`);
        sessionStorage.setItem("avisado", "1");
      }
    } catch (e) { /* si el navegador bloquea el almacenamiento, no pasa nada */ }
  })
  .catch((error) => {
    document.getElementById("tarjetas").innerHTML = "<p>No se pudieron cargar los datos.</p>";
    alert("No se pudo leer AF02.xml (" + error.message + "). Abre la página con Live Server o desde GitHub Pages, no con doble clic.");
  });

// 7. Año del pie de página
const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();
