# AIRIS Studio (Remotion)

Motion graphics de AIRIS hechos con código. Cada video es una composición de Remotion
(React) y su banda sonora se sintetiza en Python con los mismos tiempos.

## Estructura

```
src/brand/        valores de marca (colores, curvas, zona segura), fuentes, trazos del logo
src/components/   librería de marca: fondos, hebras de luz, cámara, titulares con máscara,
                  glass, burbujas, tarjetas de llamada/resultado/persona, notificación,
                  logo, cierre, transiciones
src/videos/       V1 a V8 (cada archivo exporta sus tiempos clave: V1 = {...})
audio/            engine.py (síntesis), sfx.py (efectos), build.py (partitura y mezcla)
guiones/          guion de cada video + README con la matriz de la prueba
scripts/          stills.mjs (fotogramas de control), sheet.py, render_all.sh
public/           fuentes (OFL), logo, texturas de grano
```

## Comandos

```bash
npm i                                   # una vez
npx remotion studio                     # previsualizar
node scripts/stills.mjs V1-ManosOcupadas:0,120,450   # fotogramas sueltos
python3 audio/build.py v1               # banda sonora de un video
./scripts/render_all.sh                 # render final de los 8 con audio
```

El entorno cloud no deja descargar el navegador de Remotion: `remotion.config.ts` usa el
Chromium local (`REMOTION_BROWSER` para cambiarlo).

## Reglas

Todo lo que se agregue pasa por las skills `anti-slop`, `airis-design-philosophy` y
`airis-motion-graphics`, y por `python3 ../scripts/anti_slop_check.py src guiones`.

## Licencias

- Remotion: gratis para equipos de hasta 3 personas (remotion.pro/license).
- Unbounded y Poppins: SIL Open Font License.
- Íconos: Lucide (ISC).
- Música y efectos: sintetizados por `audio/`, originales.
