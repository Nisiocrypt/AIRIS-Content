# Análisis de airisautomation.com (sept. 2026)

Relevamiento hecho con Chromium headless: 13 páginas clave capturadas en escritorio
(1440×900) y mobile (390×844), más extracción de estilos computados (fuentes, colores,
recetas de glass, radios, sombras). El sitio tiene 52 URLs en el sitemap.

Capturas:
- Primera pantalla de cada página: `docs/reference/web/primera-pantalla/`
- Páginas completas (reducidas, en columnas): `docs/reference/web/pagina-completa/`
- Todas las primeras pantallas mobile en una hoja: `docs/reference/web/mobile-primera-pantalla-todas.jpg`
- Logo, favicon y OG image: `assets/brand/`

Nota: los huecos en blanco en las capturas de página completa son secciones que se
animan al entrar en pantalla (scroll reveal); en el sitio real aparecen bien.

## 1. Filosofía de marca (lo que el sitio comunica)

**Idea central:** "Procesos antes que bots". AIRIS no vende un chatbot, vende *AI
Operations*: sistemas que entienden un mensaje, ejecutan una acción aprobada, dejan
registro y derivan a una persona cuando hace falta criterio.

**Pilares que se repiten en todas las páginas:**
1. **Control humano.** "Sin perder control humano", "La IA ejecuta lo repetible. Las
   personas deciden lo sensible", handoff con contexto.
2. **Operación, no conversación.** "La conversación es solo la interfaz", "Responder no
   es lo mismo que operar", "Un mensaje entra. La operación continúa."
3. **Evidencia honesta.** El caso odontológico publica numeradores y denominadores,
   metodología, CSV descargable y una sección "Lo que este caso sí demuestra. Y lo que
   no." Cero promesas infladas.
4. **Medir antes, automatizar después.** Diagnóstico, línea de base, calculadoras de ROI.

**Voz:** rioplatense, directa, con humor seco y confianza. Ejemplos reales del sitio:
"RESCATAME" (botón del header), "Tu plata" (menú), "Construyendo Skynet para PyMEs",
"El futuro no espera a los que cargan excels", "Hablá con un humano (por ahora)",
"le saca protagonismo al clásico '¿che, alguien hizo esto?'", "Tu título universitario
no dice 'Administrativo Full-Time'". Frases cortas, afirmativas, con punto final.

**Audiencia:** PyMEs y profesionales independientes de salud y servicios en Argentina
(odontólogos, psicólogos, kinesiólogos, nutricionistas, clínicas estéticas), más
concesionarios e inmobiliarias. Versión en inglés para servicios en EE.UU.

## 2. Sistema visual

### Tipografía
- **Unbounded** (display, 600 a 900): todos los titulares. Ancha, geométrica,
  tracking levemente positivo (~1.5 px en H1 de 61 px), interlineado ajustado (~1.25).
- **Poppins** (texto y UI): cuerpo, botones secundarios, formularios.
- Monoespaciada (Courier New) para detalles técnicos puntuales.
- Titulares enormes: H2 de 65 a 86 px en escritorio, peso 800 a 900.
- Recurso firma: segunda línea del titular en **itálica** ("*sin perder control
  humano.*", "*a los que cargan excels.*").

### Color (valores extraídos)
| Rol | Valor |
|---|---|
| Violeta primario (botones) | `#7C3AED` (rgb 124,58,237) |
| Violeta intenso (Tailwind v4 violet-600/700) | `oklch(0.541 0.281 293)` ≈ `#7F22FE`, `oklch(0.491 0.27 292.6)` ≈ `#7008E7` |
| Lavanda (acentos en fondo oscuro) | `#A78BFA`, `#DDD6FE`, `#EDE9FE` |
| Cian (datos, estados "en vivo", barras) | `#67E8F9`, `#CFFAFE`, fondo `#083344` |
| Fondos oscuros | `#020618`, `#0F172B`, `#171223`, `rgba(10,12,28,0.9)` |
| Fondos claros | `#F8FAFC`, `#EEF2FF` con blobs de lavanda y cian |
| Texto oscuro | `#2E2E2E`, slate `oklch(0.372 0.044 257)` |
| Alertas | rojo `rgba(248,113,113,.85)`, ámbar `rgba(251,191,36,.75)` |
| Footer | gradiente violeta saturado `#6D28D9 → #4C1D95` con textura de manos |

### Glassmorphism tipo iOS (recetas reales del CSS)
- **Glass claro (tarjetas sobre fondo pastel):** `backdrop-filter: blur(40px) saturate(2)`,
  fondo `rgba(255,255,255,0.20 a 0.35)`, anillo interior `inset 0 0 0 1px
  rgba(255,255,255,0.3 a 0.5)`, sombra violeta `0 24px 80px -20px rgba(139,92,246,0.18)`,
  radio 24 a 32 px.
- **Glass chip / pill:** `blur(24px)`, fondo blanco 35%, borde 1px, radio total.
- **Glass oscuro (paneles de producto):** fondo `rgba(10,12,28,0.9 a 0.94)`, `blur(24px)`,
  borde `rgba(255,255,255,0.1)`, sombra `0 34px 90px rgba(35,16,69,0.28)`, radio 16 px.
- Radios usados: 12, 16, 24, 28, 32 px y pill (9999 px).

### Fondos y atmósfera
- Hero de la home: **canvas animado de hebras de luz** (azul → violeta → magenta) que
  cruzan en diagonal sobre negro. Es el elemento más cinematográfico del sitio.
- Secciones claras: degradés pastel lavanda y cian muy difusos (tipo wallpaper de iOS).
- Secciones oscuras: azul noche casi negro con glow violeta radial.
- Alternancia claro/oscuro para marcar ritmo entre secciones.

### Componentes firma (los más reutilizables en video)
1. **Mockup de conversación de WhatsApp** "en vivo" con avatar AIRIS, burbujas y
   resultado ("Turno confirmado", "Lead registrado", "Reclamo derivado").
2. **Flujo Entrada → Opera AIRIS → Resultado** en tres columnas con check final.
3. **Stat card de evidencia** (24,4% → 2,6% con barras antes/después).
4. **Mapa de conexiones** (WhatsApp, Instagram, Gmail → AIRIS → Notion, Stripe, HubSpot...).
5. **Tarjetas numeradas** (01, 02, 03) y comparativas en tabla oscura.
6. **CTA "¿Listo para Recuperar Tiempo?"** en bloque violeta.

## 3. Cómo se traduce al video

Qué heredar del sitio:
- Unbounded + Poppins, violeta `#7C3AED` como acento principal y cian como color de dato.
- Las tres recetas de glass tal cual (claro, chip, oscuro).
- Las hebras de luz del hero como textura de apertura y transiciones.
- Los componentes firma, animados (chat → acción → resultado).
- La voz: frases cortas, afirmativas, humor seco, honestidad con los datos.

Qué **no** heredar (reglas del usuario para video, ver skill `anti-slop`):
- Nada de etiquetas/eyebrows arriba de los títulos (en el sitio hay muchas:
  "IMPLEMENTACIÓN REAL", "RECURSOS Y GUÍAS"; en video quedan afuera).
- Nada de palabras clave pintadas de otro color (en el sitio "IA", "operaciones.",
  "ver cómo." van en violeta; en video, todo el titular en un solo color).
- Textos centrados en video (el sitio alinea muchos titulares a la izquierda).

## 4. Hallazgos técnicos en el sitio (para tu equipo web)

Verificados en Chromium a 390 px y 1440 px:
1. **H1 desbordado en mobile** en `/automatizacion-con-ia-para-clinicas/` y
   `/empresa-automatizacion-ia-argentina/`: la palabra "Automatización" a 46.8 px no
   entra; el H1 llega a x=459 px con viewport de 390 px y queda cortada.
2. **Corte de palabra sin guion** en `/automatizacion-para-odontologos/` mobile
   ("Automatiza / ción") por `overflow-wrap: break-word`. Mismo problema en el caso
   odontológico ("demuestr / a", "Privacida / d") en escritorio. Solución: bajar el
   `font-size` con `clamp()` o usar `hyphens: auto` con `lang="es"`.
3. **Stat card del caso** (escritorio 1440 px): el "2.6%" queda cortado por el borde de la
   tarjeta, y el titular deja un punto huérfano al inicio de línea (". Datos").
