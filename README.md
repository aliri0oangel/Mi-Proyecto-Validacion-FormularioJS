# Formulario de Registro con Validación Completa

Formulario de registro para academia en línea, construido con **HTML + Tailwind CSS + JavaScript vanilla** (sin librerías de validación, sin bundler). Valida los 15 campos/ grupos del formulario tanto en tiempo real (al escribir) como al enviarlo.

## Cómo ejecutarlo

Es un proyecto **100% estático**: basta abrir `form.html` en el navegador, o servirlo con cualquier servidor estático (Live Server, GitHub Pages, `npx serve`).

```bash
# Opcional: herramientas de desarrollo (Node.js requerido)
npm install        # ESLint + Tailwind CLI (solo para desarrollo)
npm run lint       # análisis de código (reglas Clean Code)
npm run build:css  # regenera tailwind.css desde tailwind.input.css
```

> `tailwind.css` ya viene compilado y versionado en el repo. Solo hay que regenerarlo si cambian las clases de Tailwind usadas en `form.html`.

---

## Fase 1 — Auditoría del código base (errores encontrados)

### Errores heredados del prototipo inicial

| # | Error | Por qué era un problema | Corrección |
|---|---|---|---|
| 1 | Se usaba `error.push(...)` cuando el array se llamaba `errors` | `ReferenceError` en tiempo de ejecución: la validación de errores jamás funcionaba | Se unificó el nombre del array en todo el flujo |
| 2 | Regex de nombre con `/s` suelto: `/^[a-zA-ZñÑáÁéÉíÍóÓúÚ/s']{4,16}$/i` | La barra `/` cortaba el patrón y `s` se interpretaba como carácter literal: rechazaba espacios y validaba mal | Se corrigió a `\s` (clase de espacios) |
| 3 | La validación estaba **hardcodeada** (valores fijos en el código, resultados solo en `console.log`) | No leía nada de lo que escribía el usuario; el formulario no estaba conectado a la lógica | Se lee cada valor desde el DOM en `leerValores()` y todo se pinta en pantalla |
| 4 | Varios mensajes de error **no correspondían al campo** validado (p. ej. mensaje de correo al validar teléfono) | El usuario recibía instrucciones equivocadas y no podía corregir su dato | Cada validador genera su propio mensaje junto a su regla (`validators.js`) |

### Defectos encontrados en la versión funcional previa a esta reestructuración

| # | Defecto | Impacto | Corrección |
|---|---|---|---|
| 5 | Dirección aceptaba desde 5 caracteres (el enunciado exige 10) | Regla incumplida | Regex `{10,150}` |
| 6 | Solo 4 países (mínimo 8 requeridos) | Regla incumplida | 9 países disponibles |
| 7 | No se validaba el **máximo de 3 áreas de interés** | Usuario podía marcar las 5 | `validarGrupoInteres()` valida rango 1–3 |
| 8 | Opciones desalineadas con el enunciado ("Otro" en vez de "Prefiero no decir", "Virtual/Mixto" en vez de "Online/Híbrida", "Robotica" en vez de "Diseño UI-UX / Bases de datos") | Requisitos no cumplidos | Opciones renombradas/alineadas |
| 9 | Al enviar, los mensajes individuales de campos **ya corregidos no se limpiaban** | Estados obsoletos en pantalla | Todo resultado pasa por `FormUI.aplicarResultadoCampo()` |
| 10 | Los errores se insertaban con `innerHTML` | Mala práctica de seguridad (riesgo de XSS si un mensaje llegara a contener datos del usuario) | Uso de `textContent` en todo el proyecto |
| 11 | Se validaba con `keyup`, que no detecta pegado con menú contextual ni autocompletado del navegador | Campos que no se validaban al pegar contenido | Evento `input` |
| 12 | Estilos de estado en línea (`style.borderColor`) y clases CSS `.errorValidacion` / `.exitoValidacion` definidas pero **nunca usadas** | CSS duplicado, campos válidos nunca se marcaban en verde (requisito Fase 4) | Estados 100 % por clases CSS |
| 13 | El archivo `errores_encontrados.md` solo documentaba 2 de los 4+ errores exigidos y estaba oculto en comentarios HTML | Fase 1 del enunciado incompleta | Todo consolidado en este README |

---

## Arquitectura (3 archivos, sin bundler)

Separación por capas, cargadas en este orden (cada archivo expone un único namespace global):

| Archivo | Capa | Responsabilidad |
|---|---|---|
| `validators.js` | **Lógica pura** | Constantes, regex y validadores. **No tocan el DOM.** Contrato: `(valor) => string \| null` |
| `form_ui.js` | **Presentación** | Pinta resultados: mensajes por campo, estados rojo/verde, indicador de fortaleza, mensaje de éxito |
| `validacion_form.js` | **Orquestación** | Config declarativa de campos, registro de listeners (con delegación para grupos) y manejo del `submit` |

Ventajas: los validadores son funciones puras y reutilizables; agregar un campo nuevo = agregar una entrada al array `CAMPOS`; la UI y las reglas evolucionan por separado.

## Diseño visual y experiencia

Dirección **«aurora pastel»**: fondo claro con manchas lavanda, menta, cielo y durazno; tarjeta blanca translúcida con desenfoque suave; tinta azul grisácea y acentos pastel solo en decoración y chips.

- **Tarjeta glass**: un único `backdrop-filter` sobre `#formulario`; si el navegador no lo soporta, el CSS aplica un fondo casi opaco. No se usan imágenes, fuentes externas ni elementos HTML nuevos.
- **Formulario fijo con scroll interno**: el documento no se desplaza (`body { overflow: hidden }`); solo la tarjeta lo hace (`max-height: calc(100dvh - 2rem)` y `overflow-y: auto`). Se reserva el espacio de la barra con `scrollbar-gutter` para evitar saltos de layout.
- **Scrollbar auto-oculta**: en reposo el thumb es transparente; al desplazarse aparece y se oculta 800 ms después del último movimiento. La clase `scroll-auto-hide` la activa desde JavaScript; si el script no se ejecuta, la barra queda visible y se puede arrastrar.
- **Estados visuales**: inputs/select con borde visible, foco con `outline` de 3 px, error en rosa/rojo accesible y válido en verde; los grupos de radio/checkbox se presentan como chips con estado seleccionado en lavanda.
- **Accesibilidad**: contraste AA en textos, errores, éxito, botón y bordes; soporte de `prefers-reduced-motion`, `prefers-contrast: more`, `prefers-reduced-transparency` y `forced-colors`. La barra se mantiene visible en alto contraste. El foco al primer error usa scroll suave solo si el usuario no prefiere movimiento reducido.
- **Rendimiento**: gradientes estáticos, sin animar `filter`, `box-shadow` ni `backdrop-filter`; el blur se aplica una sola vez sobre la tarjeta y no dentro de cada control.

## Reglas de validación

| Campo | Regla |
|---|---|
| Nombre / Apellido | Obligatorio, 3–20 letras (con acentos) y espacios |
| Cédula | Obligatorio, 6–9 dígitos, prefijo opcional `V-` / `E-` |
| Fecha de nacimiento | Obligatoria, real, no futura, mínimo 16 años |
| Correo | Obligatorio, formato `algo@dominio.tld` |
| Teléfono | Obligatorio, `+58` + 9–10 dígitos |
| Dirección | Obligatoria, 10–150 caracteres válidos |
| Ciudad | Obligatoria, solo letras y espacios |
| País | Selección obligatoria (9 opciones) |
| Género | Un radio obligatorio: Masculino / Femenino / Prefiero no decir |
| Modalidad | Un radio obligatorio: Online / Presencial / Híbrida |
| Áreas de interés | Entre 1 y 3 checkboxes |
| Contraseña | Obligatoria, 8–50 caracteres con mayúscula, minúscula, número y especial |
| Confirmar contraseña | Obligatoria, debe coincidir con la contraseña |
| Términos y condiciones | Checkbox obligatorio |

Puntos extra implementados: validación en tiempo real (`blur` + `input`) e **indicador de fortaleza de contraseña**.

---

## Rendimiento

- **Tailwind precompilado** (`tailwind.css`, ~6.6 KB minificado) en lugar del CDN `@tailwindcss/browser`, que compilaba CSS en el navegador en cada carga (parpadeo de estilo + JS extra en runtime).
- **Caché de referencias DOM** (`Map` en `form_ui.js`): cada elemento se consulta una sola vez.
- **Delegación de eventos**: un solo listener `change` en el formulario para los 3 grupos de radio/checkbox.
- Manipulación por clases CSS (sin `innerHTML` ni estilos en línea) → menos reflows.

## Seguridad

- **La validación del cliente NO es seguridad**: cualquier backend debe volver a validar todos los campos antes de persistir o procesar datos. Este frontend es la primera línea de UX, no la última de defensa.
- **CSP estricta** (`<meta http-equiv="Content-Security-Policy">`): `default-src 'none'`, scripts y estilos solo del mismo origen; sin `unsafe-inline` (posible porque no hay estilos ni scripts en línea).
- **Sin CDN en runtime**: se elimina la superficie de dependencia externa (supply chain) de `cdn.jsdelivr.net`.
- `textContent` en lugar de `innerHTML` para cualquier dato mostrado.
- Sin `console.log` (regla `no-console` de ESLint) → no se filtran valores (nunca la contraseña) a la consola.
- `autocomplete="new-password"` en las contraseñas y `maxlength` coherente con cada regex.

> Nota de herramientas: `npm audit` reporta vulnerabilidades *high* en `braces`, una dependencia **solo de desarrollo** del CLI de Tailwind (`@parcel/watcher`). No se incluye en el sitio estático publicado y no tiene fix disponible aún; se revisará en actualizaciones futuras.

## Código y accesibilidad

- `npm run lint` con ESLint 10: `eqeqeq`, `no-var`, `prefer-const`, `no-console`, `no-implicit-globals`, `consistent-return`, límites de complejidad y tamaño de función.
- Accesibilidad: `fieldset`/`legend` en grupos, `aria-invalid`, `aria-describedby`, `role="status"` en fortaleza y éxito, foco al primer campo con error, `:focus-visible` de alto contraste, objetivos táctiles de 44 px y `novalidate` para unificar los mensajes en el diseño.
- Responsive verificado de 320 px a 1920 px sin scroll horizontal, con la página fija y el scroll dentro de la tarjeta. La barra de scroll se oculta en reposo y reaparece al desplazarse; en `forced-colors` y `prefers-contrast: more` permanece visible.
