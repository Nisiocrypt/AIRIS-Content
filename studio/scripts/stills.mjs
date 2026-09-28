// Renderiza fotogramas sueltos de varias composiciones con un solo bundle y un solo navegador.
// Uso: node scripts/stills.mjs V1-ManosOcupadas:30,120,400 V2-MenosAusencias:50,300
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const BROWSER = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const outDir = path.resolve(process.env.OUT ?? "../output/stills");
const jobs = process.argv.slice(2).map((a) => {
  const [id, frames] = a.split(":");
  return { id, frames: frames.split(",").map(Number) };
});

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const browser = await openBrowser("chrome", { browserExecutable: BROWSER });
for (const job of jobs) {
  const composition = await selectComposition({ serveUrl, id: job.id, puppeteerInstance: browser, browserExecutable: BROWSER });
  const dir = path.join(outDir, job.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const frame of job.frames) {
    await renderStill({ composition, serveUrl, frame, output: path.join(dir, `f${String(frame).padStart(4, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser, browserExecutable: BROWSER });
  }
  console.log("ok", job.id);
}
await browser.close({ silent: true });
