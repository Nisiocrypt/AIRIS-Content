---
name: video-ideas-hooks
description: Generar ideas de videos, hooks de los primeros 3 segundos, guiones y estrategia de marketing aplicada para AIRIS (reels, shorts, anuncios, LinkedIn), incluida la recepcionista de llamadas con IA. Usar cuando se pida idear contenido, escribir un guion, mejorar un hook, planificar una serie o un calendario de videos.
---

# Ideas de video, hooks y marketing aplicado

Cargar junto con `airis-design-philosophy` (voz y pilares) y `anti-slop` (lo prohibido).
Todo guion pasa por `scripts/anti_slop_check.py` antes de producirse.

## 1. A quién le hablamos

| Segmento | Dolor que reconoce al instante | Deseo |
|---|---|---|
| Odontólogos, kinesiólogos, nutricionistas, psicólogos | WhatsApp a la noche, turnos que no vienen, recordar a mano | Consultorio en orden sin contratar más gente |
| Clínicas estéticas | Consultas de precio que no convierten, seguimiento de tratamientos | Más agenda llena con el mismo equipo |
| PyMEs de servicios, concesionarios, inmobiliarias | Leads que se enfrían, "¿che, alguien respondió?", planillas | Que nada se pierda entre chats y Excel |
| Negocios que viven del teléfono (consultorios con pacientes mayores, clínicas con mucho volumen, servicios con urgencias) | El teléfono suena mientras atendés, la recepción no da abasto al mediodía, fuera de horario salta el contestador | Que cada llamada termine en un turno o en una derivación, sin cortar la consulta |

Objeciones a desactivar (una por video como máximo): "la IA le va a responder mal a mis
pacientes", "voy a perder el control", "es caro y en dólares", "no tengo tiempo de
implementarlo", "ya tengo un chatbot".

Objeciones propias de las llamadas: "mis pacientes mayores no quieren hablar con una
máquina", "va a sonar robótica", "¿y si entiende mal?", "¿graba las llamadas?".
Respuestas y contexto en `docs/research/recepcionista-llamadas-ia.md`.

## 2. Niveles de conciencia (elegir uno por video)

1. **No sabe que tiene el problema**: mostrar la escena cotidiana (23:47, 4 mensajes sin
   leer) y nombrar el costo.
2. **Sabe del problema, no de la solución**: mostrar que existe otra forma (operación, no
   bot).
3. **Conoce soluciones, compara**: AIRIS vs chatbot, vs freelancer, vs secretaria.
4. **Casi listo**: evidencia (caso 24,4% → 2,6%), proceso de implementación, precio claro.
5. **Listo**: CTA directo a consultoría de 30 minutos.

## 3. Hooks: los primeros 3 segundos

Reglas:
- El primer frame ya tiene movimiento y texto. Nada de logo, intro ni fade desde negro.
- Texto del hook de 7 palabras o menos, centrado, legible en 1 segundo.
- Arrancar a mitad de la acción. La voz entra en el frame 0 o no hay voz.
- El hook promete algo que el video **paga** antes de la mitad.
- B2B responde mejor a hooks con prueba, datos y situaciones reconocibles que a
  curiosidad vacía.
- Producir 2 o 3 variantes de hook por video (mismo cuerpo) para testear retención a 48 h.

Tipos de hook (con ejemplos AIRIS listos para adaptar):

| Tipo | Ejemplo en pantalla |
|---|---|
| Escena reconocible | "23:47. Cuatro pacientes esperando respuesta." |
| Costo concreto | "Cada turno perdido es un sillón vacío." |
| Dato con prueba | "De 24,4% a 2,6% de ausencias." |
| Contradicción | "Un chatbot no te ordena la agenda." |
| Prueba / test | "La prueba de las 2 AM." |
| Identidad | "Si atendés pacientes y contestás WhatsApp de noche." |
| Pregunta operativa | "¿Quién respondió al paciente del jueves?" |
| Antes / después visual | Pantalla con 17 chats sin leer que se vacía en 3 s |
| Humor de la casa | "Construyendo Skynet para PyMEs. Pero con permiso." |

Hooks para la recepcionista de llamadas:

| Tipo | Ejemplo en pantalla |
|---|---|
| Escena reconocible | "Tenés las manos ocupadas. El teléfono suena." |
| Hora concreta | "13:05. La recepción está almorzando." |
| Audio primero | "Escuchá esta llamada." (el audio arranca en el frame 0) |
| Contradicción | "El contestador no agenda turnos." |
| Resultado | "La llamada terminó. El turno ya está en la agenda." |
| Transparencia | "Te atiende un asistente virtual. Y lo dice." |
| Control humano | "Sabe cuándo pasarte la llamada." |
| Pregunta operativa | "¿Quién atiende cuando vos no podés?" |

Hooks prohibidos: "¿Sabías que...?", "En este video...", "Esto va a cambiar tu negocio",
cualquier cosa que no se pueda mostrar en pantalla. En llamadas, además: "Nunca más
pierdas una llamada", "La recepcionista que nunca duerme", "Atiende 24/7 sin cansarse"
(son los clichés de toda la categoría; AIRIS se diferencia mostrando la operación
terminada y la derivación a una persona).

## 4. Estructuras de guion

**Demo de llamada de 25 a 40 s (audio primero):**
1. Hook (0 a 3 s): suena el teléfono en una escena reconocible, texto de 7 palabras o
   menos.
2. Atiende (3 a 6 s): el asistente se identifica ("Hola, te atiende el asistente
   virtual de...") y se ve la voz en las hebras de luz.
3. Llamada (6 a 25 s): transcripción por frase + tarjetas de acción que aparecen
   mientras hablan (agenda consultada, turno reservado).
4. Resultado (25 a 32 s): resumen de la llamada y confirmación que llega por WhatsApp.
5. Cierre: "Una llamada entra. La operación continúa." + CTA. Línea al pie: "Llamada de
   ejemplo".
Variante con derivación: en el paso 3 el paciente dice algo urgente y la llamada pasa a
una persona con el resumen en pantalla.

**Reel de 20 a 30 s (PAS + prueba):**
1. Hook (0 a 3 s): escena o dato.
2. Problema agitado (3 a 8 s): una consecuencia concreta.
3. Operación AIRIS (8 a 18 s): mensaje entra → acción → resultado registrado.
4. Control humano o prueba (18 a 24 s): handoff o dato real.
5. Cierre (24 a 30 s): logo + una línea + CTA.

**Explainer de 45 a 60 s (antes / después / puente):** día real sin AIRIS, el mismo día
con AIRIS, cómo se implementa en 2 a 4 semanas, CTA.

**Comparativa (nivel 3):** mismo mensaje del paciente respondido por un chatbot y por
AIRIS, lado a lado. Termina en la acción que el chatbot no hizo.

**Caso / evidencia (nivel 4):** números con denominadores, qué se automatizó, qué no
demuestra el caso. La honestidad es el diferencial.

Ritmo: un cambio visual cada 1,5 a 2,5 s. Tiempo en pantalla de un texto = palabras ÷ 3
+ 0,6 s. Voz a 2 a 2,5 palabras por segundo.

## 5. Formato de entrega de una idea

Cada idea se entrega así (y se guarda en `ideas/<fecha>-<slug>.md`):

```
Título interno:
Segmento y nivel de conciencia:
Pilar de marca:
Hook A / B / C (texto en pantalla + primera frase de voz):
Beat sheet (tiempo | imagen | texto en pantalla | voz | SFX):
CTA:
Prueba o dato usado (fuente):
Plataformas y formatos: 9:16 / 4:5 / 16:9
```

Puntuar cada idea de 1 a 5 en: claridad del dolor, fuerza del hook, prueba disponible,
facilidad de producción, encaje con la marca. Producir primero las de mayor puntaje.

## 6. Banco inicial de ideas

1. **La prueba de las 2 AM**: un paciente escribe a las 2:07; se ve todo lo que AIRIS
   hace hasta las 8:00 sin que nadie toque el teléfono.
2. **Tres chats, tres tareas terminadas**: turno confirmado, lead registrado, reclamo
   derivado, en 20 s.
3. **Chatbot vs AIRIS**: "No llego al turno del jueves" respondido por los dos.
4. **El sillón vacío**: cuánto cuesta por mes una tasa de ausencias del 24%.
5. **De 24,4% a 2,6%**: el caso odontológico contado con sus límites.
6. **Handoff**: "Me duele mucho una muela desde anoche". La IA no diagnostica: deriva a
   Sofía con contexto y prioridad alta.
7. **Tu título no dice "Administrativo Full-Time"**: para profesionales independientes.
8. **¿Che, alguien respondió?**: el caos de un WhatsApp compartido, ordenado.
9. **Reactivar pacientes dormidos**: el mensaje que vuelve a llenar la agenda.
10. **Implementación en 2 a 4 semanas**: relevamiento, implementación, salida controlada.
11. **Lo que la IA no hace**: diagnóstico, decisiones clínicas, excepciones. Genera
    confianza.
12. **Un mensaje entra. La operación continúa.**: el mapa de conexiones animado.

Llamadas con IA:

13. **Manos ocupadas**: odontólogo con un paciente en el sillón, suena el teléfono, el
    asistente atiende y el turno aparece en la agenda sin que nadie se mueva.
14. **13:05**: la recepción almuerza, entran tres llamadas y cada una termina en algo
    hecho.
15. **Escuchá esta llamada**: 30 s de llamada de ejemplo con transcripción y el
    resultado al final. Pensado para ver con sonido.
16. **El contestador no agenda turnos**: contestador tradicional vs asistente de voz,
    misma llamada fuera de horario.
17. **Llamada + WhatsApp**: la llamada termina y a los segundos llega la confirmación
    por WhatsApp. Una sola operación, dos canales.
18. **Sabe cuándo pasarte la llamada**: "Se me hinchó la cara y me duele mucho". No
    diagnostica: transfiere a una persona con el resumen y prioridad alta.
19. **Se presenta como lo que es**: la transparencia como valor. "No se hace pasar por
    una persona."
20. **Cada llamada deja registro**: los resúmenes de un día se apilan en una vista de
    agenda (números reales o marcados como ilustrativos).
21. **Tu recepcionista vuelve a atender personas**: el teléfono deja de interrumpir a
    quien está en el mostrador.

## 7. CTA

Un solo CTA por video. Opciones de la casa: "Hablá con un humano (por ahora)",
"Consultoría gratuita de 30 minutos", "Escribinos por WhatsApp". Nunca "link en bio"
como única información: mostrar airisautomation.com centrado.
