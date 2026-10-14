# Entrena con Ciencia · Design System (V2)

Sistema de diseño del canal **Entrena con Ciencia (ECC)**: fitness y nutrición basados en evidencia,
presentados por un médico, para audiencia LATAM en español neutro (país base: Perú).

El producto real del canal es **contenido short-form vertical de 60–90 s** (Reels de Instagram, Shorts
de YouTube, TikTok) más las **guías descargables** que se piden por comentario ("comenta PESO",
"comenta PROTE"). Todo el sistema está construido alrededor de una promesa: *cada afirmación se
rastrea a un estudio real, citado por PMID.* La marca no vende transformación milagrosa; vende
confianza verificable.

## Superficies representadas

| Superficie | Dónde vive | Qué es |
|---|---|---|
| Contenido social | `ui_kits/social/` | Covers de Reel (1080×1920), gráficos en pantalla y carrusel de 5 láminas (1080×1350). |
| Sitio del canal | `ui_kits/web/` | Landing con parrilla de videos, ficha de estudio y captura de guías. |

## Fuentes recibidas

- `uploads/isotipo_ecc_navy_plano_1920x1080.png` — isotipo (átomo + mancuerna) en cyan sobre navy
  plano. Única pieza gráfica entregada. Se recortó y se extrajo con fondo transparente a
  `assets/isotipo-ecc.png` y con cuadro navy a `assets/isotipo-ecc-navy.png`.
- `assets/brand-color-amarillo.png` — ficha de color entregada por la marca: **#FFC300** (RGB 255/195/0).
  Es el `--gold-400` del sistema y el único color de acento que no se derivó del isotipo.
- Skills de contenido del canal ya instaladas en el proyecto, usadas como fuente de verdad para tono,
  estructura y reglas editoriales: `ecc-guiones-shorts` (guiones), `ecc-captions-instagram`
  (descripciones), `ecc-brief-cientifico` (validación de evidencia).
- **No se entregaron:** logotipo/wordmark, archivos de fuente, fotografía de marca, capturas de las
  cuentas, código de sitio web, Figma. Todo lo visual fuera del isotipo es una propuesta construida a
  partir del isotipo y de las reglas editoriales; ver CAVEATS al final.

---

## CONTENT FUNDAMENTALS

Cómo se escribe en ECC. Las reglas salen de las skills del canal, no de convenciones genéricas.

**Idioma y persona.** Español neutro LATAM, sin voseo ("tú tienes", nunca "vos tenés") y sin
regionalismos de un solo país. Tuteo directo al viewer: **"tú", no "yo"**. La marca habla en plural
cuando se refiere a sí misma ("te enviamos la guía", "síguenos"). El registro es de médico que le
explica a un amigo, no de paper ni de coach motivacional.

**Estructura narrativa.** Toda pieza sigue el mismo arco: creencia común → negación → estudio →
resultado en cifras → recomendación práctica → CTA. Los moldes verbales son literalmente reutilizables:

- "Muchas personas creen que… Pero lo que no saben es que…"
- "La única diferencia fue que…"
- "¿El resultado?"
- "Por eso te recomiendo…"
- "Hoy te voy a explicar…" / "Te explico qué dice la ciencia" (nunca "te digo")

**Painpoint antes que tecnicismo.** En la puerta de entrada (cover, hook, titular) se habla del dolor
visible del viewer: *peso, energía, verse mejor, levantar más*. Los tecnicismos (composición corporal,
grasa vs músculo, efecto agudo) van en el cuerpo. Ejemplo aprobado: el cover
"¿Ayuno = Perder Peso Más Rápido?" gana a "¿Ayuno = Más Grasa Quemada?".

**Contraste de la tinta.** Todo token de texto pasa AA para texto pequeño (4.5:1) sobre su superficie:
sobre `--surface-page` strong 17.6 · body 10.8 · muted 6.0 · faint 4.6 · link 4.5. `--text-faint` es el
piso, no un gris decorativo: si un metadato necesita ser más tenue, se reduce su tamaño, no su contraste.

**Casing.** Copy en frase normal ("Dormir 5.5 h cambia de dónde sale el peso"). MAYÚSCULAS solo en dos
lugares: los covers/titulares tipográficos (Bricolage Grotesque condensado) y los rótulos mono
(`.ecc-label` a 11 px y `.ecc-eyebrow` a 10 px: PARTICIPANTES, DISEÑO, DURACIÓN). Nunca una frase
entera en mayúsculas dentro de un párrafo.

**Cifras.** Siempre salen del estudio, nunca de memoria, y se traducen a equivalentes cotidianos:
"200 a 400 mg, o sea 2 a 3 cafés"; "112 g de proteína, como una pechuga grande más dos huevos".
Formato de resultado: **cifras primero, conclusión al final.**

**Longitudes.** Cover 2–5 palabras. Guion hablado ~200 palabras (techo firme 230). Caption educativo
250–350 palabras; caption SEO 80–150. Párrafos de 1 a 3 frases, mayormente sin punto final.
Sin viñetas dentro del cuerpo, sin negritas ni cursivas en captions, **sin hashtags**.

**Emoji.** Uso puntual y corto, solo este set: 📲 📈 💡 💬 🔬 👨🏽‍🔬. Aparecen casi siempre pegados al
CTA ("📲 Si quieres entrenar basándote en evidencia y no en mitos, síguenos"). Nunca emoji decorativo
en tarjetas, botones, títulos ni en la interfaz del sistema.

**CTAs canónicos.**
- "Y si quieres ver más videos como este, síguenos."
- "📲 Si quieres entrenar basándote en evidencia y no en mitos, síguenos en Entrena con Ciencia"
- "💬 Comenta PESO y te enviamos nuestra guía de déficit calórico" (pérdida de peso, dieta, cardio)
- "💬 Comenta PROTE y te enviamos nuestra guía de proteína" (proteína, timing, síntesis)

**Citas.** Siempre **PMID** (`PMID: 20921542`), DOI solo si el estudio no está en PubMed, prensa y
organismos citados como aparecen. Nunca fabricar un PMID. Los matices, dosis raras y limitaciones del
estudio van al **comentario fijado**, no al cuerpo.

**Lo que nunca se escribe.** Promesas mágicas, superlativos de marketing, cadenas especulativas
("más fuerza → más músculo garantizado"), lenguaje de urgencia, ni claims médicos individuales
(el pie de página recuerda que el contenido es informativo).

---

## VISUAL FOUNDATIONS

### Idea rectora
El isotipo ya contiene la tesis de la marca: **átomo + mancuerna**, laboratorio y gimnasio. El sistema
la extiende con un solo gesto: superficie navy con atmósfera de laboratorio, tipografía condensada de
gimnasio y un resaltador amarillo que marca el dato verificado. Nada más brilla.

Dos reglas de acabado gobiernan todo:

**Ninguna superficie es plana.** Un navy sólido se lee como plantilla; el navy de ECC siempre lleva
degradado, trama de 34 px y halo cyan (`.ecc-atmos`), más la capa de grano global. Toda superficie
oscura elevada lleva 1 px de luz en su borde superior (`--edge-top`).

**Ninguna superficie se apoya directamente sobre el fondo.** Toda tarjeta va en **doble bisel**: una
carcasa con su propio filo y radio de 32 px, y dentro un núcleo con su fondo, su realce superior y un
radio concéntrico calculado (32 − 6 = 26 px). Es lo que hace que una pieza se lea como hardware
mecanizado y no como un rectángulo con sombra. Ver `.ecc-bezel` / `.ecc-bezel-core`.

### Color
- **Navy** es el color de la marca, tomado del fondo del isotipo original: `--navy-700 #224277`.
  La escala tiene 14 pasos y baja a `--navy-975 #060C18` (el suelo de los bloques de evidencia) y sube
  a `--navy-025 #F8FAFD` como fondo de página.
- **Cyan** `--cyan-400 #6DCDF2` es el color del propio isotipo: se usa para datos, enlaces, PMID y el
  indicador de pestaña activa. Sobre navy siempre `--cyan-300`.
- **Amarillo** `--gold-400 #FFC300` es el resaltador de evidencia: la cifra del resultado, la palabra
  clave del cover, el CTA principal, el filete `.ecc-rule` que abre un bloque. Es el color entregado por
  la marca (`assets/brand-color-amarillo.png`). Regla dura: **un solo elemento amarillo por lienzo.**
- **El amarillo cambia de comportamiento según el fondo**, y esto no es negociable:
  - **Sobre navy es texto.** `#FFC300` sobre `--navy-900` da 9.7:1 (11.4:1 sobre `--navy-950`). Ahí van las cifras hero, la palabra
    clave del cover y los titulares resaltados.
  - **Sobre claro es relleno, nunca texto.** Amarillo sobre blanco da 1.61:1 (1.54:1 sobre `--surface-page`), y oscurecerlo hasta que se
    lea deja de ser amarillo (se vuelve mostaza). El gesto correcto es `.ecc-mark` (relleno `#FFC300`
    con tinta navy, como un subrayador) o `.ecc-underline` (texto navy con banda amarilla baja).
  - `--accent-evidence-deep` (`--gold-600`, 3.1:1 sobre claro) existe solo para filetes, bordes de 2–3 px
    y hairlines. **Nunca como color de texto** — tampoco `--gold-700`.
  - `StatFigure` con `onDark={false}` y `tone="evidence"` aplica esta regla solo: pasa la cifra a relleno.
- **Coral** `--coral-400 #FF6650` es exclusivo del mito o la creencia falsa. Nunca decorativo, nunca
  como color de error genérico salvo en formularios.
- Máximo dos fondos por pieza: claro (`--surface-page`) y navy (`--ground-navy`). Sin terceros tonos.
- **No hay gradientes de color a color.** Los únicos permitidos son navy → navy más oscuro
  (`--ground-navy`, `--ground-void`), los halos de baja opacidad (`--glow-cyan`, `--glow-gold`) y los
  scrims de protección.

### Tipografía
Tres familias variables, cada una con un trabajo:

| Rol | Familia | Uso |
|---|---|---|
| Cover / display | **Bricolage Grotesque** 700–800, eje `wdth` | Covers 74–138 px, h1–h2, cifras hero, el wordmark. Ninguna fuente del sistema está en la lista negra del skill (Inter, Roboto, Arial, Open Sans, Helvetica). |
| Interfaz y cuerpo | **Instrument Sans** 400–700 | h3–h4, párrafos 18/16/14, botones, nav. Medida 64ch, `leading 1.58`. |
| Datos y citas | **JetBrains Mono** 400–600 | PMID, n, dosis, duraciones, rótulos `.ecc-label` y "con Ciencia" del lockup. |

Lo que hace distinta la tipografía de ECC es **el eje de ancho**: Bricolage Grotesque es variable en
`wdth`, así que el condensado de los covers es real, no una familia aparte. Tres ajustes fijos:

- `--vf-cover` → `wdth 76, opsz 96` — covers y cifras hero (clase `.ecc-cover`).
- `--vf-display` → `wdth 84, opsz 72` — **h1 y h2 lo reciben en `base.css`**, más el wordmark.
- `--vf-heading` → `wdth 92, opsz 24` — h3, h4 y titulares de interfaz.

`h1,h2` y `h3,h4` son dos reglas separadas a propósito. Agruparlas dejaba a los titulares display con
`opsz 24`, que es el eje óptico de un texto de interfaz aplicado a un titular de 46 px.

Tracking óptico: cuanto más grande el texto, más cerrado (`-0.022em` en cover, `0` en cuerpo, `+0.15em`
en rótulos mono). Números siempre tabulares (clase `.ecc-num`). La condensada nunca se usa en párrafos;
el mono nunca se usa para texto corrido.

**Tipo en lienzos de 1080 px:** los componentes de interfaz traen tamaños de pantalla. En Reels y
carrusel hay que pasarles `scale` (`StudyMeta scale={2.4}`, `MythBuster scale={2.3}`) o el texto queda
ilegible en el móvil.

### Espaciado y layout
Escala base 4 px (`--space-1` … `--space-40`). Ritmo real: 24 px de padding de tarjeta, 16 px entre
elementos apilados, 8 px entre elementos en línea. Contenedor web 1160 px.

**El aire entre secciones es macro.** `--gap-section` son 96 px y `--gap-section-xl` 160 px, este
último para el corte entre actos (hero → archivo, archivo → captura). La página respira fuerte; 80 px
contra un contenedor de 1160 px quedaba apretado.

Los bloques abren con `.ecc-rule` (filete amarillo de 56×3 px) o con un **eyebrow** `.ecc-eyebrow`
(píldora mono de 10 px, tracking `.2em`, mayúsculas), nunca con un título suelto.

**Navegación en isla.** El header no se pega al borde superior: es una píldora de vidrio despegada,
centrada y del ancho de su contenido (`.ecc-island`, `position: sticky`, `top: 24px`). Lleva la
hamburguesa que se transforma en X y abre un menú a pantalla completa con vidrio pesado y entrada
escalonada de los enlaces. Se cierra con la X, con Escape o con clic en el fondo.

**Parrilla bento.** El archivo de videos no es una rejilla simétrica de 3 columnas: es un bento de 12
columnas con piezas de tamaño distinto (`.ecc-bento`, `.ecc-bento-feature` 7 col × 2 filas,
`-wide` 5 col, `-third` 4 col).

**Colapso móvil (regla universal).** Por debajo de 768 px ninguna asimetría sobrevive: los spans del
bento se resetean a una columna, `.ecc-split` pasa a columna única, `.ecc-cols` del pie a dos, la
navegación en línea y el CTA de la isla desaparecen (queda la hamburguesa) y el margen lateral baja de
32 px a 16 px (`.ecc-pad`). Los titulares grandes usan `clamp()`, nunca un tamaño fijo.

Los lienzos sociales tienen margen fijo de 64–88 px (`1080 px` de ancho); ahí el logo va fijo arriba a
la izquierda y el PMID abajo.

### Bordes, radios y tarjetas
Hairline de 1 px (`--border-subtle #E2EAF5` en claro, `rgba(255,255,255,.13)` sobre navy). Nunca gris
neutro: siempre teñido de navy.

**Radios:** xs 4 · sm 10 · md 16 · lg 24 · **shell 32** · pill 999. Los controles son píldoras
completas (`--radius-control` = pill) y las tarjetas usan la carcasa de 32 px (`--radius-card`). El
núcleo del doble bisel **no se estima**: es `calc(var(--radius-shell) - var(--bezel-pad))`, para que
las curvas queden concéntricas.

**Toda tarjeta es doble bisel.** `Card` lo aplica por defecto; `bezel={false}` devuelve la versión
plana para casos anidados, donde un bisel dentro de otro se lee como ruido. Sobre claro la carcasa es
`--bezel-shell-light` con anillo `--bezel-ring-light`; sobre navy, las variantes `-dark`. El filete
izquierdo de 3 px existe (`Card accent`) pero se reserva al par mito/evidencia.

**Botones:** píldora, padding generoso (24 px a `md`), y el icono final **nunca va desnudo**: se anida
en su propio círculo al ras del padding derecho (`iconRight`). En hover ese círculo se desplaza en
diagonal y crece un punto; el botón entero se hunde a `scale(.98)` al presionar.

### Sombras
Tres pasos, **ambientales**: difusión muy abierta y larga (24–96 px), tintada de navy, sin caída dura
ni negro puro. La sombra sugiere aire alrededor de la pieza, no un objeto recortado sobre una mesa.
`--shadow-sm` (reposo), `--shadow-md` (formularios y flotantes), `--shadow-lg` (hover de tarjeta
clicable). Sobre navy la elevación la dan `--edge-top` + `--shadow-on-dark` más el filo de la carcasa
del bisel.

**Capas.** No hay z-index arbitrarios. Cada valor nombra un estrato: `--z-base` 0 · `--z-raised` 1 ·
`--z-grain` 2 · `--z-nav` 20 · `--z-overlay` 40 · `--z-tooltip` 60. Nada fuera de esa lista crea
contexto de apilado propio.

### Fondos, texturas e imagen
- **Atmósfera** (`.ecc-atmos`): la superficie navy por defecto. Degradado `--ground-navy` + trama de
  34 px + `--glow-cyan` arriba a la izquierda + `--glow-gold` abajo a la derecha. Va en heroes,
  covers, láminas y tarjetas `theme="deep"`.
- **Trama blueprint**: rejilla técnica de 34 px a 1 px, `rgba(154,241,254,.07)` sobre navy
  (`.ecc-grid`). Sobre fondo claro (`.ecc-grid-light`) solo en bloques sin texto.
- **Grano** (`.ecc-grain-layer`): **una sola capa fija por documento**, sin eventos de puntero, que
  monta el runtime (`__eccGrain()`). Adjuntar ruido a cada superficie que scrollea fuerza repintado
  continuo de GPU; fijo al viewport se compone una vez.
  **Excepción única:** los lienzos sociales se exportan como imagen y una capa fija del viewport no
  entraría en esa exportación, así que ahí el grano sigue siendo interno (`.ecc-grain-canvas`). No
  scrollean, así que no hay repintado que evitar.
- **Sin ilustración**. La marca no usa ilustración hand-drawn ni iconografía decorativa grande.
- **Fotografía**: no se entregó ninguna. Cuando exista, el criterio es fotograma real de gimnasio o
  laboratorio, frío y contrastado, sin grano ni filtros cálidos, y **siempre** bajo scrim
  (`--scrim-bottom`) o caja opaca antes de poner texto encima. Texto suelto sobre imagen: prohibido.
- **Transparencia y blur**: **solo sobre elementos `fixed` o `sticky`**. Nunca sobre contenido que
  scrollea: el filtro se recalcula en cada frame de scroll y hunde el rendimiento en móvil. Los dos
  únicos usos son la isla de navegación (`--surface-island` + `blur(20px)`) y el menú overlay
  (`blur(40px)`), ambos fijos. Las cajas de dato sobre fotograma de los lienzos sociales llevan blur
  porque son lienzos estáticos de exportación, no superficies que scrollean.

### Movimiento
Física de resorte, nunca curvas por defecto. **`--ease-fluid cubic-bezier(.32,.72,0,1)`** es la curva
canónica: arranca rápido y frena largo, como se mueve una masa real. Ningún cambio de estado es
instantáneo: todo interpola.

Duraciones: 240 ms controles · 400 ms superficies y estados · 700 ms gestos largos · 900 ms
revelaciones. **`--ease-in-out` no existe en el sistema** — la curva simétrica es exactamente la que
delata una transición por defecto.

**Sólo se animan `transform` y `opacity`.** Nunca `top`, `left`, `width` ni `height`: disparan layout
en cada frame. `will-change` se pone únicamente mientras el elemento anima y se suelta al terminar.

**Sin bounces, sin parallax, sin auto-animaciones en loop.**

**Revelación por scroll.** Ningún elemento aparece estático. `.ecc-reveal` entra desde 64 px abajo,
desenfocado (`blur(12px)`) y a opacidad 0, y resuelve en 900 ms; `.ecc-reveal-1…5` escalonan de 60 en
60 ms. El desenfoque es transitorio y termina en 0, así que no queda ningún filtro vivo sobre
contenido que scrollea.

Lo dispara un **IntersectionObserver**, nunca un listener de `scroll` (ese corre en cada frame y
provoca reflow continuo). Un MutationObserver recoge los nodos que React monte después, porque React 18
hace commit de forma asíncrona y una sola pasada se los perdería.

**El estado oculto es opt-in del runtime.** Cuelga de `[data-ecc-motion]`, que marca `__eccReveal()` al
arrancar. Sin JS, con el JS caído o con `prefers-reduced-motion`, el contenido se ve: la animación es
una mejora, nunca un requisito para leer la página.

En video, la revelación de cifras es un corte o un fade rápido, nunca un conteo animado que distorsione
el dato.

### Estados
- **Hover** oscurece el relleno un paso (navy-700 → navy-800; gold-400 → gold-500); en variantes
  fantasma aparece un fondo `--navy-050`. Las tarjetas clicables suben 4 px y pasan a `--shadow-lg`.
  En botones con `iconRight`, el círculo interno se desplaza en diagonal y crece a `scale(1.05)`:
  la tensión cinética va dentro del botón, no en el botón entero. Nunca se aclara un sólido ni se
  cambia el color de la tipografía en hover.
- **Press** oscurece un paso más y el control se hunde a `scale(.98)` — escala, que es transform puro,
  no desplazamiento.
- **Focus** anillo cyan de 3 px `--ring-focus` (nunca outline del navegador, nunca amarillo).
- **Disabled** opacidad .45 y cursor `not-allowed`, sin cambio de color.
- **Selección de texto** amarillo con tinta navy (`::selection`).

---

## ICONOGRAPHY

No se entregó ningún set de iconos, fuente de iconos ni SVG con la marca. Estado y decisión:

- **Sustitución declarada:** **Phosphor Light** — trazo ultraligero y preciso, sin relleno.
  **Confirmar o reemplazar con el usuario.** Llega como **fuente de iconos** desde `tokens/fonts.css`,
  así que no hay paso de hidratación: el glifo pinta directo, también en nodos que React monte después.

  ```css
  @import url("https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css");
  ```
  ```jsx
  <i className="ph-light ph-download-simple" style={{fontSize:17}}></i>
  ```
- Iconos en uso: `arrow-left`, `arrow-right`, `arrow-up-right`, `bookmark-simple`, `share-network`,
  `dots-three`, `speaker-slash`, `envelope-simple`, `magnifying-glass`, `download-simple`, `play`,
  `microscope`, `push-pin`, `check-circle`, `warning`.
- Tamaños: 15–18 px en línea con texto y en botones, 20 px en `IconButton`, 24 px en navegación. El
  tamaño se controla con `font-size` y el color con `currentColor` — nunca amarillo, nunca un color
  de acento propio.
- **Por qué no Lucide.** El set anterior era Lucide a 2 px. Un trazo de 2 px sobre texto de 13–16 px
  pesa demasiado y arrastra la interfaz hacia lo genérico; Phosphor Light da la misma familia
  geométrica con un trazo que no compite con la tipografía.
- **El único activo gráfico propio es el isotipo** (`assets/isotipo-ecc.png`). No se dibujaron marcas,
  ilustraciones ni pictogramas nuevos: cuando falta un gráfico, el sistema usa tipografía o una cifra.
- **Unicode no se usa como icono.** Un glifo tipográfico en lugar del icono correcto (♪ por "silenciar",
  ★ por "guardar") es un error, no un atajo aceptable.
- **Emoji**: nunca como icono de interfaz. Solo en copy, con el set del canal (📲 💬 🔬 …).

---

## Intentional additions

No había inventario de componentes que copiar (no hay Figma ni código). Se autoró un set mínimo
estándar más cinco piezas propias del negocio del canal, cada una con una razón:

- `StatFigure` — la cifra del estudio es el elemento visual más repetido del canal.
- `StudyMeta` — la "carne metodológica" (n, grupos, protocolo, duración) es obligatoria en cada guion.
- `MythBuster` — el par creencia/evidencia es el motor narrativo de todo el contenido.
- `PmidRef` — la marca cita siempre por PMID; merece un componente con enlace a PubMed.
- `Callout` — replica el comentario fijado y las limitaciones del estudio.

---

## Índice del proyecto

**Raíz**
- `styles.css` — punto de entrada; solo `@import`s.
- `thumbnail.html` — tile del sistema.
- `readme.md` (este archivo), `SKILL.md` — guía portable para agentes.

**`tokens/`** — `fonts.css` (webfonts + iconos Phosphor), `colors.css`, `typography.css`,
`spacing.css`, `shape.css` (radios, doble bisel, sombras, capas), `motion.css`, `base.css` (reset,
titulares, `.ecc-bezel`, `.ecc-eyebrow`, `.ecc-reveal`, `.ecc-island`, `.ecc-bento`, `.ecc-split`,
grano fijo).

**`assets/`** — `isotipo-ecc.png` (transparente), `isotipo-ecc-navy.png` (cuadro navy).

**`guidelines/`** — 22 cards de fundamentos: Colors (navy, cyan, evidencia/mito, superficies, texto),
Type (cover, titulares, cuerpo, datos), Spacing (escala, en uso, radios, doble bisel, elevación, filo
de luz, revelación por scroll), Brand (isotipo, lockup, atmósfera, trama, protección de texto).

**`components/`**
- `core/` — `Button`, `IconButton`, `Badge`, `Tag`, `Card`, `Divider`, `Logo`, `Tabs`
- `content/` — `StatFigure`, `PmidRef`, `StudyMeta`, `MythBuster`, `Callout`
- `forms/` — `Input`, `Select`, `Checkbox`, `Switch`

**`ui_kits/`**
- `social/` — `ReelCover`, `ReelOverlay`, `CarouselDeck` + `index.html`
- `web/` — `SiteHeader`, `HomeHero`, `VideoGrid`, `LeadMagnet`, `StudyArticle`, `SiteFooter` + `index.html`
- `_ds_fallback.js` — dos trabajos. Permite abrir los kits y las cards aunque `_ds_bundle.js` no esté
  compilado (transpila los `.jsx` en el navegador), y expone el **runtime del sistema**:
  `__eccGrain()` monta la capa de grano fija y `__eccReveal()` arma la revelación por scroll.
  `__eccIcons()` se conserva porque las cards ya la llaman, y ahora solo invoca a las otras dos.

---

## PROCEDENCIA DE LAS REGLAS

Este sistema nació de la marca (isotipo, `#FFC300`, reglas editoriales del canal) y luego se pasó
entero por el skill **high-end-visual-design**, versionado en
`.claude/skills/high-end-visual-design/`. De ahí vienen, y no de la marca:

| Regla | Origen |
|---|---|
| Doble bisel en toda tarjeta | skill · §4A |
| Botón-en-botón y hover magnético | skill · §4B, §5B |
| Eyebrow en píldora antes de cada titular | skill · §4C |
| Aire de sección 96–160 px | skill · §4C |
| Isla flotante, hamburguesa que muta, overlay escalonado | skill · §5A |
| Revelación por scroll en todo elemento | skill · §5C |
| Curvas cubic-bezier propias, prohibido `ease-in-out` | skill · §2, §5 |
| Radios de 32 px y controles en píldora | skill · §2, §4A |
| Bento asimétrico en vez de rejilla de 3 columnas | skill · §3B |
| Phosphor Light en vez de Lucide | skill · §2 |
| Blur solo en `fixed`/`sticky`, grano en capa fija, z-index nombrados | skill · §6 |
| Colapso móvil universal por debajo de 768 px | skill · §3 |

**Lo que la marca conservó frente al skill:** la paleta completa, las tres familias tipográficas, la
regla del amarillo según fondo (texto sobre navy, relleno sobre claro), el coral exclusivo del mito, la
atmósfera navy, el filete `.ecc-rule` y las plantillas de los lienzos sociales.

**Lo que se descartó del skill:** el *Creative Variance Engine* (§3), que pide no repetir layout ni
estética entre piezas. Es la premisa opuesta a un sistema de marca: ECC necesita que un Reel se
reconozca como ECC al tercer frame, scrolleando. La varianza es virtud en el portfolio de una agencia
y defecto en un canal.

---

## CAVEATS

1. **Fuentes sustituidas.** No se entregaron binarios. Bricolage Grotesque / Instrument Sans /
   JetBrains Mono se cargan desde Google Fonts (`tokens/fonts.css`). Si la marca ya usa otras
   tipografías, reemplazar ese archivo por `@font-face` locales — pero conviene conservar una familia
   con eje `wdth`, porque los covers dependen de él.
2. **Wordmark reconstruido.** El lockup ("ENTRENA / con Ciencia") es tipográfico, no el logotipo real.
   Si existe archivo oficial, sustituirlo y ajustar `components/core/Logo.jsx`.
3. **Sin fotografía.** Los thumbnails y fotogramas son lienzos navy con tipografía.
4. **Iconos Phosphor Light** son una sustitución, no el set oficial. Se cargan como fuente de iconos
   desde unpkg; si la marca entrega un set propio, reemplazar el `@import` de `tokens/fonts.css`.
5. **Coral propuesto.** El amarillo `#FFC300` lo dio la marca; el coral de mito sigue siendo una
   decisión de sistema para separar "creencia falsa" de "hallazgo".
6. **El bundle es un artefacto compilado.** `_ds_bundle.js`, `_ds_manifest.json` y
   `_adherence.oxlintrc.json` los regenera automáticamente el compilador del proyecto a partir de los
   `.jsx` y los `tokens/*.css`; no se editan a mano. `_ds_fallback.js` solo transpila en el navegador
   si el bundle no expone `Button`, para poder abrir cards y kits fuera del proyecto.
7. **Namespace.** Los kits leen `window.EntrenaConCienciaDesignSystem_858058`. Ese sufijo lo asigna
   el proyecto: al mover el sistema a otro proyecto hay que reemplazarlo por el namespace nuevo.
