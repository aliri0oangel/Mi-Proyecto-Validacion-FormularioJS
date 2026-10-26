/**
 * ============================================================
 * validacion_form.js - Capa de ORQUESTRACION (wiring)
 * ============================================================
 * Responsabilidad: conectar la logica pura (Validators) con el
 * DOM del formulario (FormUI):
 *   - Definir el listado declarativo de campos y su regla
 *   - Registrar los listeners (input/change con delegacion)
 *   - Manejar el envio del formulario (submit)
 *
 * Orden de carga: validators.js -> form_ui.js -> validacion_form.js
 * ============================================================
 */
(function () {
  "use strict";

  /* Referencia al formulario; se inicializa en init(). */
  let formulario = null;

  /* Campos ya editados por el usuario (para pintar en verde solo
   * despues de la primera interaccion, no en campos vacios). */
  const camposTocados = new Set();

  /* Eventos por defecto para inputs de texto: "input" cubre pegado,
   * autocompletado del navegador y dictado (a diferencia de "keyup"). */
  const EVENTOS_POR_DEFECTO = ["input", "blur"];

  /* ==========================================================
   * 1. LECTURA DEL FORMULARIO
   * Extrae todos los valores del DOM en un unico objeto plano.
   * Los validadores consumen este objeto, no el DOM directamente.
   * ========================================================== */

  /**
   * @param {string} name - Nombre del grupo de radios.
   * @returns {string} Valor del radio marcado o "" si no hay ninguno.
   */
  function valorRadio(name) {
    const marcado = formulario.querySelector(`input[name="${name}"]:checked`);
    return marcado ? marcado.value : "";
  }

  /**
   * @param {string} name - Nombre del grupo de checkboxes.
   * @returns {string[]} Valores de los checkboxes marcados.
   */
  function valoresCheckbox(name) {
    return Array.from(
      formulario.querySelectorAll(`input[name="${name}"]:checked`),
    ).map((elemento) => elemento.value);
  }

  /**
   * @returns {Object} Instantanea de todos los valores del formulario.
   */
  function leerValores() {
    return {
      nombre: formulario.elements.nombre.value.trim(),
      apellido: formulario.elements.apellido.value.trim(),
      cedula: formulario.elements.cedula.value.trim(),
      nacimiento: formulario.elements.nacimiento.value,
      correo: formulario.elements.correo.value.trim(),
      telefono: formulario.elements.telefono.value.trim(),
      direccion: formulario.elements.direccion.value.trim(),
      ciudad: formulario.elements.ciudad.value.trim(),
      pais: formulario.elements.pais.value,
      genero: valorRadio("genero"),
      modalidad: valorRadio("modalidad"),
      interes: valoresCheckbox("interes"),
      pass: formulario.elements.pass.value,
      pass2: formulario.elements.pass2.value,
      terminos: formulario.elements.terminos.checked,
    };
  }

  /* ==========================================================
   * 2. CONFIGURACION DECLARATIVA DE CAMPOS
   * Cada entrada declara: id del campo, su regla de validacion y
   * (opcionalmente) el selector de un grupo. Esto elimina la
   * duplicacion de bloques de listeners y de envio.
   * ========================================================== */
  const CAMPOS = [
    {
      id: "nombre",
      validar: (v) => Validators.validarNombre(v.nombre),
    },
    {
      id: "apellido",
      validar: (v) => Validators.validarApellido(v.apellido),
    },
    {
      id: "cedula",
      validar: (v) => Validators.validarCedula(v.cedula),
    },
    {
      id: "nacimiento",
      eventos: ["change"],
      validar: (v) => Validators.validarNacimiento(v.nacimiento),
    },
    {
      id: "correo",
      validar: (v) => Validators.validarCorreo(v.correo),
    },
    {
      id: "telefono",
      validar: (v) => Validators.validarTelefono(v.telefono),
    },
    {
      id: "direccion",
      validar: (v) => Validators.validarDireccion(v.direccion),
    },
    {
      id: "ciudad",
      validar: (v) => Validators.validarCiudad(v.ciudad),
    },
    {
      id: "pais",
      eventos: ["change"],
      validar: (v) => Validators.validarSelect(v.pais),
    },
    {
      // Grupo de radios: se escucha en el formulario (delegacion).
      id: "genero",
      grupo: 'input[name="genero"]',
      validar: (v) => Validators.validarRadio(v.genero),
    },
    {
      id: "modalidad",
      grupo: 'input[name="modalidad"]',
      validar: (v) => Validators.validarRadio(v.modalidad),
    },
    {
      id: "interes",
      grupo: 'input[name="interes"]',
      validar: (v) => Validators.validarGrupoInteres(v.interes),
    },
    {
      id: "pass",
      validar: (v) => Validators.validarPassword(v.pass),
    },
    {
      id: "pass2",
      validar: (v) => Validators.validarPassword2(v.pass, v.pass2),
    },
    {
      id: "terminos",
      eventos: ["change"],
      validar: (v) => Validators.validarCheckbox(v.terminos),
    },
  ];

  /* ==========================================================
   * 3. CICLO DE VALIDACION
   * ========================================================== */

  /**
   * Valida un campo y pinta el resultado en pantalla.
   * @param {Object} campo - Entrada de CAMPOS.
   * @param {Object} valores - Instantanea de leerValores().
   * @returns {string|null} Mensaje de error o null.
   */
  function validarYAplicar(campo, valores) {
    const error = campo.validar(valores);
    camposTocados.add(campo.id);
    FormUI.aplicarResultadoCampo(campo.id, error, true);
    return error;
  }

  /**
   * Manejador para eventos de un campo (input/blur/change).
   * @param {Object} campo - Entrada de CAMPOS.
   */
  function manejarEventoCampo(campo) {
    const valores = leerValores();
    validarYAplicar(campo, valores);
    // La confirmacion depende de la contrasena: si cambia pass,
    // se revalida pass2 para no dejar un estado obsoleto.
    if (campo.id === "pass") {
      const campoPass2 = CAMPOS.find((item) => item.id === "pass2");
      FormUI.actualizarFortaleza(Validators.evaluarFortaleza(valores.pass));
      if (camposTocados.has("pass2") && campoPass2) {
        validarYAplicar(campoPass2, valores);
      }
    }
  }

  /* ==========================================================
   * 4. REGISTRO DE LISTENERS
   * ========================================================== */

  /**
   * Asocia los eventos de cada campo declarado en CAMPOS.
   */
  function registrarListeners() {
    CAMPOS.forEach((campo) => {
      const elemento = document.getElementById(campo.id);
      // Los grupos (radio/checkbox) se manejan por delegacion abajo.
      if (!elemento || campo.grupo) return;
      const eventos = campo.eventos || EVENTOS_POR_DEFECTO;
      eventos.forEach((evento) => {
        elemento.addEventListener(evento, () => manejarEventoCampo(campo));
      });
    });

    // Delegacion: un solo listener por evento en el formulario para
    // todos los grupos de radios y checkboxes.
    formulario.addEventListener("change", (evento) => {
      const campo = CAMPOS.find(
        (item) => item.grupo && evento.target.matches(item.grupo),
      );
      if (campo) manejarEventoCampo(campo);
    });
  }

  /* ==========================================================
   * 5. ENVIO DEL FORMULARIO
   * ========================================================== */

  /**
   * Valida TODOS los campos y pinta cada resultado (limpiando los que
   * ahora son correctos). Si hay errores, enfoca el primer campo
   * invalido; si no, resetea y muestra el mensaje de exito.
   * @param {SubmitEvent} evento
   */
  function manejarEnvio(evento) {
    evento.preventDefault();

    const valores = leerValores();
    // Un unico barrido: se calcula y se pinta el resultado de cada campo.
    const resultados = CAMPOS.map((campo) => ({
      id: campo.id,
      mensaje: validarYAplicar(campo, valores),
    }));
    const errores = resultados.filter((resultado) => resultado.mensaje);

    if (errores.length === 0) {
      reiniciarFormulario();
      FormUI.mostrarExito(4000);
      return;
    }

    // Enfoca el primer campo con error para guiar al usuario.
    FormUI.enfocarCampo(errores[0].id);
  }

  /**
   * Limpia el formulario y todo el estado visual asociado.
   */
  function reiniciarFormulario() {
    formulario.reset();
    camposTocados.clear();
    FormUI.limpiarTodosLosResultados(CAMPOS.map((campo) => campo.id));
    FormUI.ocultarFortaleza();
  }

  /* ==========================================================
   * 6. INICIO
   * ========================================================== */
  function init() {
    formulario = document.getElementById("formulario");
    if (!formulario) return;
    registrarListeners();
    formulario.addEventListener("submit", manejarEnvio);
    FormUI.iniciarScrollAutoOculto(formulario);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
