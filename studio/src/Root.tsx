import "./index.css";
import { Composition } from "remotion";
import { ensureFonts } from "./brand/fonts";
import { FPS, HEIGHT, WIDTH } from "./brand/tokens";
import { V1ManosOcupadas, V1_DURATION } from "./videos/V1ManosOcupadas";
import { V2MenosAusencias, V2_DURATION } from "./videos/V2MenosAusencias";
import { V3ContestarNoEsResolver, V3_DURATION } from "./videos/V3ContestarNoEsResolver";
import { V4UnDia, V4_DURATION } from "./videos/V4UnDia";
import { V5CheAlguienRespondio, V5_DURATION } from "./videos/V5CheAlguienRespondio";
import { V6Urgencia, V6_DURATION } from "./videos/V6Urgencia";
import { V7Contestador, V7_DURATION } from "./videos/V7Contestador";
import { V8Titulo, V8_DURATION } from "./videos/V8Titulo";

ensureFonts();

const VIDEOS = [
  { id: "V1-ManosOcupadas", component: V1ManosOcupadas, duration: V1_DURATION },
  { id: "V2-MenosAusencias", component: V2MenosAusencias, duration: V2_DURATION },
  { id: "V3-ContestarNoEsResolver", component: V3ContestarNoEsResolver, duration: V3_DURATION },
  { id: "V4-UnDia", component: V4UnDia, duration: V4_DURATION },
  { id: "V5-CheAlguienRespondio", component: V5CheAlguienRespondio, duration: V5_DURATION },
  { id: "V6-Urgencia", component: V6Urgencia, duration: V6_DURATION },
  { id: "V7-Contestador", component: V7Contestador, duration: V7_DURATION },
  { id: "V8-Titulo", component: V8Titulo, duration: V8_DURATION },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {VIDEOS.map((v) => (
        <Composition key={v.id} id={v.id} component={v.component} durationInFrames={v.duration} fps={FPS} width={WIDTH} height={HEIGHT} />
      ))}
    </>
  );
};
