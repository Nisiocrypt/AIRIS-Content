# Análisis del reel de referencia: AIRIS "Tu consultorio, atendido 24/7" (v1)

Archivo original: WhatsApp Video 2026-09-28 · 20.07 s · 1080×1920 (9:16) · 30 fps · H.264 +
AAC estéreo 48 kHz. Audio: -21 dB promedio, pico -1 dB.
Contact sheets (1 frame/seg): `docs/reference/airis-reel-v1-sheet-1.jpg` y `-sheet-2.jpg`.

## Estructura (beat sheet)

| Tiempo | Escena | Contenido |
|---|---|---|
| 0–3 s | Gancho | Reloj 23:47 que rueda dígitos · "Consultorio cerrado" · mensajes de WhatsApp apilándose · "Tu consultorio cerró. *WhatsApp no.*" |
| 3–4 s | Logo | Reveal AIRIS con rayos radiales · "AI Operations · Odontología" |
| 4–9 s | Beneficio 1 | "Responde en segundos." · chat simulado con tipeo, respuesta y tarjeta "Turno reprogramado" |
| 9–12 s | Beneficio 2 | "Recuerda por vos." · lockscreen de iPhone con recordatorio → "Turno confirmado" |
| 12–15 s | Prueba | "Menos ausencias." · contador 24,2% → 2,6% · "-89,4% de ausencias" |
| 15–18 s | Beneficio 3 | "Si hace falta criterio, te lo pasa." · handoff a humana (Sofía · Recepción) |
| 18–20 s | CTA | Logo · "Tu consultorio, atendido 24/7, sin perder control humano." · airisautomation.com |

## Lo que ya está muy bien

- Sistema visual coherente: fondo violeta profundo con glow radial, glassmorphism, verde
  WhatsApp como único acento cálido.
- Jerarquía tipográfica clara (display bold con segunda línea en itálica).
- Entradas con blur-to-sharp en el texto, contadores animados, stagger en burbujas.
- Narrativa problema → solución → prueba → confianza → CTA en 20 s. Excelente guion.

## Lo que rompe las reglas de la skill `anti-slop` (corregir en la v2)

- Etiquetas arriba de cada título ("— AGENTE IA · WHATSAPP 24/7", "— CASO DOCUMENTADO",
  "— HANDOFF HUMANO"): van afuera.
- Guion largo en esas etiquetas: prohibido en todo texto en pantalla.
- Palabras clave en color lavanda/degradé ("segundos.", "vos.", "ausencias.",
  "WhatsApp no.", "24/7."): el titular entero va en un solo color.
- Titulares alineados a la izquierda: en video todo el texto va centrado.

## Oportunidades de mejora (prioridad)

1. **Voz en off** (mayor impacto). Guion de ~45 palabras en rioplatense, cálido y seguro.
   Ejemplo: "Son las once y cuarenta y siete. Tu consultorio cerró… WhatsApp no. AIRIS
   responde en segundos, reprograma turnos y recuerda por vos. En una clínica, las
   ausencias bajaron de 24 a menos de 3 por ciento. Y si hace falta criterio, te lo pasa.
   AIRIS: tu consultorio, atendido 24/7."
2. **Diseño sonoro por evento** (ver skill `sound-design`): tic de reloj en el gancho, pop
   por cada burbuja con pitch ascendente, typing, whoosh entre escenas, impacto en el logo,
   ticks de contador que se desaceleran con el número, "ding" en el check verde.
3. **Música con arco**: pad tenso nocturno en el gancho → beat que entra en el reveal del
   logo → corte a silencio de ~300 ms justo antes de "2,6%" → resolución en el CTA.
4. **Cámara viva**: hoy los planos quedan estáticos 1–2 s tras animar. Agregar push-in
   lento continuo (100% → 104%) y parallax sutil entre capas (fondo/tarjeta/texto).
5. **Transiciones con intención**: en vez de cortes/fades, *match cuts* (el "23:47" se
   convierte en el "10:30" del teléfono; la burbuja se expande en la tarjeta siguiente).
6. **Momento "wow" del dato**: el 2,6% merece más: contador que desacelera, barra que
   se vacía, un micro flash del glow y un silencio previo. Es la prueba social; tiene
   que sentirse.
7. **Legibilidad móvil**: textos secundarios (timestamps, "Recordatorio 48 h enviado")
   son muy pequeños para 9:16; subir a ≥ 28 px o eliminarlos. Revisar zona segura inferior
   (el CTA "Consultoría gratuita · 30 min" queda cerca de la UI de Reels).
8. **Subtítulos** sincronizados a la voz, por frase y en un solo color, para el 80%
   que mira sin sonido, sin duplicar lo que ya dicen los titulares.
9. **Textura final**: grano fino (2 a 3%) y viñeta suave para un acabado más
   cinematográfico.
10. **Versiones**: exportar 9:16 (Reels/TikTok), 4:5 (feed) y 16:9 (YouTube/LinkedIn)
    desde la misma composición.
