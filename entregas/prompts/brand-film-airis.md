# Prompt optimizado: brand film de AIRIS (40 s, 16:9)

## Qué cambié respecto del prompt original y por qué

| Original | Ahora | Motivo |
|---|---|---|
| Texto en pantalla en inglés | Español rioplatense, voseo | El cliente es un dueño de negocio o clínica en Argentina |
| Cursor que escribe letra por letra | Revelado con máscara, línea completa | Anti-slop: prohibido el efecto máquina de escribir |
| CRM, workflow, API, latencia en pantalla | "Ficha del cliente", "agenda", "tareas" | Anti-slop regla 5: nada técnico en lo que se lee |
| Tipografía suiza genérica | Unbounded (titulares) + Poppins (UI y apoyo) | Tipografías de la marca |
| Fondo grafito | Noche de marca `#020618` con glow violeta | Paleta de AIRIS |
| "Now imagine..." | "¿Y si todo trabajara junto?" | Anti-slop: "Imaginá..." es apertura de IA |
| Letras que se deshacen en partículas | Las letras sueltan líneas finas que forman la red | Anti-slop: partículas de stock prohibidas |
| Contadores de conversaciones como dato real | Mismo efecto, con "Datos de ejemplo" en pantalla | Anti-slop: métricas inventadas |
| "CONNECT. AUTOMATE. SCALE." | Se elimina; cierre con frase de marca y consultoría | Anti-slop: tríadas por reflejo |
| MANUAL → AUTOMATED → INTELLIGENT (tres) | Dos transformaciones | Evita la tríada |
| Palabra "ACTS" en 3D girando | Palabra plana enorme; la cámara la atraviesa | Anti-slop: nada de 3D girando |
| Etiquetas en mayúsculas sostenidas | Frases en minúscula normal; mayúsculas solo en micro detalle | Anti-slop: mayúsculas sostenidas en frases |
| Faltaba la recepcionista de voz | Se suma una llamada atendida en la escena de escala | Es parte de lo que vende AIRIS |
| Glitch visual | Solo como textura de sonido, nunca en imagen | Anti-slop: glitch gratuito prohibido |
| Música genérica | Machine Drum Vibes (Mixkit), que arranca casi en silencio y crece durante 40 s | Tema elegido por el dueño; su curva coincide con el arco del film |

---

## PROMPT

Create an exceptionally high-end brand film for **AIRIS**, a company that builds AI systems
that run the daily operation of real businesses and clinics: WhatsApp conversations, phone
calls answered by a virtual receptionist, appointment booking, customer records, sales
follow-ups, support and back-office tasks.

The film must feel like a premium technology launch film: cinematic, precise, fast,
visually addictive and extremely polished. It is **not** a generic "AI agency" ad.

The audience is **business and clinic owners in Argentina**, not engineers. Everything the
viewer can read is in **Rioplatense Spanish (voseo)**, short, concrete and non-technical.
Technical texture is allowed only as tiny, unreadable background detail.

Central concept: **AI automation as an invisible operating system that connects an entire
business.** Emotional arc: *complexity under control*.

`CAOS → CONEXIÓN → INTELIGENCIA → AUTOMATIZACIÓN → ESCALA`

### Hard rules (from the brand owner, no exceptions)

1. **No labels above headlines.** No eyebrows, kickers, pills, badges or small caps text on
   top of a title. The headline stands alone.
2. **No em dashes or en dashes** in any on-screen text, and no loose " - " either. Use
   periods, commas or a middle dot (·).
3. **No keywords highlighted in color.** Every headline is one single color (white).
   Emphasis only through italic in the same color, size, isolation (the word alone in its
   own shot) or timing (it lands on a music hit).
4. **All text centered** horizontally inside the safe area. Only exception: the internal
   content of UI mockups (chat bubbles left and right), with the mockup itself centered.
5. **Nothing technical on screen.** Never readable: API, CRM, webhook, workflow, pipeline,
   backend, integration, LLM, prompt, model, vendor names. Say what the owner sees:
   "tu agenda", "la ficha del cliente", "se conecta con lo que ya usás".
6. **Original, expert-level corporate animation.** Nothing that looks like a preset.

### Avoid

Generic robots, human-shaped AI avatars, glowing brains, holograms, glowing orbs that
"speak", headsets, call-center stock images, random particles, lens flares, cyberpunk
cities, Matrix code, circuit boards, stock handshakes, floating chatbot bubbles, typewriter
text, bouncing or spinning letters, 3D spinning logos, glitch or RGB split visuals, radial
blur zooms, cube or page transitions, linear easing, same fade+slide on everything, AI
generated faces or hands, fake UIs with lorem ipsum, invented metrics presented as real,
neon cyberpunk, any real product's interface or logo (WhatsApp style is allowed as a UI
language, never its logo or name).

### Visual identity

- **Background:** AIRIS night `#020618` (with `#0A0C1C` and `#171223` for depth), soft radial
  violet glow, fine grid systems, soft depth of field.
- **Accent:** AIRIS violet `#7C3AED` used selectively (lines, glow, active states, CTA).
  Cyan `#67E8F9` only for live data and status. Warm amber only for "pending" states.
- **Glass:** iOS-style dark glass panels (`rgba(10,12,28,.9)`, 24 px blur, 1 px light
  border, subtle edge reflections). Glass always has light or lines behind it to refract.
- **Signature:** the AIRIS light strands (diagonal ribbons, blue to violet to magenta) are
  the visual voice of the system. Use them in the opening of Scene 02 and the finale.
- **Typography:** **Unbounded** 700 to 900 for headlines (large, tight, minimal).
  **Poppins** 400 to 600 for UI and supporting text. Max two families.
- **Lines:** 1 px and 2 px, routing-diagram logic: horizontal, vertical, 90 degree bends,
  smooth node joints. Lines occasionally race across the frame and activate what they
  touch.
- **Light:** interfaces emit their own light; violet softly lights nearby surfaces;
  occasional white light sweeps; extremely controlled bloom; volumetric light only when
  justified. Everything should feel engineered, not decorated. Expensive, never neon.

### Motion principles

- Spring-based easing, smooth acceleration, magnetic snapping, inertial scrolling,
  progressive masked reveals, morph transitions, camera parallax, depth transitions,
  micro-interactions. Easing out: cubic-bezier(0.16, 1, 0.3, 1).
- Every transformation communicates that AIRIS **connects, coordinates or completes**
  something. No arbitrary motion.
- **Continuity over cuts:** one object becomes the next scene. A connection becomes a graph
  line, the graph line becomes a panel border, the border becomes a calendar timeline, the
  timeline becomes a message thread, the thread becomes the network, the network
  collapses into the AIRIS logo.
- **Discovery zooms:** follow a violet line, pull back: it is a chart. Pull back: the chart
  lives in a dashboard. Pull back: the dashboard is one node of the AIRIS system.
- Every 1 to 2 seconds a significant transformation (zoom, scale change, camera travel,
  UI morph, typographic transition, graph build, network expansion). No composition holds
  still more than 2.5 s. Controlled, never chaotic.
- **Charts are built, never shown:** axes draw, numbers fade in, the line follows, points
  activate in order, the camera rides the line and exits at its peak into the next scene.
- **Progress states** (fast, subliminal, Spanish): Ficha del cliente 0 → 100% ·
  Analizando → Calificado · Revisando agenda → Disponible → Confirmado · Generando
  factura → Enviada · Cliente reconocido.
- **Micro detail for credibility, never readable clutter:** timestamps, coordinates,
  status dots, tiny activity graphs, processing percentages, selection boxes, animated
  cursors, dynamic masks.

### Format

16:9 master, 3840 × 2160, 24 fps (motion graphics must stay perfectly smooth), subtle
cinematic motion blur, sharp typography. Duration ≈ 40 s. Also deliver a 9:16 cutdown
(1080 × 1920) re-composed, not cropped, with text inside y 190 to 1570 and 90 px margins.

---

### SCENE 01 · CAOS (0:00 to 0:04)

Black. A thin horizontal white line draws across the center. Subtle electrical ambience.

Headline revealed by a precise mask, whole line at once (never letter by letter):

> **Tu negocio toma miles de decisiones por día.**

Slow push-in. Dozens of 1 px lines grow out of the letters; the camera dives through the
typography into a dark 3D operational space.

Hundreds of small business events surround the camera, as elegant UI fragments (small
glass cards, data labels, mini charts, message fragments, status dots, timestamps,
progress bars), never as icons: WhatsApp messages, missed calls, customer records,
emails, appointments, invoices, leads, questions, follow-ups, payments, internal tasks.

The camera keeps flying forward as they multiply. Some messages stay unread. Readable
cards, briefly:

- "Seguimiento pendiente"
- "Consulta sin responder · 18 min"
- "Turno sin confirmar"
- "Factura pendiente"

Thin amber indicators blink. No alarm aesthetic, just operational friction.

Headline:

> **La mayoría lo resuelve** *a mano.*

"a mano." lands on a bass hit and grows slightly (same white, italic). Everything freezes.
Hard cut on the hit.

### SCENE 02 · LA SEÑAL (0:04 to 0:08)

Pure black. One violet point, extremely subtle glow. A thin violet line travels
horizontally like a signal. As it passes, loose UI fragments snap into alignment
(magnetic snapping).

The line bends 90 degrees, and again, touching blocks that light up as it connects them:
Mensaje → Ficha del cliente → Agenda → Venta → Factura. With every connection the
interface gets cleaner. Camera shifts from drifting, floating motion to perfectly
stabilized motion.

Headline:

> **¿Y si todo trabajara** *junto?*

"junto?" holds half a second, then its strokes unspool into thin violet lines that route
themselves into a node network (lines, not particles).

### SCENE 03 · EL SISTEMA (0:08 to 0:13)

The network expands, the camera orbits slightly. Architectural and functional, never
decorative. Nodes get calm, sentence-case labels:

WhatsApp · Llamadas · Agenda · Ventas · Atención · Operaciones · Cobros

The minimal AIRIS mark sits at the center as a processing core (no big reveal yet). Packet
pulses travel along the lines into the core and outputs leave instantly.

Hero example. A WhatsApp-style message (dark mode bubble, no logo) enters the core:

> "Hola, quiero sacar un turno."

A vertical sequence expands, each step lighting in under a second:

Reconoce al cliente → Revisa la agenda → Reserva el turno → Actualiza la ficha → Manda la
confirmación

The sequence collapses back into one clean line.

> **Un mensaje.**
>
> **Cinco tareas resueltas.**

The "5" (as a numeral, in Unbounded 900) grows into a giant typographic form; the camera
flies through its hollow counter.

### SCENE 04 · EL MOTOR (0:13 to 0:20) · hero animation

The camera emerges inside a huge abstract process (inspired by automation software, copying
none). Connected nodes:

Nueva consulta → Califica → Deriva → Hace seguimiento → Agenda → Actualiza la ficha →
Avisa al equipo

A white pulse enters "Nueva consulta" and the camera follows it continuously: lines draw
ahead of it, nodes expand as it approaches and activate when touched, fields complete
themselves, small checks appear, progress bars fill, a customer record updates, a calendar
slot locks, a notification fires.

Scale changes constantly: start wide, dive extremely close into one node, discover a full
interface inside it, follow a line inside that interface, the line becomes a chart, the
chart rises, its line morphs into the edge of another panel, the camera rotates: we are
looking at a business dashboard. Match cuts and morphs only; avoid conventional cuts.

### SCENE 05 · ESCALA (0:20 to 0:25)

Dashboard. One big number with a small label:

**247** · Conversaciones atendidas

It counts up fast: 247 → 391 → 628 → 1.024 → 2.481 (Spanish thousands separator). Small
footnote, bottom center, for the whole scene: "Datos de ejemplo".

The camera pulls back: this dashboard is one of dozens, then hundreds: conversations,
answered calls (a "Llamada atendida" card among them), appointments, qualified contacts,
invoices, support requests, follow-ups. Tiny activity lights everywhere, all at once.

> **La automatización no reemplaza tu negocio.**

Quick transition.

> **Le saca lo que lo** *frena.*

On "frena." a knot of tangled lines appears; the violet signal passes through and they
snap into perfectly parallel paths. Very satisfying.

### SCENE 06 · ANTES Y DESPUÉS (0:25 to 0:30)

Split screen enters dynamically. Left: fragmented tools (a WhatsApp-style chat, a
spreadsheet, email, a paper-like calendar, manual reminders), broken connections, a human
cursor jumping between windows. Right: AIRIS, one continuous connected system.

The divider slides left; AIRIS gradually takes the whole frame. Two label morphs (letters
physically rearrange, never flip or spin):

A mano → Automático
Por separado → Conectado

### SCENE 07 · EL AGENTE (0:30 to 0:35)

Everything fades except one WhatsApp-style conversation (dark mode, green outgoing
bubble, grey incoming, blue double tick, timestamp inside the bubble; never the WhatsApp
logo or name).

> Cliente: "¿Puedo pasar mi turno al jueves a la tarde?"

No "escribiendo…". Instead, behind the chat, transparent glass layers expand and align:

Cliente reconocido · Turno actual encontrado · Jueves a la tarde disponible · Reglas del
consultorio · Ficha del cliente · Agenda

A thin violet vertical scan passes through them. Instantly:

> AIRIS: "Listo, te pasé al jueves a las 16:30. Te aviso el día anterior."

In one fluid move: the calendar slot moves, the record updates, a confirmation is
delivered (check).

> **No es un chatbot.**
>
> **Es un sistema que** *resuelve.*

"resuelve." grows very large (flat type, same white); the camera passes straight through
the counter of the "o".

### SCENE 08 · EL SISTEMA OPERATIVO DEL NEGOCIO (0:35 to 0:40)

Wide shot of the whole AIRIS ecosystem: modules around the core (Ventas, Atención,
Operaciones, Fichas de clientes, WhatsApp, Llamadas, Turnos, Cobros), continuous pulses
between them, perfectly synchronized.

The UI dissolves until only the connecting lines remain. The lines converge and draw the
exact geometry of the AIRIS mark (use the official logo paths, stroke-drawn letter by
letter with a clip reveal). Big synchronized musical impact. The light strands sweep once
behind the logo.

Under the logo, centered, single color, no label above:

> **Un mensaje entra.** *La operación continúa.*

Then, on a soft click:

> Consultoría gratuita de 30 minutos
>
> airisautomation.com

The violet network keeps moving almost imperceptibly inside the logo. Hold 2 s. Fade to
black.

---

### Music and sound

- **Track:** "Machine Drum Vibes" by Alejandro Magaña (Mixkit, id 117, Mixkit Free License:
  commercial and online ads OK, no attribution). It starts almost silent and builds for
  about 40 s, which matches the film: start the track at 0:00 and let it grow as AIRIS
  connects more of the business. Trim, don't loop. Fade out on the logo hold.
- **Arc:** minimal and mysterious at first (sub bass, one digital pulse, faint textured
  synth), then precise percussion, digital clicks, low impacts, mechanical sync sounds and
  short reverses as the system connects. Glitch only as sound texture, never in the image.
- **Sync:** every major animation lands on the music. Hard cut in Scene 01, the "5" fly
  through, the parallel lines snap and the logo convergence land on hits.
- **SFX:** tiny UI animations get soft clicks; major transitions get deep bass impacts,
  short digital sweeps, short reversed sounds, low cinematic hits. Keep effects **low
  pitched and soft** (the owner finds bright, high effects annoying: pitch them down about
  4 semitones and roll off above 6.5 kHz). No meme sounds, no Apple or Windows system
  sounds.
- **Mix:** music ducks 4 to 5 dB under effects. Master at -14 LUFS, true peak ≤ -1 dBTP.
  Short fade-in on the first 30 ms (a hit on frame 0 overshoots after AAC encoding).

### Final QA checklist

- [ ] No headline has small text above it.
- [ ] No — or – anywhere on screen.
- [ ] Every headline is a single color; emphasis only via italic, size, isolation or timing.
- [ ] All text centered and inside the safe area.
- [ ] No readable technical words (CRM, workflow, API...). Micro detail stays unreadable.
- [ ] No invented metric without "Datos de ejemplo" on screen.
- [ ] No robots, orbs, particles, holograms, glitch visuals, spinning 3D or typewriter.
- [ ] No composition still for more than 2.5 s; every transformation means "connects,
      coordinates or completes".
- [ ] Only Unbounded and Poppins; night background; violet as accent, cyan only for data.
- [ ] Audio at -14 LUFS, ≤ -1 dBTP, effects soft and low.

### What the viewer should feel at the end

"This is not a chatbot agency." "This company builds infrastructure." "This could run my
entire business." AIRIS reads like an enterprise technology platform, spoken in the
language of an owner.
