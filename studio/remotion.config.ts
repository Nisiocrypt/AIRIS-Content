/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");

// El entorno no permite descargar el navegador de Remotion: usamos el Chromium local.
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ??
    "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
);
