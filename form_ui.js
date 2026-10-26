/**
 * ============================================================
 * form_ui.js - Capa de PRESENTACION (DOM)
 * ============================================================
 * Responsabilidad: pintar resultados de validacion en pantalla.
 *   - Mensaje de error por campo (#mensaje_<id>)
 *   - Estado visual rojo/verde con clases CSS (.errorValidacion /
 *     .exitoValidacion) en lugar de estilos inline
 *   - Indicador de fortaleza de contrasena
 *   - Mensaje de exito
 *
 * Esta capa NO contiene reglas de validacion (eso es validators.js)
 * ni decide QUE validar (eso es validacion_form.js).
 *
 * Orden de carga: validators.js -> form_ui.js -> validacion_form.js
 * Se expone un unico namespace global: window.FormUI
 * ============================================================
 */
(function (global) {
  "use strict";

  /* Cache de referencias DOM: se consulta una sola vez por id y se
   * reutiliza en cada validacion (evita getElementById repetidos). */
  const referencias = new Map();

  /**
   * Obtiene (y cachea) un elemento del DOM por id.
   * @param {string} id
   * @returns {Element|null}
   */
  function ref(id) {
    if (!referencias.has(id)) {
      referencias.set(id, document.getElementById(id));
    }
    return referencias.get(id);
  }

  /**
   * Invalida la cache de un id (util si el formulario se reinicia).
   * @param {string} id
   */
  function invalidarCache(id) {
    referencias.delete(id);
  }

  /* ==========================================================
   * ESTADO POR CAMPO (rojo / verde / neutro)
   * ========================================================== */

  /**
   * Indica si el elemento es un control de formulario (input/select)
   * sobre el cual tiene sentido aria-invalid.
   * @param {Element} elemento
   * @returns {boolean}
   */
  function esControlDeFormulario(elemento) {
    return elemento.tagName === "INPUT" || elemento.tagName === "SELECT";
  }

  /**
   * Elemento sobre el cual se aplica la clase de estado.
   * Para grupos (radio/checkbox) el contenedor es #grupo_<id>
   * (un fieldset); para inputs individuales es #<id>.
   * @param {string} id
   * @returns {Element|null}
   */
  function objetivoEstilo(id) {
    return ref(`grupo_${id}`) || ref(id);
  }

  /**
   * Pinta un error de campo: mensaje visible + estado rojo.
   * @param {Element|null} mensajeEl
   * @param {Element|null} objetivo
   * @param {string} mensaje
   */
  function pintarError(mensajeEl, objetivo, mensaje) {
    if (mensajeEl) {
      mensajeEl.textContent = mensaje;
      mensajeEl.classList.remove("hidden");
    }
    if (objetivo) {
      objetivo.classList.add("errorValidacion");
      objetivo.classList.remove("exitoValidacion");
      if (esControlDeFormulario(objetivo)) {
        objetivo.setAttribute("aria-invalid", "true");
      }
    }
  }

  /**
   * Limpia el error de campo: mensaje oculto + verde si ya fue tocado.
   * @param {Element|null} mensajeEl
   * @param {Element|null} objetivo
   * @param {boolean} tocado
   */
  function pintarValido(mensajeEl, objetivo, tocado) {
    if (mensajeEl) {
      mensajeEl.textContent = "";
      mensajeEl.classList.add("hidden");
    }
    if (!objetivo) return;
    objetivo.classList.remove("errorValidacion");
    // Los grupos (fieldset) nunca se pintan en verde: al seleccionar
    // una opcion solo se quita el estado de error y el mensaje.
    if (objetivo.tagName === "FIELDSET") {
      objetivo.classList.remove("exitoValidacion");
      return;
    }
    // Verde en campos individuales solo tras la primera interaccion.
    objetivo.classList.toggle("exitoValidacion", tocado);
    if (esControlDeFormulario(objetivo)) {
      if (tocado) {
        objetivo.setAttribute("aria-invalid", "false");
      } else {
        objetivo.removeAttribute("aria-invalid");
      }
    }
  }

  /**
   * Pinta el resultado de la validacion de un campo.
   * Es el UNICO punto del codigo que muestra/oculta errores de campo,
   * tanto al escribir como al enviar el formulario.
   * @param {string} id - Identificador del campo.
   * @param {string|null} mensaje - Mensaje de error o null si es valido.
   * @param {boolean} [tocado=false] - Indica si el campo ya fue editado.
   */
  function aplicarResultadoCampo(id, mensaje, tocado) {
    const mensajeEl = ref(`mensaje_${id}`);
    const objetivo = objetivoEstilo(id);
    if (mensaje) {
      pintarError(mensajeEl, objetivo, mensaje);
      return;
    }
    pintarValido(mensajeEl, objetivo, Boolean(tocado));
  }

  /**
   * Limpia el estado visual y el mensaje de todos los campos.
   * @param {string[]} ids - Lista de identificadores de campo.
   */
  function limpiarTodosLosResultados(ids) {
    ids.forEach((id) => {
      const mensajeEl = ref(`mensaje_${id}`);
      const objetivo = objetivoEstilo(id);
      if (mensajeEl) {
        mensajeEl.textContent = "";
        mensajeEl.classList.add("hidden");
      }
      if (objetivo) {
        objetivo.classList.remove("errorValidacion", "exitoValidacion");
        objetivo.removeAttribute("aria-invalid");
      }
    });
  }

  /* ==========================================================
   * FOCO AL PRIMER CAMPO CON ERROR
   * ========================================================== */

  /**
   * Devuelve el comportamiento de scroll adecuado segun las
   * preferencias de movimiento del usuario.
   * @returns {"auto"|"smooth"}
   */
  function comportamientoDesplazamiento() {
    const consulta =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    return consulta && consulta.matches ? "auto" : "smooth";
  }

  /**
   * Mueve el foco al primer campo con error (mejora la navegacion
   * por teclado y la experiencia en movil).
   * @param {string} id - Campo a enfocar.
   */
  function enfocarCampo(id) {
    const input = ref(id);
    if (input && typeof input.focus === "function") {
      input.focus({ preventScroll: true });
      input.scrollIntoView({
        block: "center",
        behavior: comportamientoDesplazamiento(),
      });
      return;
    }
    // Grupo de radio/checkbox: enfoca el primer control del grupo.
    const primero = document.querySelector(`input[name="${id}"]`);
    if (primero) {
      primero.focus({ preventScroll: true });
      primero.scrollIntoView({
        block: "center",
        behavior: comportamientoDesplazamiento(),
      });
    }
  }

  /* ==========================================================
   * INDICADOR DE FORTALEZA DE CONTRASENA
   * ========================================================== */

  /**
   * Actualiza la barra y la etiqueta de fortaleza.
   * Se aplica/desaplica la clase .nivel-N (el ancho y el color
   * estan definidos en CSS, sin estilos inline).
   * @param {{nivel: number, etiqueta: string}} resultado - De Validators.evaluarFortaleza.
   */
  function actualizarFortaleza(resultado) {
    const contenedor = ref("fortaleza_pass");
    const barra = ref("fortaleza_barra");
    const texto = ref("fortaleza_texto");
    if (!contenedor || !barra || !texto) return;

    barra.classList.remove("nivel-1", "nivel-2", "nivel-3");
    if (!resultado || resultado.nivel === 0) {
      contenedor.classList.add("hidden");
      texto.textContent = "";
      return;
    }
    contenedor.classList.remove("hidden");
    barra.classList.add(`nivel-${resultado.nivel}`);
    texto.textContent = `Fortaleza: ${resultado.etiqueta}`;
  }

  /**
   * Oculta el indicador de fortaleza (tras resetear el formulario).
   */
  function ocultarFortaleza() {
    actualizarFortaleza({ nivel: 0, etiqueta: "" });
  }

  /* ==========================================================
   * MENSAJE DE EXITO
   * ========================================================== */
  let temporizadorExito = null;

  /**
   * Muestra el mensaje de exito y lo oculta automaticamente.
   * Se limpia el temporizador previo para evitar timers duplicados.
   * @param {number} duracionMs - Duracion en milisegundos.
   */
  function mostrarExito(duracionMs) {
    const mensajeEl = ref("mensaje_exito_form");
    if (!mensajeEl) return;
    if (temporizadorExito) clearTimeout(temporizadorExito);
    mensajeEl.classList.remove("hidden");
    temporizadorExito = setTimeout(() => {
      mensajeEl.classList.add("hidden");
      temporizadorExito = null;
    }, duracionMs);
  }

  /* ==========================================================
   * SCROLLBAR AUTO-OCULTA
   * La barra ocupa su espacio siempre, pero solo se muestra
   * mientras el contenedor se esta desplazando.
   * ========================================================== */
  const RETARDO_OCULTAR_BARRA_MS = 800;
  const contenedoresInicializados = new WeakSet();

  /**
   * Activa el auto-ocultado de la barra en un contenedor con scroll.
   * Sin JavaScript, el CSS deja la barra visible y arrastrable.
   * @param {Element|null} elemento - Contenedor desplazable.
   */
  function iniciarScrollAutoOculto(elemento) {
    if (!elemento || contenedoresInicializados.has(elemento)) return;
    contenedoresInicializados.add(elemento);
    elemento.classList.add("scroll-auto-hide");

    let temporizador = null;
    elemento.addEventListener(
      "scroll",
      () => {
        elemento.classList.add("is-scrolling");
        if (temporizador) clearTimeout(temporizador);
        temporizador = setTimeout(() => {
          elemento.classList.remove("is-scrolling");
          temporizador = null;
        }, RETARDO_OCULTAR_BARRA_MS);
      },
      { passive: true },
    );
  }

  /* ==========================================================
   * NAMESPACE PUBLICO
   * ========================================================== */
  global.FormUI = Object.freeze({
    ref,
    invalidarCache,
    aplicarResultadoCampo,
    limpiarTodosLosResultados,
    enfocarCampo,
    actualizarFortaleza,
    ocultarFortaleza,
    mostrarExito,
    iniciarScrollAutoOculto,
  });
})(typeof window !== "undefined" ? window : globalThis);
