# Música gratis para anuncios de AIRIS

Decisión actual: los 9 videos de la tanda 1 usan temas de **Mixkit** (uso comercial y en
anuncios online, sin atribución). La cama sintetizada por código sonaba a efectos, no a
música. Detalle por video en `assets/music/LICENSE.md`.

FreePD (dominio público) cerró en 2026: su web ya no ofrece descargas y los espejos que
quedan en archive.org no tienen un origen confiable (uno mezcla audio de la BBC). Pixabay
bloquea las descargas desde el entorno de trabajo; se puede bajar a mano.

| Biblioteca | Licencia | ¿Sirve para anuncios pagos? | Atribución | Notas |
|---|---|---|---|---|
| **FreePD** | CC0, dominio público | Sí | No hace falta | Cerró en 2026, ya no se puede bajar |
| **Pixabay Music** | Licencia de Pixabay | Sí, uso comercial permitido | No hace falta | Algunos temas disparan reclamos automáticos en YouTube: se resuelven con el certificado de licencia de Pixabay (guardarlo al descargar). No se puede registrar el tema a tu nombre |
| **Mixkit** | Licencia de Mixkit | Sí, incluye anuncios online | No hace falta | Buen catálogo corporativo y tech. No se pueden redistribuir los archivos sueltos. **La que usamos** |
| **Uppbeat** | Gratis con crédito; sin crédito desde 6,99 USD/mes | Gratis solo con atribución | Sí en el plan gratis | Tiene una categoría específica de música comercial y promo |
| **Biblioteca de audio de YouTube** | Depende de cada tema | No es seguro fuera de YouTube | Según el tema | No usar para anuncios en Instagram |
| **Suno gratis** | No comercial | No | Sin permiso comercial | Tampoco se vuelve comercial si después pagás |

## Cómo usarlas

1. Buscar por clima: "corporate", "tech", "minimal", "inspiring", "ambient". Evitar temas con
   ukelele, silbidos o palmas (suenan a video genérico, ver skill `anti-slop`).
2. Anotar tema, autor, link y fecha en `assets/music/LICENSE.md`. El mp3 va en
   `assets/music/` (no se sube al repositorio) y se agrega a `studio/audio/fetch_music.sh`
   si es de Mixkit.
3. Asignarlo al video en `studio/audio/tracks.json` (`file`, `start` en segundos desde
   donde arranca el tramo, opcionales `gain_db`, `duck_db` y `mute` en frames).
   `build.py` lo recorta a la duración exacta, lo baja cuando suena un efecto, hace el
   fundido final y deja todo en -14 LUFS. En el 07 y el 09 el tema entra recién en el
   giro de la historia.
4. Volver a mezclar sin renderizar: `python3 studio/audio/build.py v3` y reemplazar el
   audio del mp4 con ffmpeg (`-c:v copy`).

## Fuentes

- Pixabay: [Licencia de contenido](https://pixabay.com/service/license-summary/), [Reclamos de Content ID](https://pixabay.com/blog/posts/how-to-clear-a-youtube-content-id-claim-with-a-pix-190/)
- [Mixkit](https://mixkit.co/free-stock-music/), [licencia](https://mixkit.co/license/) · [Uppbeat, música comercial](https://uppbeat.io/music/category/commercial)
- [Comparativa de bibliotecas gratis 2026](https://swarmify.com/blog/free-music-for-your-videos-the-importance-and-where-to-find/)
- [Biblioteca de YouTube fuera de YouTube](https://usethirdchair.com/blog/can-you-use-youtube-audio-library-music-on-instagram)
- [Suno: derechos y propiedad](https://help.suno.com/en/categories/550145-rights-ownership)
