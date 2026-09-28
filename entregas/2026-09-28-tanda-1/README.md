# Tanda 1: 10 videos para probar ángulos (28 de septiembre de 2026)

Diez piezas verticales (1080 × 1920, 30 fps, H.264 + AAC, -14 LUFS) hechas para medir qué
combinación de dolor, ángulo, estilo de edición y llamado a la acción funciona mejor con
dueños de consultorios y empresas. Todas se entienden sin sonido.

| Archivo | Duración | Dolor | Ángulo | Estilo de edición | Llamado a la acción |
|---|---|---|---|---|---|
| `01-manos-ocupadas.mp4` | 30 s | Llamadas que se pierden mientras atendés | Demostración de una llamada completa | Plano secuencia oscuro, sin cortes; las hebras de luz son la voz | Consultoría gratuita de 30 minutos |
| `02-menos-ausencias.mp4` | 30 s | Turnos que no vienen | Prueba con el caso real y sus límites | Infografía clara en pasteles, silencio antes del dato | Hablá con un humano (por ahora) |
| `03-contestar-no-es-resolver.mp4` | 30 s | Un bot que contesta pero no resuelve | Comparación directa | Pantalla dividida en paralelo | Consultoría gratuita de 30 minutos |
| `04-un-dia.mp4` | 30 s | El día se va en tareas administrativas | Un día entero en 30 segundos | Reloj y línea de tiempo; la luz pasa de la mañana a la noche | Escribinos por WhatsApp |
| `05-che-alguien-respondio.mp4` | 20 s | Consultas perdidas entre chats (empresas) | Frase reconocible con humor | Cortes secos al ritmo (120 bpm), violeta de marca | Consultoría gratuita de 30 minutos |
| `06-urgencia.mp4` | 20 s | Miedo a que la IA atienda mal | La objeción como gancho | Minimalista, negro, mucho aire | Hablá con un humano (por ahora) |
| `07-contestador.mp4` | 15 s | Llamadas fuera de horario | Frase de contraste | Del gris al color con corte seco | Solo la web |
| `08-titulo.mp4` | 15 s | La profesional haciendo de administrativa | Identidad y humor | Gag visual con las tareas apiladas | Consultoría gratuita de 30 minutos |
| `09-probe.mp4` | 20 s | Plata y tiempo perdidos en un bot que no resolvió nada | Disruptivo: confesión con el nombre de la herramienta tachado | Crudo en negro, cortes secos y humor seco; después entra la marca | Hablá con un humano (por ahora) |
| `09b-probe-logo.mp4` | 20 s | Igual que el 09 | Igual que el 09, pero se adivina "Manychat" pixelado | Igual que el 09 | Hablá con un humano (por ahora) |
| `10-avalancha.mp4` | 46 s | Las mismas preguntas todo el día, en todos los chats | Avalancha que tapa la pantalla; la calma, 20 chats resueltos a la vez, un mini CRM y el asistente personal del dueño por WhatsApp (audio y resumen de la semana) | Chats con estilo WhatsApp; tiembla y corta a negro; alejamiento hasta la grilla, mazo de cartas, tablero de contactos, zoom y cursor con clic | Consultoría gratuita de 30 minutos |

Guiones completos: `studio/guiones/`. Código de cada video: `studio/src/videos/`.

## Qué queremos aprender

1. **Gancho**: retención a los 3 segundos. ¿Gana la escena reconocible (01, 04), el dato
   (02), la frase de contraste (03, 07), la objeción (06) o el humor (05, 08)?
2. **Ritmo y estilo**: porcentaje visto completo. ¿Rinde más el plano secuencia (01), la
   infografía calma (02) o los cortes rápidos (05)?
3. **Duración**: comparar 30 s contra 20 s y 15 s en visto completo y en acciones.
4. **Llamado a la acción**: mensajes y clics según el cierre ("Consultoría gratuita",
   "Hablá con un humano (por ahora)", "Escribinos por WhatsApp", solo la web).
5. **Tema**: llamadas con IA (01, 06, 07) contra WhatsApp y agenda (02, 03, 04, 08) contra
   empresas (05).
6. **Tono**: el disruptivo e irreverente (09) contra el resto, más institucional.

## Cómo publicarlos para que la comparación sirva

- Mismo horario y días parecidos, sin texto distinto en el copy (así compite el video, no
  la descripción).
- Mirar los números a las 48 horas: retención a 3 s, visto completo, compartidos,
  guardados, visitas al perfil, mensajes y clics.
- Si hay pauta: mismo presupuesto por video durante los mismos días.

## Notas honestas

- **Música**: temas de la biblioteca gratuita Mixkit, la mayoría elegidos por el dueño (licencia libre: sirve para anuncios
  online, sin atribución). Detalle de cada tema, autor y tramo usado en
  `assets/music/LICENSE.md`. Los efectos siguen sintetizados por código. Elegí los temas y
  los tramos por género, ánimo y curva de energía medida, pero **no los escuché**:
  conviene escucharlos antes de publicar. Cambiar un tema es editar una línea de
  `studio/audio/tracks.json` y volver a mezclar (no hace falta renderizar de nuevo).
- **No hay voz**: el entorno no tenía clave de ElevenLabs. Los videos están pensados para
  verse sin sonido, que es como los ve la mayoría.
- Las llamadas son de ejemplo y lo dicen en pantalla. Antes de publicar, confirmar con el
  equipo que lo que se muestra de la recepcionista de voz está implementado hoy.
- El video 09 no nombra ni muestra ninguna marca real: el nombre está tachado a propósito
  ("No importa cuál."). El **09b** muestra "Manychat" pixelado, a pedido. Antes de pautarlo
  tené en cuenta que AIRIS vende una integración con ManyChat en la web en inglés, que las
  comparativas del sitio dicen "no ataque a terceros" y que una marca puede denunciar un
  anuncio que la muestra en forma negativa (Meta suele bajarlo). Si hay dudas, el 09 dice
  lo mismo sin ese riesgo.
- El dato del video 02 es el caso odontológico publicado en la web (24,4% a 2,6%, con
  denominadores) y aclara que es un caso individual, no una garantía.
