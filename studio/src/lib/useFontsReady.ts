import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { ensureFonts, fontsLoaded } from "../brand/fonts";

/**
 * Devuelve true cuando las fuentes de marca están cargadas. Mientras tanto frena el render,
 * así las medidas de texto (fitText) se hacen con la fuente real y nunca con la de reemplazo
 * (measureText cachea sus resultados, así que medir antes de tiempo deja el error fijo).
 */
export const useFontsReady = () => {
  const [ready, setReady] = useState(fontsLoaded);
  useEffect(() => {
    if (ready) return;
    const handle = delayRender("Esperando fuentes de marca");
    ensureFonts()
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [ready]);
  return ready;
};
