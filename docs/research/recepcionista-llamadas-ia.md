# Recepcionista de llamadas con IA: cómo comunicarla en video

Objetivo: sumar la atención de llamadas con IA al contenido de AIRIS y tener todo listo
para producir videos sobre eso con el mismo nivel que el resto de la marca.

## 1. Qué hay hoy en AIRIS

- **El sitio en inglés ya la muestra** (`/en-us/` y `/en-us/services/`): módulo
  "After-hours voice reception". Una llamada fuera de horario se convierte en una
  solicitud calificada, un registro en el CRM y una derivación segura a una persona.
  Stack ilustrativo: Twilio (llamada entrante) → Vapi (asistente de voz que se
  identifica) → AIRIS (reglas y orquestación) → HubSpot + Calendario → equipo de guardia.
  Principios que declara: "AI identity stated" (quien llama sabe que habla con un
  asistente virtual), reglas aprobadas, salida humana ante lenguaje urgente o dudoso, y
  "Call summarized, CRM updated and owner notified". El proveedor de voz (Vapi, Retell u
  otro) se elige después del relevamiento.
- **El sitio en español todavía no menciona llamadas.** Para que los videos tengan
  adónde mandar, conviene sumar una sección o landing en español antes de publicarlos.
- Capturas de referencia: `docs/reference/web/voz/` (stack de voz y llamada atendida).

## 2. Posicionamiento: cómo encaja en la filosofía

La llamada es **un canal de entrada más** de AI Operations. Mismo principio que WhatsApp:

> Una llamada entra. La operación continúa.

| Pilar AIRIS | Cómo se ve en una llamada |
|---|---|
| Operación, no conversación | La llamada termina con algo hecho: turno en agenda, datos registrados, confirmación enviada por WhatsApp. |
| Control humano | Urgencias, dudas clínicas o enojo se transfieren a una persona con el resumen de la llamada. |
| Evidencia honesta | Cada llamada deja resumen y registro. En los videos, la llamada es de ejemplo y se dice. |
| Transparencia | El asistente se presenta como asistente virtual en su primera frase. |

**Diferencial frente al mercado:** casi todos los proveedores venden "nunca más pierdas
una llamada" y "recepcionista incansable". Es el cliché de la categoría. Lo que las demos
de la competencia suelen esconder es justamente lo que AIRIS muestra: **saber cuándo
pasarle la llamada a una persona** y **dejar la operación terminada**, no solo atender.

## 3. Mensajes y objeciones

Mensajes principales:
1. "Estás con un paciente. La llamada igual se atiende."
2. "La llamada terminó. El turno ya está en la agenda."
3. "Se presenta como asistente virtual. Y cuando hace falta, te pasa la llamada."
4. "El contestador no agenda turnos."

Objeciones a responder en video (una por pieza):
- "Mis pacientes mayores no quieren hablar con una máquina": puede pedir hablar con una
  persona en cualquier momento.
- "Va a sonar robótica": mostrar audio real del asistente, sin trucos de edición.
- "¿Y si entiende mal?": confirma los datos en voz alta y deja un resumen revisable.
- "¿Graba las llamadas?": aviso, consentimiento y política de privacidad (validar con el
  equipo lo que realmente se implementa en cada cliente).

## 4. Datos de mercado (contexto, no para pantalla)

Varias fuentes de 2026 hablan de consultorios odontológicos que pierden entre 30 y 38%
de las llamadas y de costos altos por paciente nuevo perdido. **Casi todas son blogs de
proveedores de recepcionistas con IA, con datos de EE.UU.** Sirven como contexto
interno. Regla: en pantalla solo van datos medidos por AIRIS o de una fuente primaria
citada en el mismo video.

## 5. Producción de las llamadas de demostración

- **Guion de la llamada** con la voz de la marca, sin guiones largos ni frases de IA
  (skill `anti-slop`). El asistente abre siempre con: "Hola, te atiende el asistente
  virtual de [consultorio]".
- **Voces**: ElevenLabs Eleven v3 con *Text to Dialogue* (una voz por turno, etiquetas de
  interpretación entre corchetes como `[duda]` o `[suspira]` para el paciente). Voz del
  asistente: rioplatense, cálida y calma. Si existe el agente de voz real de AIRIS, mejor
  grabar una llamada real de prueba (con actores o el equipo, con consentimiento).
- **Tiempos honestos**: dejar pausas realistas entre turnos. No recortar la latencia
  para que el producto parezca más rápido de lo que es.
- **Sonido de llamada**: EQ telefónica suave para que se lea como llamada sin perder
  inteligibilidad; tono de llamada propio (nunca el ringtone del iPhone ni sonidos de
  Apple).
- **Transcripción sincronizada**: WhisperX sobre el audio del diálogo da los tiempos de
  cada frase para animar la transcripción en Remotion.
- **Aviso**: una línea chica centrada al pie cuando la llamada es ilustrativa ("Llamada
  de ejemplo"), igual que hace el sitio. Nunca como etiqueta arriba de un título.

## 6. Contexto legal (validar con asesoría antes de publicar o implementar)

- Unión Europea: el artículo 50 del AI Act exige, desde el 2 de agosto de 2026, avisar a
  las personas que interactúan con un sistema de IA; para agentes de voz, dicho en voz
  alta en la primera interacción.
- EE.UU.: hay reglas federales y estatales sobre llamadas con voces de IA (sobre todo
  salientes) y sobre grabación de llamadas.
- Argentina: grabar llamadas y tratar datos de salud involucra la ley de protección de
  datos personales.
- Para los videos alcanza con la regla de marca: el asistente siempre se identifica, y
  nunca se usa la voz o la llamada de una persona real sin su consentimiento escrito.

## Fuentes

- Sitio AIRIS en inglés: https://airisautomation.com/en-us/ y https://airisautomation.com/en-us/services/
- Datos de llamadas perdidas (fuentes de proveedores): https://www.resonateapp.com/resources/missed-calls-dental-practices-statistics · https://agentzap.ai/blog/dental-practice-phone-statistics · https://www.hicira.com/missed-call-statistics
- Clichés y tendencias de marketing de voice AI: https://www.huskyvoice.ai/use-cases/marketing-agency-voice-ai · https://growwstacks.com/blog/6-voice-ai-client-offers-that-actually-sell
- ElevenLabs Text to Dialogue y etiquetas de v3: https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue · https://elevenlabs.io/blog/v3-audiotags
- AI Act art. 50 y agentes de voz: https://www.famulor.io/blog/eu-ai-act-article-50-what-your-ai-phone-agent-must-say · https://justcall.io/blog/ai-voice-agent-disclosure-laws.html
- Visualización de audio en Remotion: `.claude/skills/remotion-best-practices/remotion-markup/audio-visualization.md`
