document.addEventListener("DOMContentLoaded", () => {
  const regexs = {
    nombre: /^[a-zA-ZñÑáÁéÉíÍóÓúÚ\s']{3,20}$/i,
    correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
    cedula: /^[vVeE][0-9]{6,9}$/,
    telefono: /^\+58\d{9,10}$/,
    direccion: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-#\/ºª]{5,150}$/,
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,50}$/,
  };

  const formulario = document.getElementById("formulario");

  const inputNombre = document.getElementById("nombre");
  const inputApellido = document.getElementById("apellido");
  const inputCedula = document.getElementById("cedula");
  const inputNacimiento = document.getElementById("nacimiento");
  const inputCorreo = document.getElementById("correo");
  const inputTelefono = document.getElementById("telefono");
  const inputDireccion = document.getElementById("direccion");
  const inputCiudad = document.getElementById("ciudad");
  const inputPais = document.getElementById("pais");
  const inputContra = document.getElementById("pass");
  const inputContra2 = document.getElementById("pass2");
  const checkboxTermino = document.getElementById("terminos");

  const mostrarErrorCampo = (id, mensaje) => {
    const input = document.getElementById(id);
    const msg = document.getElementById(`mensaje_${id}`);
    if (input) input.style.borderColor = "#d46a6a";
    if (msg) {
      msg.textContent = mensaje;
      msg.classList.remove("hidden");
    }
  };

  const ocultarErrorCampo = (id) => {
    const input = document.getElementById(id);
    const msg = document.getElementById(`mensaje_${id}`);
    if (input) input.style.borderColor = "";
    if (msg) {
      msg.textContent = "";
      msg.classList.add("hidden");
    }
  };

  const validarCampoTexto = (valor, campo, regex) => {
    if (valor === "") return `El campo ${campo} es obligatorio.`;
    if (!regex.test(valor)) return `El campo ${campo} es inválido.`;
    return null;
  };

  const validarCedula = (valor) => {
    if (valor === "") return "La cédula es obligatoria.";
    if (!regexs.cedula.test(valor))
      return "La cédula debe iniciar con V o E y tener entre 6 y 9 dígitos.";
    return null;
  };

  const validarCorreo = (valor) => {
    if (valor === "") return "El correo es obligatorio.";
    if (!regexs.correo.test(valor))
      return "El correo debe ser válido y contener @.";
    return null;
  };

  const validarTelefono = (valor) => {
    if (valor === "") return "El teléfono es obligatorio.";
    if (!regexs.telefono.test(valor))
      return "El teléfono debe empezar con +58 y tener entre 9 y 10 números.";
    return null;
  };

  const validarPassword = (valor) => {
    if (valor === "") return "La contraseña es obligatoria.";
    if (!regexs.password.test(valor))
      return "La contraseña debe tener entre 8 y 50 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.";
    return null;
  };

  const validarPassword2 = (pass1, pass2) => {
    if (pass2 === "") return "Confirma tu contraseña.";
    if (pass2 !== pass1) return "Las contraseñas no coinciden.";
    return null;
  };

  const validarNacimiento = (valor) => {
    if (valor === "") return "La fecha de nacimiento es obligatoria.";
    const fechaNac = new Date(valor);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaNac > hoy) return "La fecha de nacimiento no puede ser futura.";
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();
    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())
    ) {
      edad--;
    }
    if (edad < 16)
      return `Debe tener mínimo 16 años (actualmente tienes ${edad}).`;
    return null;
  };

  const validarSelect = (valor) => {
    if (valor === "") return "Debe seleccionar una opción.";
    return null;
  };

  const validarRadio = (nombre) => {
    if (!document.querySelector(`input[name="${nombre}"]:checked`))
      return "Debe seleccionar una opción.";
    return null;
  };

  const validarCheckboxGroup = (nombre) => {
    if (
      document.querySelectorAll(`input[name="${nombre}"]:checked`).length === 0
    )
      return "Debe seleccionar al menos una opción.";
    return null;
  };

  const validarCheckbox = (input) => {
    if (!input.checked) return "Debe aceptar los términos y condiciones.";
    return null;
  };

  const configurarValidacion = (input, id, funcionValidacion) => {
    input.addEventListener("blur", () => {
      const valor = input.value.trim ? input.value.trim() : input.value;
      const error = funcionValidacion(valor);
      if (error) mostrarErrorCampo(id, error);
      else ocultarErrorCampo(id);
    });
    input.addEventListener("keyup", () => {
      const valor = input.value.trim();
      const error = funcionValidacion(valor);
      if (error) mostrarErrorCampo(id, error);
      else ocultarErrorCampo(id);
    });
  };

  configurarValidacion(inputNombre, "nombre", (valor) =>
    validarCampoTexto(valor, "nombre", regexs.nombre),
  );
  configurarValidacion(inputApellido, "apellido", (valor) =>
    validarCampoTexto(valor, "apellido", regexs.nombre),
  );
  configurarValidacion(inputCedula, "cedula", validarCedula);
  configurarValidacion(inputCorreo, "correo", validarCorreo);
  configurarValidacion(inputTelefono, "telefono", validarTelefono);
  configurarValidacion(inputDireccion, "direccion", (valor) =>
    validarCampoTexto(valor, "dirección", regexs.direccion),
  );
  configurarValidacion(inputCiudad, "ciudad", (valor) =>
    validarCampoTexto(valor, "ciudad", regexs.nombre),
  );
  configurarValidacion(inputContra, "pass", validarPassword);
  configurarValidacion(inputContra2, "pass2", (valor) =>
    validarPassword2(inputContra.value, valor),
  );

  inputNacimiento.addEventListener("change", () => {
    const error = validarNacimiento(inputNacimiento.value);
    if (error) mostrarErrorCampo("nacimiento", error);
    else ocultarErrorCampo("nacimiento");
  });

  inputPais.addEventListener("change", () => {
    const error = validarSelect(inputPais.value);
    if (error) mostrarErrorCampo("pais", error);
    else ocultarErrorCampo("pais");
  });

  checkboxTermino.addEventListener("change", () => {
    const error = validarCheckbox(checkboxTermino);
    if (error) mostrarErrorCampo("terminos", error);
    else ocultarErrorCampo("terminos");
  });

  document.querySelectorAll('input[name="genero"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const error = validarRadio("genero");
      if (error) mostrarErrorCampo("genero", error);
      else ocultarErrorCampo("genero");
    });
  });

  document.querySelectorAll('input[name="modalidad"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const error = validarRadio("modalidad");
      if (error) mostrarErrorCampo("modalidad", error);
      else ocultarErrorCampo("modalidad");
    });
  });

  document.querySelectorAll('input[name="interes"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const error = validarCheckboxGroup("interes");
      if (error) mostrarErrorCampo("interes", error);
      else ocultarErrorCampo("interes");
    });
  });

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const errores = [];

    const nombreValor = inputNombre.value.trim();
    const apellidoValor = inputApellido.value.trim();
    const ciudadValor = inputCiudad.value.trim();
    const direccionValor = inputDireccion.value.trim();
    const cedulaValor = inputCedula.value.trim();
    const correoValor = inputCorreo.value.trim();
    const tlfValor = inputTelefono.value.trim();

    let error;

    error = validarCampoTexto(nombreValor, "nombre", regexs.nombre);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("nombre", error);
    }

    error = validarCampoTexto(apellidoValor, "apellido", regexs.nombre);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("apellido", error);
    }

    error = validarCedula(cedulaValor);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("cedula", error);
    }

    error = validarNacimiento(inputNacimiento.value);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("nacimiento", error);
    }

    error = validarCorreo(correoValor);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("correo", error);
    }

    error = validarTelefono(tlfValor);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("telefono", error);
    }

    error = validarCampoTexto(direccionValor, "dirección", regexs.direccion);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("direccion", error);
    }

    error = validarCampoTexto(ciudadValor, "ciudad", regexs.nombre);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("ciudad", error);
    }

    error = validarSelect(inputPais.value);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("pais", error);
    }

    error = validarRadio("genero");
    if (error) {
      errores.push(error);
      mostrarErrorCampo("genero", error);
    }

    error = validarRadio("modalidad");
    if (error) {
      errores.push(error);
      mostrarErrorCampo("modalidad", error);
    }

    error = validarCheckboxGroup("interes");
    if (error) {
      errores.push(error);
      mostrarErrorCampo("interes", error);
    }

    error = validarPassword(inputContra.value);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("pass", error);
    }

    error = validarPassword2(inputContra.value, inputContra2.value);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("pass2", error);
    }

    error = validarCheckbox(checkboxTermino);
    if (error) {
      errores.push(error);
      mostrarErrorCampo("terminos", error);
    }

    let mensajes = document.querySelector("#error_mensajes");
    mensajes.innerHTML = "";
    mensajes.classList.add("hidden");

    if (errores.length === 0) {
      formulario.reset();
      document.getElementById("mensaje_exito_form").classList.remove("hidden");

      setTimeout(() => {
        document.getElementById("mensaje_exito_form").classList.add("hidden");
      }, 4000);
    } else {
      mensajes.classList.remove("hidden");
      errores.forEach((error) => {
        let parrafo = document.createElement("p");
        parrafo.innerHTML = error;
        mensajes.appendChild(parrafo);
      });
    }
  });
});
