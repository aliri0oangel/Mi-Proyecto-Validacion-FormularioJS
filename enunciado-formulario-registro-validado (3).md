# Proyecto: Formulario de Registro con Validación Completa

**Tecnologías:** HTML, Tailwind CSS (CDN), JavaScript (Vanilla)
**Modalidad:** Individual
**Entrega:** Repositorio en GitHub + despliegue opcional en GitHub Pages

---

## Contexto

Una academia en línea necesita un formulario de registro para sus nuevos estudiantes. El equipo de desarrollo dejó un prototipo inicial a medio terminar: tiene un formulario básico y una lógica de validación escrita en JavaScript, **pero la lógica no está conectada al formulario** — los valores están escritos directamente en el código ("hardcodeados") y el resultado solo se imprime en la consola.

Tu misión es tomar ese prototipo, **corregirlo, conectarlo y ampliarlo** hasta convertirlo en un formulario de registro profesional y completamente validado.

Se te entregará el código base del prototipo junto con este enunciado.

---

## Fase 1 — Auditoría del código base

Antes de agregar funcionalidades, debes revisar el código que heredaste. El prototipo contiene **al menos 4 errores o malas prácticas**. Encuéntralos, corrígelos y documéntalos en el README de tu repositorio (qué error era, por qué era un problema y cómo lo corregiste).

Pistas de lo que debes revisar:

- ¿Todos los mensajes de error corresponden al campo que se está validando?
- ¿Todas las variables usadas existen y están bien escritas?
- ¿Los `label` están correctamente asociados a sus `input`? (atributos `for`, `id` y `name`)
- ¿La validación realmente lee lo que el usuario escribe en el formulario?

---

## Fase 2 — Conexión de la lógica con el formulario

La validación debe ejecutarse **al enviar el formulario**, leyendo los valores reales de los inputs. Requisitos:

1. Capturar el evento `submit` del formulario y prevenir el comportamiento por defecto con `preventDefault()`.
2. Leer el valor de cada campo desde el DOM (no debe quedar ningún valor hardcodeado).
3. Si hay errores, mostrarlos **todos en pantalla** (no en la consola), en una lista visible cerca del formulario, indicando de forma detallada qué campo falló y por qué.
4. Si todo es válido, mostrar en pantalla el mensaje **"✅ Envío exitoso"** y limpiar el formulario.
5. Los mensajes de error deben desaparecer y recalcularse en cada nuevo intento de envío.

---

## Fase 3 — Nuevos campos y sus validaciones

Amplía el formulario con los siguientes campos. **Todos son obligatorios y todos deben validarse.**

### Campos de texto

| Campo | Tipo de input | Regla de validación |
|---|---|---|
| Cédula | `text` | Solo dígitos, entre 6 y 9 caracteres. Opcional: permitir prefijo `V-` o `E-`. |
| Fecha de nacimiento | `date` | Fecha válida, no futura, y el usuario debe tener **mínimo 16 años**. |
| Dirección | `text` | Mínimo 10 caracteres. |
| Ciudad | `text` | Solo letras y espacios (puedes reutilizar el regex de nombre). |

### Campo de selección

| Campo | Tipo de input | Regla de validación |
|---|---|---|
| País | `select` | Debe seleccionarse una opción distinta a la opción por defecto ("Seleccione un país"). Incluye al menos 8 países. |

### Inputs radiales (radio)

| Campo | Opciones | Regla de validación |
|---|---|---|
| Género | Masculino / Femenino / Prefiero no decir | Debe haber exactamente una opción seleccionada. |
| Modalidad de estudio | Online / Presencial / Híbrida | Debe haber exactamente una opción seleccionada. |

### Checkboxes

| Campo | Opciones | Regla de validación |
|---|---|---|
| Áreas de interés | Frontend / Backend / Diseño UI-UX / Inteligencia Artificial / Bases de datos | Debe seleccionar **mínimo 1 y máximo 3**. |
| Términos y condiciones | "Acepto los términos y condiciones" | Debe estar marcado obligatoriamente. |

### Campo adicional de contraseña

| Campo | Tipo de input | Regla de validación |
|---|---|---|
| Confirmar contraseña | `password` | Debe coincidir exactamente con el campo Contraseña. |

Los campos originales (nombre, apellido, correo, teléfono, contraseña) conservan sus validaciones con expresiones regulares, ya corregidas en la Fase 1..


---

## Fase 4 — Experiencia de usuario y presentación

1. **Mensajes detallados:** cada error debe decir claramente qué campo falló y qué regla incumplió. Ejemplo: *"La cédula no es válida: debe contener solo números y tener entre 6 y 9 dígitos"*. Mensajes genéricos como "campo inválido" restan puntos.
2. **Resaltado visual:** los campos con error deben marcarse visualmente (por ejemplo, borde rojo con Tailwind: `border-red-500`). Los campos válidos pueden marcarse en verde.
3. **Diseño con Tailwind:** el formulario debe verse ordenado y profesional — espaciados coherentes, labels visibles, botón de envío destacado y diseño responsive (usable en móvil).
4. **Mensaje de éxito:** visible, destacado y en pantalla (no `alert()` ni `console.log`).

---

## Restricciones técnicas

- ❌ No se permite usar librerías de validación (solo JavaScript puro).
- ❌ No se permite el atributo `required` de HTML como único mecanismo de validación — toda regla debe estar implementada también en JavaScript.
- ✅ Se permite (y se valora) organizar la lógica en funciones reutilizables, por ejemplo: `validarCedula(valor)`, `validarEdad(fecha)`, `mostrarErrores(lista)`.
- ✅ El código debe estar comentado en las secciones clave.

---

## Puntos extra (opcionales)

- ⭐ Validación en tiempo real: mostrar el error de un campo al perder el foco (`blur`), sin esperar al envío.
- ⭐ Indicador de fortaleza de contraseña (débil / media / fuerte) mientras el usuario escribe.
- ⭐ Contador de caracteres en el campo Dirección.
