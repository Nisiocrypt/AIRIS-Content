import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const faces: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Unbounded", file: "unbounded-latin-500-normal.woff2", weight: "500" },
  { family: "Unbounded", file: "unbounded-latin-600-normal.woff2", weight: "600" },
  { family: "Unbounded", file: "unbounded-latin-700-normal.woff2", weight: "700" },
  { family: "Unbounded", file: "unbounded-latin-800-normal.woff2", weight: "800" },
  { family: "Unbounded", file: "unbounded-latin-900-normal.woff2", weight: "900" },
  { family: "Poppins", file: "poppins-latin-400-normal.woff2", weight: "400" },
  { family: "Poppins", file: "poppins-latin-500-normal.woff2", weight: "500" },
  { family: "Poppins", file: "poppins-latin-500-italic.woff2", weight: "500", style: "italic" },
  { family: "Poppins", file: "poppins-latin-600-normal.woff2", weight: "600" },
  { family: "Poppins", file: "poppins-latin-700-normal.woff2", weight: "700" },
];

let fontsPromise: Promise<void> | null = null;
export let fontsLoaded = false;

/**
 * Registra y carga las fuentes de marca. Devuelve una promesa que se resuelve cuando todas
 * están listas (loadFont agrega la fuente al documento recién después de descargarla, así
 * que document.fonts.check() no sirve para saber si ya se puede medir texto).
 */
export const ensureFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      faces.map((f) =>
        loadFont({
          family: f.family,
          url: staticFile(`fonts/${f.file}`),
          weight: f.weight,
          style: f.style ?? "normal",
        }),
      ),
    ).then(() => {
      fontsLoaded = true;
    });
  }
  return fontsPromise;
};
