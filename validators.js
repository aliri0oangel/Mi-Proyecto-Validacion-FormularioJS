/**
 * ============================================================
 * validators.js - Capa de LOGICA PURA de validacion
 * ============================================================
 * Responsabilidad: definir constantes, expresiones regulares y
 * funciones validadoras que NO tocan el DOM.
 *
 * Contrato de todos los validadores:
 *   (valor) => string | null
 *   - Devuelven un mensaje de error legible para el usuario, o
 *     null si el valor es valido.
 *
 * Orden de carga de los scripts:
 *   1) validators.js   (este archivo)
 *   2) form_ui.js      (presentacion)
 *   3) validacion_form.js (orquestacion / wiring)
 *
 * Al final se expone un unico namespace global: window.Validators
 * ============================================================
 */
(function (global) {
  "use strict";

  /* ==========================================================
   * 1. CONSTANTES DE REGLAS
   * Evitan "magic numbers" repartidos por el codigo.
   * ========================================================== */
  const EDAD_MINIMA = 16;
  const MIN_DIRECCION = 10;
  const MAX_DIRECCION = 150;
  const MIN_INTERESES = 1;
  const MAX_INTERESES = 3;
  const PASS_LONGITUD_MIN = 8;
  const PASS_LONGITUD_MAX = 50;

  /**
   * Tabla de expresiones regulares.
   * Campo        -> patron de validacion
   * Los mensajes asociados viven dentro de cada validador.
   */
  const REGEX = {
    // Letras (con acentos y n) y espacios, entre 3 y 20 caracteres.
    nombre: /^[a-zA-ZñÑáÁéÉíÍóÓúÚ\s']{3,20}$/i,
    // Formato basico de correo con TLD de 3+ letras.
    correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
    // Cedula venezolana: 6-9 digitos, prefijo opcional V-/E-.
    cedula: /^([vVeE]-?)?\d{6,9}$/,
    // Telefono venezolano: +58 seguido de 9 o 10 digitos.
    telefono: /^\+58\d{9,10}$/,
    // Direccion: caracteres comunes de direccion, minimo y maximo de largo.
    // Nota: "/" no necesita escaparse dentro de una clase de caracteres.
    direccion: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-#/ºª]{10,150}$/,
    // Contrasena: 8-50 caracteres con mayuscula, minuscula, digito y especial.
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,50}$/,
  };

  /* ==========================================================
   * 2. UTILIDADES DE FECHA
   * ========================================================== */

  /**
   * Calcula la edad exacta cumplida a partir de una fecha.
   * @param {Date} fechaNacimiento - Fecha de nacimiento.
   * @param {Date} [hoy] - Fecha de referencia (por defecto hoy, normalizada a medianoche).
   * @returns {number} Anios cumplidos.
   */
  function calcularEdad(fechaNacimiento, hoy) {
    const fechaReferencia = hoy || new Date();
    let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = fechaReferencia.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();
    // Si aun no cumple anios en el mes actual, se resta uno.
    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && fechaReferencia.getDate() < fechaNacimiento.getDate())
    ) {
      edad--;
    }
    return edad;
  }

  /**
   * Convierte un valor de input type="date" (YYYY-MM-DD) a un objeto Date
   * en zona horaria local. new Date("YYYY-MM-DD") interpreta UTC y puede
   * desfasar un dia; por eso se arma manualmente.
   * @param {string} valor - Fecha en formato ISO corto.
   * @returns {Date|null} Fecha local valida o null si el valor es invalido.
   */
  function parsearFechaLocal(valor) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (!partes) return null;
    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const fecha = new Date(anio, mes - 1, dia);
    // Verifica que la fecha exista realmente (ej: 2024-02-30 no existe).
    const esValida =
      fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia;
    return esValida ? fecha : null;
  }

  /* ==========================================================
   * 3. VALIDADORES DE CAMPOS DE TEXTO
   * ========================================================== */

  /**
   * Valida un campo de texto obligatorio contra un regex.
   * @param {string} valor - Valor limpio del input.
   * @param {Object} opciones - { campo, regex, mensajeInvalido }.
   * @returns {string|null} Mensaje de error o null si es valido.
   */
  function validarTexto(valor, opciones) {
    const { campo, regex, mensajeInvalido } = opciones;
    if (valor === "") return `El campo ${campo} es obligatorio.`;
    if (!regex.test(valor)) return mensajeInvalido;
    return null;
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarNombre(valor) {
    return validarTexto(valor, {
      campo: "nombre",
      regex: REGEX.nombre,
      mensajeInvalido:
        "El nombre debe tener entre 3 y 20 caracteres y contener solo letras y espacios.",
    });
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarApellido(valor) {
    return validarTexto(valor, {
      campo: "apellido",
      regex: REGEX.nombre,
      mensajeInvalido:
        "El apellido debe tener entre 3 y 20 caracteres y contener solo letras y espacios.",
    });
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarCedula(valor) {
    if (valor === "") return "La cedula es obligatoria.";
    if (!REGEX.cedula.test(valor))
      return "La cedula debe contener entre 6 y 9 digitos, con prefijo opcional V- o E-.";
    return null;
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarCorreo(valor) {
    if (valor === "") return "El correo es obligatorio.";
    if (!REGEX.correo.test(valor))
      return "El correo debe ser valido y contener @ (ejemplo: correo@ejemplo.com).";
    return null;
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarTelefono(valor) {
    if (valor === "") return "El telefono es obligatorio.";
    if (!REGEX.telefono.test(valor))
      return "El telefono debe empezar con +58 y tener entre 9 y 10 numeros (ejemplo: +584141234567).";
    return null;
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarDireccion(valor) {
    return validarTexto(valor, {
      campo: "direccion",
      regex: REGEX.direccion,
      mensajeInvalido: `La direccion debe tener entre ${MIN_DIRECCION} y ${MAX_DIRECCION} caracteres validos.`,
    });
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarCiudad(valor) {
    return validarTexto(valor, {
      campo: "ciudad",
      regex: REGEX.nombre,
      mensajeInvalido: "La ciudad debe contener solo letras y espacios.",
    });
  }

  /* ==========================================================
   * 4. VALIDADORES DE FECHA Y CONTRASENA
   * ========================================================== */

  /**
   * Valida la fecha de nacimiento: obligatoria, real, no futura y
   * con la edad minima requerida.
   * @param {string} valor - Valor del input type="date".
   * @returns {string|null}
   */
  function validarNacimiento(valor) {
    if (valor === "") return "La fecha de nacimiento es obligatoria.";
    const fechaNac = parsearFechaLocal(valor);
    if (!fechaNac) return "La fecha de nacimiento no es valida.";
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaNac > hoy) return "La fecha de nacimiento no puede ser futura.";
    const edad = calcularEdad(fechaNac, hoy);
    if (edad < EDAD_MINIMA)
      return `Debe tener minimo ${EDAD_MINIMA} anios (actualmente tienes ${edad}).`;
    return null;
  }

  /**
   * @param {string} valor
   * @returns {string|null}
   */
  function validarPassword(valor) {
    if (valor === "") return "La contrasena es obligatoria.";
    if (!REGEX.password.test(valor))
      return `La contrasena debe tener entre ${PASS_LONGITUD_MIN} y ${PASS_LONGITUD_MAX} caracteres, con al menos una mayuscula, una minuscula, un numero y un caracter especial.`;
    return null;
  }

  /**
   * Valida que la confirmacion no este vacia y coincida con la contrasena.
   * @param {string} pass1 - Contrasena original.
   * @param {string} pass2 - Confirmacion.
   * @returns {string|null}
   */
  function validarPassword2(pass1, pass2) {
    if (pass2 === "") return "Confirma tu contrasena.";
    if (pass2 !== pass1) return "Las contrasenas no coinciden.";
    return null;
  }

  /**
   * Evalua la fortaleza de la contrasena para el indicador visual.
   * Puntaje 0-6: longitud >=8, longitud >=12, minuscula, mayuscula,
   * digito y caracter especial.
   * @param {string} pass - Contrasena escrita por el usuario.
   * @returns {{puntuacion: number, nivel: number, etiqueta: string}}
   *   nivel: 0 (vacio), 1 (debil), 2 (media), 3 (fuerte).
   */
  function evaluarFortaleza(pass) {
    if (!pass) return { puntuacion: 0, nivel: 0, etiqueta: "" };
    let puntuacion = 0;
    if (pass.length >= PASS_LONGITUD_MIN) puntuacion++;
    if (pass.length >= 12) puntuacion++;
    if (/[a-z]/.test(pass)) puntuacion++;
    if (/[A-Z]/.test(pass)) puntuacion++;
    if (/\d/.test(pass)) puntuacion++;
    if (/[^A-Za-z0-9]/.test(pass)) puntuacion++;

    if (puntuacion <= 2) return { puntuacion, nivel: 1, etiqueta: "Debil" };
    if (puntuacion <= 4) return { puntuacion, nivel: 2, etiqueta: "Media" };
    return { puntuacion, nivel: 3, etiqueta: "Fuerte" };
  }

  /* ==========================================================
   * 5. VALIDADORES DE SELECT, RADIO, CHECKBOX Y GRUPOS
   * Reciben valores ya extraidos del DOM por la capa de orquestacion.
   * ========================================================== */

  /**
   * @param {string} valor - Valor del select ("" = opcion por defecto).
   * @returns {string|null}
   */
  function validarSelect(valor) {
    if (valor === "") return "Debe seleccionar una opcion.";
    return null;
  }

  /**
   * @param {string} valor - Valor del radio marcado ("" = ninguno).
   * @returns {string|null}
   */
  function validarRadio(valor) {
    if (valor === "") return "Debe seleccionar una opcion.";
    return null;
  }

  /**
   * Valida el grupo de areas de interes: minimo 1 y maximo 3 seleccionadas.
   * @param {string[]} valores - Valores de los checkboxes marcados.
   * @returns {string|null}
   */
  function validarGrupoInteres(valores) {
    if (valores.length < MIN_INTERESES)
      return "Debe seleccionar al menos 1 area de interes.";
    if (valores.length > MAX_INTERESES)
      return `Puede seleccionar como maximo ${MAX_INTERESES} areas de interes.`;
    return null;
  }

  /**
   * @param {boolean} marcado - Estado del checkbox de terminos.
   * @returns {string|null}
   */
  function validarCheckbox(marcado) {
    if (!marcado) return "Debe aceptar los terminos y condiciones.";
    return null;
  }

  /* ==========================================================
   * 6. NAMESPACE PUBLICO
   * Unico punto de acceso desde las demas capas.
   * ========================================================== */
  global.Validators = Object.freeze({
    // Constantes utiles para la UI (indicadores, contadores, etc.)
    EDAD_MINIMA,
    MIN_DIRECCION,
    MAX_DIRECCION,
    MIN_INTERESES,
    MAX_INTERESES,
    PASS_LONGITUD_MIN,
    PASS_LONGITUD_MAX,
    REGEX,
    // Utilidades
    calcularEdad,
    parsearFechaLocal,
    evaluarFortaleza,
    // Validadores de texto
    validarTexto,
    validarNombre,
    validarApellido,
    validarCedula,
    validarCorreo,
    validarTelefono,
    validarDireccion,
    validarCiudad,
    // Fecha y contrasena
    validarNacimiento,
    validarPassword,
    validarPassword2,
    // Select / radio / checkbox
    validarSelect,
    validarRadio,
    validarGrupoInteres,
    validarCheckbox,
  });
})(typeof window !== "undefined" ? window : globalThis);
