---
name: airis-design-philosophy
description: Filosofía de diseño, voz y sistema visual de AIRIS (glassmorphism tipo iOS en violetas, Unbounded + Poppins, componentes firma de WhatsApp y de llamadas con IA). Cargar antes de diseñar cualquier pieza visual, video, reel, anuncio, thumbnail o guion de AIRIS, incluidos los de la recepcionista de llamadas, para que todo se vea y suene a la marca.
---

# AIRIS: filosofía de diseño

Fuente: análisis completo de airisautomation.com (`docs/research/analisis-web-airisautomation.md`,
capturas en `docs/reference/web/`) y el reel v1 (`docs/research/analisis-reel-airis-v1.md`).
Assets oficiales en `assets/brand/` (logo-light.svg, favicon.svg, og-image.jpg).

Esta skill define **qué** es AIRIS visualmente. El **cómo animarlo** está en
`airis-motion-graphics` y **lo que está prohibido** en `anti-slop`. Si hay conflicto,
manda `anti-slop`.

## 1. La idea que todo diseño tiene que transmitir

**AIRIS convierte mensajes y llamadas en operaciones terminadas, sin sacarle el control
a las personas.**

Canales de entrada que comunicamos:
- **WhatsApp y chats**: "Un mensaje entra. La operación continúa."
- **Llamadas con IA (recepcionista de voz)**: "Una llamada entra. La operación continúa."
  Investigación completa en `docs/research/recepcionista-llamadas-ia.md`.

Cuatro pilares. Cada pieza tiene que apoyar al menos uno:
1. **Operación, no conversación.** El chat es la interfaz; lo que importa es la acción
   que queda hecha (turno confirmado, lead registrado, reclamo derivado).
2. **Control humano.** La IA ejecuta lo repetible; las personas deciden lo sensible.
3. **Evidencia honesta.** Datos reales con su contexto. Nunca inventar métricas,
   testimonios ni logos de clientes.
4. **Calma operativa.** El resultado emocional es tranquilidad: el consultorio cerró y
   todo sigue en orden.

## 2. Personalidad y voz

- Rioplatense, directa, segura, con humor seco. Tuteo con voseo ("tu consultorio",
  "hablá", "recuperá").
- Frases cortas y afirmativas, con punto final. Una idea por frase.
- Humor de la casa: "RESCATAME", "Construyendo Skynet para PyMEs", "El futuro no espera
  a los que cargan excels", "Hablá con un humano (por ahora)". Usar con dosis: un guiño
  por pieza, nunca en el dato serio.
- Vocabulario propio: AI Operations, handoff humano, operación, workflow, trazable,
  medible, "procesos antes que bots".
- Evitar jerga vacía de IA (ver lista en `anti-slop`).
- En videos y piezas de marketing se le habla al dueño, sin nada técnico. "AI
  Operations", "workflow" o "handoff" son palabras internas: en pantalla se dice qué
  pasa ("te pasa la llamada", "queda anotado en tu agenda").

## 3. Sistema visual

### Tipografía
- **Unbounded** 700 a 900 para titulares. En video: 88 a 128 px sobre 1080 de ancho,
  interlineado 1.05 a 1.12, máximo 3 líneas y unas 6 palabras por línea.
- **Poppins** 400 a 600 para texto de apoyo, UI y subtítulos. Mínimo 30 px en video 9:16.
- Recurso firma: la segunda línea del titular en *itálica*, **mismo color** que la
  primera (la itálica da el énfasis, no el color).
- Texto siempre **centrado** en video.

### Paleta
| Rol | Hex |
|---|---|
| Violeta marca (acción, CTA, glow) | `#7C3AED` |
| Violeta profundo | `#5B21B6`, `#4C1D95` |
| Lavanda (glow suave, bordes) | `#A78BFA`, `#DDD6FE`, `#EDE9FE` |
| Cian dato (barras, estados "en vivo") | `#67E8F9` |
| Noche (fondos oscuros) | `#020618`, `#0A0C1C`, `#171223` |
| Claro (fondos pastel) | `#F8FAFC`, `#EEF2FF` |
| Verde WhatsApp (solo íconos/estados de WhatsApp) | `#25D366` |

Reglas de color:
- Un color de texto por titular (blanco en oscuro, `#171223` en claro).
- El violeta vive en fondos, glow, botones y bordes; el cian solo en datos y estados.
- Nunca pintar palabras sueltas de otro color.

### Glassmorphism tipo iOS (recetas del sitio)
- **Glass claro** (sobre fondo pastel): blur 40 px + saturate 2, fondo blanco 20 a 35%,
  anillo interior 1 px blanco 30 a 50%, sombra `0 24px 80px -20px rgba(139,92,246,.18)`,
  radio 24 a 32 px.
- **Glass oscuro** (paneles de producto): fondo `rgba(10,12,28,.9)`, blur 24 px, borde
  1 px blanco 10%, sombra `0 34px 90px rgba(35,16,69,.28)`, radio 16 a 24 px.
- **Chip glass**: blur 24 px, fondo blanco 35% (claro) u 8% (oscuro), radio pill.
- El glass necesita algo detrás para refractar: siempre poner glow, hebras de luz o
  blobs de color debajo. Glass sobre fondo plano se ve barato.

### Atmósfera
- **Escena oscura**: noche `#020618` con glow violeta radial y, en aperturas, las
  **hebras de luz** del hero del sitio (azul → violeta → magenta en diagonal).
- **Escena clara**: degradé pastel lavanda + cian muy difuso, estilo wallpaper de iOS.
- Alternar oscuro y claro para marcar capítulos del video.
- Acabado: grano fino 2 a 3% y viñeta suave.

## 4. Componentes firma (librería de video)

Reconstruir en código, nunca como captura pegada:
1. **Chat de WhatsApp en vivo**: avatar AIRIS, burbujas, "escribiendo", y el
   **resultado** que queda (tarjeta con check: "Turno confirmado").
2. **Entrada → Opera AIRIS → Resultado**: tres paneles conectados por una línea de luz.
3. **Stat card de evidencia**: antes/después con barras y denominadores visibles
   ("52 de 213 turnos").
4. **Mapa de conexiones**: canales → núcleo AIRIS → herramientas.
5. **Handoff humano**: la conversación pasa a una persona con contexto y prioridad.
6. **Lockscreen de iPhone** con notificación de recordatorio.
7. **Logo reveal** con `assets/brand/logo-light.svg`.

### Componentes de llamadas (recepcionista de voz)

Referencia visual del sitio en inglés: `docs/reference/web/voz/`.

8. **Llamada entrante**: tarjeta de glass centrada con "Llamada entrante", hora
   ("13:05"), "Paciente" y número enmascarado ("+54 9 11 •••• 4821"), ícono Lucide
   `phone-incoming`. Pantalla de llamada propia de AIRIS: inspirada en iOS, nunca una
   copia de la pantalla de llamada del iPhone.
9. **Transcripción en vivo**: burbujas rotuladas "Asistente virtual", "Paciente" y, si
   hay derivación, "Sofía · Recepción" (como la tarjeta "The call gets answered" del
   sitio). Cada frase aparece cuando se dice, completa, nunca letra por letra.
10. **Voz visualizada**: las hebras de luz de la marca reaccionan a la voz del asistente
    (grosor y brillo según el audio). Es la firma visual de la voz de AIRIS.
11. **Acciones durante la llamada**: tarjetitas que aparecen mientras la llamada sigue:
    "Agenda consultada", "Turno reservado · Vie 8 · 10:30", "Obra social registrada".
12. **Resumen de llamada**: al cortar, una tarjeta con duración, motivo, acción hecha y
    próximo paso ("Confirmación enviada por WhatsApp").
13. **Transferencia a una persona**: "Transfiriendo a Sofía · Recepción" con el resumen
    de contexto que recibe la persona.

Reglas propias de las llamadas:
- El asistente **siempre se identifica** en su primera frase: "Hola, te atiende el
  asistente virtual de [consultorio]". Es parte de la marca (transparencia), no un
  trámite.
- Las llamadas de los videos son de ejemplo y se aclara con una línea chica al pie
  ("Llamada de ejemplo"). Nunca se usa la voz o la llamada de un paciente real.
- Mostrar solo capacidades que AIRIS implementa hoy (confirmar con el equipo: idioma y
  acento de la voz, transferencia en vivo, llamadas simultáneas, grabación, integración
  con la agenda).

## 5. Checklist de marca (antes de entregar)
- [ ] ¿Se entiende en qué operación ayuda AIRIS, no solo que "hay IA"?
- [ ] ¿Aparece el control humano o la trazabilidad al menos una vez?
- [ ] ¿Cada dato mostrado es real y tiene contexto?
- [ ] Si hay una llamada: ¿el asistente se identifica y la llamada termina en una
      operación hecha o en una derivación con contexto?
- [ ] ¿Tipografías, colores y glass coinciden con esta skill?
- [ ] ¿Pasa el checklist de `anti-slop`?
