/* ==========================================================
   main.js · comportamiento común a las 3 páginas
   - Barra de accesibilidad (tamaño de letra y alto contraste)
   - Revelado suave al hacer scroll (respeta prefers-reduced-motion)
   - Botón de pausa del carrusel (WCAG 2.2.2)
   ========================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* localStorage puede fallar (modo privado): siempre con try/catch */
  function guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) { /* sin persistencia */ } }
  function leer(clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } }

  /* ---------- 1. Preferencias de accesibilidad ---------- */
  var NIVELES = [100, 112.5, 125, 137.5];
  var nivel = parseInt(leer("rz-fuente"), 10);
  if (isNaN(nivel) || nivel < 0 || nivel > 3) nivel = 0;

  var btnMas = document.getElementById("fuente-mas");
  var btnMenos = document.getElementById("fuente-menos");
  var btnContraste = document.getElementById("alto-contraste");
  var anuncio = document.getElementById("anuncio-a11y"); /* región aria-live */

  function aplicarFuente(decir) {
    root.style.fontSize = NIVELES[nivel] + "%";
    if (btnMas) btnMas.disabled = nivel === NIVELES.length - 1;
    if (btnMenos) btnMenos.disabled = nivel === 0;
    guardar("rz-fuente", String(nivel));
    if (decir && anuncio) anuncio.textContent = "Tamaño de letra al " + Math.round(NIVELES[nivel]) + " por ciento";
  }
  function aplicarContraste(activo, decir) {
    if (activo) root.setAttribute("data-contraste", "alto"); else root.removeAttribute("data-contraste");
    if (btnContraste) btnContraste.setAttribute("aria-pressed", String(activo));
    guardar("rz-contraste", activo ? "1" : "0");
    if (decir && anuncio) anuncio.textContent = activo ? "Modo de alto contraste activado" : "Modo de alto contraste desactivado";
  }

  if (btnMas) btnMas.addEventListener("click", function () { if (nivel < NIVELES.length - 1) { nivel++; aplicarFuente(true); } });
  if (btnMenos) btnMenos.addEventListener("click", function () { if (nivel > 0) { nivel--; aplicarFuente(true); } });
  if (btnContraste) btnContraste.addEventListener("click", function () {
    aplicarContraste(btnContraste.getAttribute("aria-pressed") !== "true", true);
  });
  aplicarFuente(false);
  aplicarContraste(leer("rz-contraste") === "1", false);

  /* ---------- 2. Revelado al hacer scroll ---------- */
  var elementos = document.querySelectorAll(".rz-reveal");
  var sinMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !sinMovimiento) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    elementos.forEach(function (el) { io.observe(el); });
  } else {
    elementos.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 3. Carrusel: pausa/reanudar ---------- */
  var carrusel = document.getElementById("carruselVida");
  var btnPausa = document.getElementById("carrusel-pausa");
  if (carrusel && btnPausa && window.bootstrap) {
    var inst = bootstrap.Carousel.getOrCreateInstance(carrusel);
    if (sinMovimiento) { inst.pause(); setPausa(true); }
    btnPausa.addEventListener("click", function () {
      var pausado = btnPausa.getAttribute("aria-pressed") === "true";
      if (pausado) { inst.cycle(); } else { inst.pause(); }
      setPausa(!pausado);
    });
  }
  function setPausa(pausado) {
    btnPausa.setAttribute("aria-pressed", String(pausado));
    btnPausa.querySelector(".txt").textContent = pausado ? "Reanudar" : "Pausar";
    btnPausa.setAttribute("aria-label", pausado ? "Reanudar carrusel automático" : "Pausar carrusel automático");
  }

  /* ---------- 4. Año automático en el pie ---------- */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
