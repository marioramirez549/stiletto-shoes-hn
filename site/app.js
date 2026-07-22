"use strict";

const WHATSAPP = "50432209143";
let productos = [];
let categoriaActiva = "Todos";
let consulta = "";

function urlWhatsApp(producto) {
  let mensaje = "¡Hola, Stiletto Shoes! Quiero conocer los modelos, tallas y precios disponibles.";
  if (producto) {
    const estado = producto.disponible ? "disponibilidad" : "reposición";
    mensaje = "¡Hola, Stiletto Shoes! Me interesa el modelo " + producto.nombre + ". ¿Podrían confirmarme precio, tallas y " + estado + "?";
  }
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensaje);
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto || "");
  return div.innerHTML;
}

function renderizarFiltros() {
  const categorias = ["Todos"].concat([...new Set(productos.map(p => p.categoria))]);
  const contenedor = document.getElementById("filters");
  contenedor.innerHTML = categorias.map(categoria =>
    '<button type="button" data-category="' + escapar(categoria) + '" class="' + (categoria === categoriaActiva ? "active" : "") + '">' + escapar(categoria) + "</button>"
  ).join("");
  contenedor.querySelectorAll("button").forEach(boton => {
    boton.addEventListener("click", () => {
      categoriaActiva = boton.dataset.category;
      renderizarFiltros();
      renderizarProductos();
    });
  });
}

function renderizarProductos() {
  const termino = consulta.trim().toLocaleLowerCase("es");
  const visibles = productos.filter(producto => {
    const coincideCategoria = categoriaActiva === "Todos" || producto.categoria === categoriaActiva;
    const texto = (producto.nombre + " " + producto.categoria + " " + producto.colores + " " + producto.precio + " " + producto.tallas).toLocaleLowerCase("es");
    return coincideCategoria && (!termino || texto.includes(termino));
  });
  const grid = document.getElementById("product-grid");
  if (!visibles.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No encontramos ese modelo</h3><p>Prueba otro término o consulta directamente por WhatsApp.</p><a href="' + urlWhatsApp() + '" target="_blank" rel="noreferrer">Escribir por WhatsApp</a></div>';
    return;
  }
  grid.innerHTML = visibles.map(producto => {
    const clase = producto.disponible ? "" : " is-unavailable";
    const etiqueta = producto.disponible ? producto.etiqueta : "Agotado temporalmente";
    const accion = producto.disponible ? "Consultar disponibilidad" : "Consultar reposición";
    return '<article class="product-card' + clase + '">' +
      '<div class="product-image"><img src="' + escapar(producto.imagen) + '" alt="' + escapar(producto.descripcionImagen || producto.nombre) + '" loading="lazy"><span class="product-tag">' + escapar(etiqueta) + "</span></div>" +
      '<div class="product-info"><div><p>' + escapar(producto.categoria) + "</p><h3>" + escapar(producto.nombre) + "</h3><span>" + escapar(producto.colores) + '</span><div class="product-meta"><span>' + escapar(producto.tallas) + '</span></div><div class="product-price">' + escapar(producto.precio) + "</div></div>" +
      '<a class="product-action" href="' + urlWhatsApp(producto) + '" target="_blank" rel="noreferrer"><span>' + accion + '</span><b aria-hidden="true">↗</b></a></div></article>';
  }).join("");
}

function configurarDestacado() {
  const producto = productos.find(p => p.destacado && p.disponible) || productos.find(p => p.disponible) || productos[0];
  if (!producto) return;
  document.getElementById("hero-image").src = producto.imagen;
  document.getElementById("hero-image").alt = producto.descripcionImagen || producto.nombre;
  document.getElementById("hero-name").textContent = producto.nombre;
  document.getElementById("hero-colors").textContent = producto.colores;
}

async function iniciarCatalogo() {
  try {
    const respuesta = await fetch("catalogo.json?actualizacion=" + Date.now(), {cache:"no-store"});
    if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo");
    productos = await respuesta.json();
    configurarDestacado();
    renderizarFiltros();
    renderizarProductos();
  } catch (error) {
    document.getElementById("product-grid").innerHTML = '<div class="catalog-error"><h3>Catálogo temporalmente no disponible</h3><p>Escríbenos por WhatsApp para conocer los modelos disponibles.</p></div>';
  }
}

document.querySelectorAll("[data-whatsapp]").forEach(enlace => enlace.href = urlWhatsApp());
document.getElementById("search").addEventListener("input", evento => {
  consulta = evento.target.value;
  renderizarProductos();
});
const botonMenu = document.getElementById("menu-toggle");
const navegacion = document.getElementById("nav-links");
botonMenu.addEventListener("click", () => {
  const abierto = navegacion.classList.toggle("is-open");
  botonMenu.setAttribute("aria-expanded", String(abierto));
});
navegacion.querySelectorAll("a").forEach(enlace => enlace.addEventListener("click", () => {
  navegacion.classList.remove("is-open");
  botonMenu.setAttribute("aria-expanded", "false");
}));
iniciarCatalogo();
