/* ==========================================================
   formulario.js · validación básica del formulario de admisión
   - Validación al salir del campo (blur) y al enviar (submit)
   - Mensajes de error claros enlazados con aria-describedby
   - Resumen de errores con enlaces a cada campo (foco automático)
   - Retroalimentación: estado "Enviando…", mensaje de éxito en modal
   ========================================================== */
(function () {
  "use strict";
  var form = document.getElementById("form-admision");
  if (!form) return;

  var resumen = document.getElementById("resumen-errores");
  var listaErrores = document.getElementById("lista-errores");
  var btn = document.getElementById("btn-enviar");
  var contador = document.getElementById("contador");
  var mensaje = document.getElementById("mensaje");

  /* Reglas: cada una devuelve "" si es válido o el texto del error */
  var reglas = {
    nombre: function (v) {
      if (!v.trim()) return "Escribe tu nombre completo.";
      if (v.trim().length < 5 || v.trim().indexOf(" ") === -1) return "Escribe al menos un nombre y un apellido (mínimo 5 letras).";
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(v)) return "El nombre solo puede contener letras y espacios.";
      return "";
    },
    dni: function (v) {
      if (!v.trim()) return "Escribe tu número de DNI.";
      if (!/^\d{8}$/.test(v.trim())) return "El DNI debe tener exactamente 8 números, sin espacios ni letras.";
      return "";
    },
    correo: function (v) {
      if (!v.trim()) return "Escribe tu correo electrónico.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "El correo no parece válido. Ejemplo: nombre@correo.com";
      return "";
    },
    celular: function (v) {
      if (!v.trim()) return "Escribe tu número de celular.";
      if (!/^9\d{8}$/.test(v.replace(/\s/g, ""))) return "El celular debe tener 9 dígitos y empezar con 9. Ejemplo: 987654321";
      return "";
    },
    modalidad: function (v) { return v ? "" : "Elige una modalidad de estudio."; },
    mensaje: function (v) { return v.length > 300 ? "El mensaje no puede superar los 300 caracteres." : ""; },
    acepto: function (_v, el) { return el.checked ? "" : "Debes aceptar el uso de tus datos para poder enviar la solicitud."; }
  };

  function mostrar(campo, error) {
    var id = campo.id;
    var cajaError = document.getElementById("err-" + id);
    campo.classList.toggle("is-invalid", !!error);
    campo.classList.toggle("is-valid", !error && campo.dataset.tocado === "1" && campo.type !== "checkbox" && !!campo.value);
    if (error) { campo.setAttribute("aria-invalid", "true"); } else { campo.removeAttribute("aria-invalid"); }
    if (cajaError) cajaError.textContent = error;
  }

  function validar(campo) {
    var regla = reglas[campo.name];
    if (!regla) return "";
    var error = regla(campo.value, campo);
    mostrar(campo, error);
    return error;
  }

  var campos = Array.prototype.slice.call(form.querySelectorAll("[data-validar]"));
  campos.forEach(function (c) {
    c.addEventListener("blur", function () { c.dataset.tocado = "1"; validar(c); });
    /* Si ya mostraba error, se corrige en vivo para dar respuesta inmediata */
    c.addEventListener("input", function () { if (c.classList.contains("is-invalid")) validar(c); });
    c.addEventListener("change", function () { c.dataset.tocado = "1"; validar(c); });
  });

  /* Solo números en DNI y celular (ayuda al usuario a no equivocarse) */
  ["dni", "celular"].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("input", function () { el.value = el.value.replace(/[^\d ]/g, ""); });
  });

  /* Contador de caracteres */
  mensaje.addEventListener("input", function () {
    contador.textContent = mensaje.value.length + " / 300 caracteres";
    contador.classList.toggle("text-danger", mensaje.value.length > 300);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errores = [];
    campos.forEach(function (c) {
      c.dataset.tocado = "1";
      var err = validar(c);
      if (err) {
        var etiqueta = form.querySelector('label[for="' + c.id + '"]');
        errores.push({ id: c.id, texto: (etiqueta ? etiqueta.dataset.nombre || etiqueta.textContent.replace("*", "").trim() : c.name) + ": " + err });
      }
    });

    if (errores.length) {
      listaErrores.innerHTML = "";
      errores.forEach(function (er) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + er.id;
        a.textContent = er.texto;
        a.addEventListener("click", function (ev) { ev.preventDefault(); document.getElementById(er.id).focus(); });
        li.appendChild(a);
        listaErrores.appendChild(li);
      });
      resumen.hidden = false;
      resumen.querySelector("h2").textContent = errores.length === 1 ? "Hay 1 campo por corregir" : "Hay " + errores.length + " campos por corregir";
      resumen.focus(); /* el lector de pantalla lee el resumen */
      return;
    }

    resumen.hidden = true;
    /* Retroalimentación de envío (simulado: no hay servidor en este examen) */
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.querySelector(".txt").textContent = "Enviando…";
    window.setTimeout(function () {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      btn.querySelector(".txt").textContent = "Enviar solicitud";
      var nombre = document.getElementById("nombre").value.trim().split(" ")[0];
      document.getElementById("modal-nombre").textContent = nombre;
      document.getElementById("modal-correo").textContent = document.getElementById("correo").value.trim();
      var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalExito"));
      modal.show();
      form.reset();
      campos.forEach(function (c) { c.classList.remove("is-valid", "is-invalid"); c.removeAttribute("aria-invalid"); c.dataset.tocado = ""; });
      contador.textContent = "0 / 300 caracteres";
    }, 1100);
  });
})();
