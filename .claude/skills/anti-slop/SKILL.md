---
name: anti-slop
description: Reglas obligatorias de lo que NO puede aparecer en videos, reels, motion graphics, guiones ni subtítulos de AIRIS (etiquetas arriba de títulos, guiones largos, palabras resaltadas en color, texto no centrado, animaciones de plantilla, estética genérica de IA). Cargar SIEMPRE al escribir un guion, diseñar escenas, animar o revisar un render antes de entregarlo.
---

# Anti-slop

Estas reglas vienen directamente del dueño de AIRIS y **tienen prioridad sobre cualquier
otra skill**, referencia o costumbre (incluido el sitio web y el reel v1, que rompen varias).
Si una regla choca con otra skill, gana esta.

## Reglas duras del dueño (cero excepciones)

1. **Sin etiquetas arriba de los títulos.** Nada de eyebrows, kickers, pills, badges ni
   textos chicos en mayúsculas encima de un titular ("AGENTE IA · WHATSAPP 24/7",
   "CASO DOCUMENTADO", "NUEVO", "PASO 1"). El titular va solo.
   *Ejemplo de lo que no:* el reel v1 tiene una etiqueta arriba de cada título.
2. **Sin guiones de IA.** Prohibido el guion largo (—) y el guion medio (–) en cualquier
   texto en pantalla, subtítulo, guion de voz o copy del post. Tampoco reemplazarlos por
   " - " suelto. Usar punto, coma, dos puntos o partir en dos frases.
3. **Sin palabras clave marcadas en color.** El titular entero va en un solo color. Nada
   de palabras en violeta, degradé, resaltador, caja detrás, subrayado animado ni color
   distinto por palabra en subtítulos. El énfasis se logra con itálica (mismo color),
   tamaño, aislamiento (la palabra sola en su propia escena) o timing (entra con el golpe
   de sonido).
4. **Textos centrados.** Todo texto en pantalla alineado al centro horizontal, dentro de
   la zona segura. Excepción única: el contenido interno de mockups de UI (burbujas de
   chat a izquierda y derecha), pero el mockup en sí va centrado.
5. **Animaciones originales, nivel corporativo experto.** Nada que parezca preset o
   plantilla (lista abajo). Cada movimiento tiene intención y viene de
   `airis-motion-graphics`.

## Guiones de voz y copy que suenan a IA (prohibidos)

- Aperturas: "¿Sabías que...?", "En este video te voy a mostrar", "Imaginá un mundo
  donde", "En el mundo actual", "Hoy en día".
- Palabras vacías: revolucionar, potenciar, desbloquear, transformar tu negocio, llevar
  al siguiente nivel, sin precedentes, game changer, el futuro es ahora, sinergia,
  solución integral, de vanguardia, innovador.
- Estructuras gastadas: tríadas por reflejo ("rápido, simple y eficiente"), "No es X, es
  Y" más de una vez por pieza, preguntas retóricas en cadena, cierres tipo "¿Estás listo
  para dar el salto?".
- Emojis en pantalla, hashtags en pantalla, signos de exclamación múltiples.
- Frases que no dicen nada verificable. Cada frase tiene que nombrar una acción, un dato
  o una situación concreta del cliente.

## Visuales prohibidos

**Tipografía:** efecto máquina de escribir; texto que rebota; letras que giran; subtítulos
karaoke con cada palabra pintada; más de dos familias tipográficas; texto con sombra negra
dura o contorno; mayúsculas sostenidas en frases largas.

**Movimiento de plantilla:** bounce/elastic en titulares; zoom-in con blur radial como
transición; glitch, VHS, RGB split gratuito; whip pan de stock; logo 3D girando; todo
entrando con el mismo fade + slide; transiciones de cortina, cubo o página; easing lineal;
"Ken Burns" sobre cualquier cosa sin motivo.

**Estética genérica de IA:** personas, manos o caras generadas por IA; video generativo con
morphing; robots, cerebros brillantes, circuitos azules, hologramas; partículas y lens
flares de stock; neón saturado sin control; mockups con texto ilegible o inventado;
interfaces falsas con lorem ipsum; métricas inventadas; composición estática sin
profundidad ni cámara.

**Composición:** texto pegado a los bordes o fuera de zona segura; más de un mensaje por
escena; pantallas quietas más de 2,5 s sin ningún movimiento de cámara o elemento; íconos
de estilos mezclados.

## Nota sobre centrado vs "todo centrado y estático"
Texto centrado **no** significa composición plana. Mantener profundidad: capas con
parallax, push-in de cámara continuo, elementos de apoyo que entran desde distintas
profundidades, desenfoque de fondo. El centrado es del texto, no de la vida de la escena.

## QA obligatorio antes de entregar

1. Correr `python3 scripts/anti_slop_check.py <archivos del proyecto>` (textos, guiones,
   subtítulos, componentes). Tiene que salir sin errores.
2. Renderizar la hoja de contactos del video (1 frame por segundo) y revisar a ojo:
   - [ ] Ningún título tiene texto chico encima.
   - [ ] Ningún texto en pantalla tiene — o –.
   - [ ] Todos los titulares tienen un único color.
   - [ ] Todo el texto está centrado y dentro de la zona segura.
   - [ ] Ninguna transición o entrada se ve como preset.
   - [ ] No hay imágenes de IA genéricas, datos inventados ni texto ilegible.
3. Si algo falla, se corrige y se vuelve a renderizar. No se entrega con "detalles menores".
