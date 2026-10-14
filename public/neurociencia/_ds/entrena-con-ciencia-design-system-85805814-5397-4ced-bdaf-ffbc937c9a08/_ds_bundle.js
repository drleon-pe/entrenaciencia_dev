/* @ds-bundle: {"format":4,"namespace":"EntrenaConCienciaDesignSystem_858058","components":[{"name":"Callout","sourcePath":"components/content/Callout.jsx"},{"name":"MythBuster","sourcePath":"components/content/MythBuster.jsx"},{"name":"PmidRef","sourcePath":"components/content/PmidRef.jsx"},{"name":"StatFigure","sourcePath":"components/content/StatFigure.jsx"},{"name":"StudyMeta","sourcePath":"components/content/StudyMeta.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"CarouselDeck","sourcePath":"ui_kits/social/CarouselDeck.jsx"},{"name":"ReelCover","sourcePath":"ui_kits/social/ReelCover.jsx"},{"name":"ReelOverlay","sourcePath":"ui_kits/social/ReelOverlay.jsx"},{"name":"HomeHero","sourcePath":"ui_kits/web/HomeHero.jsx"},{"name":"LeadMagnet","sourcePath":"ui_kits/web/LeadMagnet.jsx"},{"name":"SiteFooter","sourcePath":"ui_kits/web/SiteFooter.jsx"},{"name":"SiteHeader","sourcePath":"ui_kits/web/SiteHeader.jsx"},{"name":"StudyArticle","sourcePath":"ui_kits/web/StudyArticle.jsx"},{"name":"VideoGrid","sourcePath":"ui_kits/web/VideoGrid.jsx"}],"sourceHashes":{"components/content/Callout.jsx":"817663857138","components/content/MythBuster.jsx":"6c35d661ffeb","components/content/PmidRef.jsx":"9b3a46d180de","components/content/StatFigure.jsx":"3119ecf79aff","components/content/StudyMeta.jsx":"9e871d28b76b","components/core/Badge.jsx":"7bd97a2bf8f8","components/core/Button.jsx":"83aa64e672b8","components/core/Card.jsx":"0be5757ef398","components/core/Divider.jsx":"f40ee51e2482","components/core/IconButton.jsx":"07d0d584fac1","components/core/Logo.jsx":"dd04210788bf","components/core/Tabs.jsx":"3ec581b9f36e","components/core/Tag.jsx":"c4457cf87390","components/forms/Checkbox.jsx":"6a2890ef978d","components/forms/Input.jsx":"e44b04049faf","components/forms/Select.jsx":"c1c3221778ee","components/forms/Switch.jsx":"61d77559198d","ui_kits/social/CarouselDeck.jsx":"2bca67aff28f","ui_kits/social/ReelCover.jsx":"c40bd431ca4e","ui_kits/social/ReelOverlay.jsx":"0991f438968e","ui_kits/web/HomeHero.jsx":"422f455bc649","ui_kits/web/LeadMagnet.jsx":"387d7942f758","ui_kits/web/SiteFooter.jsx":"ed51f0f200b3","ui_kits/web/SiteHeader.jsx":"85aa46d39e81","ui_kits/web/StudyArticle.jsx":"ee7c7db48e48","ui_kits/web/VideoGrid.jsx":"f52a24b6870d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EntrenaConCienciaDesignSystem_858058 = window.EntrenaConCienciaDesignSystem_858058 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const KINDS = {
  pinned: {
    bg: 'var(--ground-navy)',
    fg: 'var(--text-on-dark)',
    bd: 'var(--border-on-dark)',
    accent: 'var(--cyan-300)',
    label: 'Comentario fijado',
    edge: 'var(--edge-top)'
  },
  note: {
    bg: 'var(--navy-050)',
    fg: 'var(--text-body)',
    bd: 'var(--border-subtle)',
    accent: 'var(--cyan-600)',
    label: 'Nota',
    edge: 'none'
  },
  limit: {
    bg: 'rgba(222,59,38,.055)',
    fg: 'var(--text-body)',
    bd: 'rgba(222,59,38,.20)',
    accent: 'var(--coral-500)',
    label: 'Limitaciones',
    edge: 'none'
  },
  practice: {
    bg: 'rgba(255,195,0,.14)',
    fg: 'var(--text-strong)',
    bd: 'rgba(255,195,0,.55)',
    accent: 'var(--navy-900)',
    label: 'Aplicación práctica',
    edge: 'none'
  }
};
function Callout({
  kind = 'note',
  title = null,
  icon = null,
  children,
  style,
  ...rest
}) {
  const k = KINDS[kind] || KINDS.note;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-5)',
      background: k.bg,
      color: k.fg,
      border: 'var(--border-w-hair) solid ' + k.bd,
      borderRadius: 'var(--radius-md)',
      boxShadow: k.edge === 'none' ? 'none' : k.edge,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: k.accent,
      flexShrink: 0,
      display: 'flex',
      lineHeight: 1
    }
  }, icon) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 6,
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: k.accent
    }
  }, title || k.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      lineHeight: 'var(--leading-body)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Callout.jsx", error: String((e && e.message) || e) }); }

// components/content/MythBuster.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function MythBuster({
  myth,
  fact,
  mythLabel = 'Mito',
  factLabel = 'Lo que dice la ciencia',
  layout = 'stacked',
  scale = 1,
  style,
  ...rest
}) {
  const px = n => Math.round(n * scale);
  const cell = (labelTone, label, text, ink) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      padding: px(20),
      borderRadius: 'var(--radius-md)',
      background: labelTone === 'myth' ? 'rgba(222,59,38,.05)' : 'rgba(255,195,0,.14)',
      borderLeft: 'var(--border-w-heavy) solid ' + (labelTone === 'myth' ? 'var(--coral-400)' : 'var(--gold-400)')
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginBottom: px(8),
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-medium)',
      fontSize: px(11),
      lineHeight: 1.2,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: labelTone === 'myth' ? 'var(--coral-500)' : 'var(--navy-900)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: px(16),
      lineHeight: 'var(--leading-body)',
      letterSpacing: 'var(--tracking-tight)',
      color: ink,
      textDecoration: labelTone === 'myth' ? 'line-through' : 'none',
      textDecorationColor: labelTone === 'myth' ? 'rgba(222,59,38,.4)' : undefined,
      textDecorationThickness: labelTone === 'myth' ? '1px' : undefined
    }
  }, text));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: layout === 'side-by-side' ? 'row' : 'column',
      gap: px(12),
      background: 'var(--surface-card)',
      border: 'var(--border-w-hair) solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: px(12),
      boxShadow: 'var(--shadow-sm)',
      ...style
    }
  }, rest), cell('myth', mythLabel, myth, 'var(--text-muted)'), cell('fact', factLabel, fact, 'var(--text-strong)'));
}
Object.assign(__ds_scope, { MythBuster });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/MythBuster.jsx", error: String((e && e.message) || e) }); }

// components/content/PmidRef.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PmidRef({
  pmid,
  doi = null,
  label = null,
  onDark = false,
  linked = true,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const id = pmid ? 'PMID: ' + pmid : doi ? 'DOI: ' + doi : '';
  const href = pmid ? 'https://pubmed.ncbi.nlm.nih.gov/' + pmid + '/' : doi ? 'https://doi.org/' + doi : null;
  const Tag = linked && href ? 'a' : 'span';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: linked && href ? href : undefined,
    target: linked && href ? '_blank' : undefined,
    rel: "noreferrer",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 26,
      padding: '0 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-caption)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--tracking-mono)',
      textDecoration: 'none',
      color: onDark ? 'var(--cyan-300)' : 'var(--cyan-600)',
      background: onDark ? 'rgba(154,241,254,.07)' : 'var(--navy-050)',
      border: 'var(--border-w-hair) solid ' + (onDark ? 'var(--border-on-dark)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-xs)',
      filter: hover && linked && href ? 'brightness(1.08)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .7
    }
  }, label) : null, id);
}
Object.assign(__ds_scope, { PmidRef });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PmidRef.jsx", error: String((e && e.message) || e) }); }

// components/content/StatFigure.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  evidence: 'var(--gold-400)',
  myth: 'var(--coral-400)',
  info: 'var(--cyan-400)',
  navy: 'var(--navy-700)',
  light: 'var(--white)'
};
/* Sobre fondo claro el amarillo no se lee como texto (1.54:1): la cifra pasa a
   relleno amarillo con tinta navy, que es el gesto de resaltado de la marca. */
const LIGHT_TONES = {
  evidence: null,
  myth: 'var(--coral-500)',
  info: 'var(--cyan-700)',
  navy: 'var(--navy-700)',
  light: 'var(--navy-950)'
};
const SIZES = {
  sm: 44,
  md: 72,
  lg: 112,
  xl: 160
};
function StatFigure({
  value,
  unit = null,
  label = null,
  note = null,
  tone = 'evidence',
  size = 'md',
  onDark = true,
  align = 'left',
  style,
  ...rest
}) {
  const fs = SIZES[size] || SIZES.md;
  const fillOnLight = !onDark && tone === 'evidence';
  const ink = onDark ? TONES[tone] || TONES.evidence : fillOnLight ? 'var(--evidence-fill-ink)' : LIGHT_TONES[tone] || 'var(--navy-950)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
      gap: fs * 0.08,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: fs * 0.05,
      color: ink,
      background: fillOnLight ? 'var(--evidence-fill)' : 'transparent',
      padding: fillOnLight ? '0.02em 0.14em' : 0,
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-cover)',
      fontWeight: 'var(--weight-bold)',
      fontSize: fs,
      lineHeight: 'var(--leading-cover)',
      letterSpacing: 'var(--tracking-cover)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: fs * 0.42,
      fontWeight: 'var(--weight-semibold)'
    }
  }, unit) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: Math.max(13, fs * 0.19),
      fontWeight: 'var(--weight-medium)',
      lineHeight: 'var(--leading-snug)',
      letterSpacing: 'var(--tracking-tight)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)',
      maxWidth: '22ch'
    }
  }, label) : null, note ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-medium)',
      fontSize: Math.max(11, Math.round(fs * 0.16)),
      lineHeight: 1.3,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: onDark ? 'var(--text-on-dark-faint)' : 'var(--text-faint)'
    }
  }, note) : null);
}
Object.assign(__ds_scope, { StatFigure });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatFigure.jsx", error: String((e && e.message) || e) }); }

// components/content/StudyMeta.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StudyMeta({
  items = [],
  onDark = false,
  columns = null,
  scale = 1,
  style,
  ...rest
}) {
  const line = onDark ? 'var(--border-on-dark)' : 'var(--border-subtle)';
  const px = n => Math.round(n * scale);
  return /*#__PURE__*/React.createElement("dl", _extends({
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + (columns || items.length || 1) + ',minmax(0,1fr))',
      gap: 0,
      margin: 0,
      borderTop: 'var(--border-w-hair) solid ' + line,
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: it.label + i,
    style: {
      padding: px(16) + 'px ' + px(20) + 'px ' + px(16) + 'px 0',
      borderBottom: 'var(--border-w-hair) solid ' + line,
      borderLeft: i === 0 ? 'none' : 'var(--border-w-hair) solid ' + line,
      paddingLeft: i === 0 ? 0 : px(20)
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-medium)',
      fontSize: px(11),
      lineHeight: 1.2,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: onDark ? 'var(--text-on-dark-faint)' : 'var(--text-faint)',
      marginBottom: px(7)
    }
  }, it.label), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: px(14),
      lineHeight: 1.35,
      letterSpacing: 'var(--tracking-mono)',
      fontWeight: 'var(--weight-medium)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)'
    }
  }, it.value))));
}
Object.assign(__ds_scope, { StudyMeta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StudyMeta.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  evidence: {
    bg: 'var(--gold-400)',
    fg: 'var(--navy-950)',
    bd: 'transparent'
  },
  myth: {
    bg: 'var(--coral-400)',
    fg: 'var(--white)',
    bd: 'transparent'
  },
  info: {
    bg: 'var(--cyan-400)',
    fg: 'var(--navy-950)',
    bd: 'transparent'
  },
  neutral: {
    bg: 'var(--navy-100)',
    fg: 'var(--navy-700)',
    bd: 'transparent'
  },
  dark: {
    bg: 'var(--navy-900)',
    fg: 'var(--cyan-300)',
    bd: 'transparent'
  },
  outline: {
    bg: 'transparent',
    fg: 'var(--navy-700)',
    bd: 'var(--border-strong)'
  },
  outlineOnDark: {
    bg: 'transparent',
    fg: 'var(--cyan-300)',
    bd: 'var(--border-on-dark-strong)'
  }
};
function Badge({
  tone = 'neutral',
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      height: 26,
      padding: '0 12px',
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: t.fg,
      background: t.bg,
      border: 'var(--border-w-hair) solid ' + t.bd,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* El icono final nunca va desnudo al lado del texto: se anida en su propio
   circulo, al ras del padding interior derecho. En hover ese circulo se
   desplaza en diagonal y crece un punto, lo que genera la tension cinetica
   interna del boton mientras el boton entero se hunde al presionar. */
const SIZES = {
  sm: {
    minHeight: 40,
    padX: 18,
    fontSize: 'var(--text-body-sm)',
    gap: 8,
    dot: 24,
    inset: 4
  },
  md: {
    minHeight: 48,
    padX: 24,
    fontSize: 'var(--text-body-md)',
    gap: 10,
    dot: 32,
    inset: 6
  },
  lg: {
    minHeight: 56,
    padX: 30,
    fontSize: 'var(--text-body-lg)',
    gap: 12,
    dot: 38,
    inset: 7
  }
};
const VARIANTS = {
  primary: {
    bg: 'var(--navy-700)',
    fg: 'var(--white)',
    bd: 'transparent',
    hover: 'var(--navy-800)',
    active: 'var(--navy-900)',
    edge: 'var(--edge-top)',
    lift: 'var(--shadow-sm)',
    dot: 'rgba(255,255,255,.14)'
  },
  evidence: {
    bg: 'var(--gold-400)',
    fg: 'var(--accent-evidence-ink)',
    bd: 'transparent',
    hover: 'var(--gold-500)',
    active: 'var(--gold-600)',
    edge: 'inset 0 1px 0 rgba(255,255,255,.35)',
    lift: 'var(--shadow-sm)',
    dot: 'rgba(6,12,24,.12)'
  },
  outline: {
    bg: 'transparent',
    fg: 'var(--navy-700)',
    bd: 'var(--border-strong)',
    hover: 'var(--navy-050)',
    active: 'var(--navy-100)',
    edge: 'none',
    lift: 'none',
    dot: 'rgba(11,20,37,.06)'
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--navy-700)',
    bd: 'transparent',
    hover: 'var(--navy-050)',
    active: 'var(--navy-100)',
    edge: 'none',
    lift: 'none',
    dot: 'rgba(11,20,37,.06)'
  },
  onDark: {
    bg: 'var(--surface-glass-strong)',
    fg: 'var(--white)',
    bd: 'var(--border-on-dark-strong)',
    hover: 'rgba(255,255,255,.17)',
    active: 'rgba(255,255,255,.24)',
    edge: 'var(--edge-top-strong)',
    lift: 'none',
    dot: 'rgba(255,255,255,.12)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md,
    v = VARIANTS[variant] || VARIANTS.primary;
  const bg = disabled ? v.bg : press ? v.active : hover ? v.hover : v.bg;
  const live = !disabled;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: iconRight ? 'space-between' : 'center',
      minHeight: s.minHeight,
      gap: s.gap,
      fontSize: s.fontSize,
      /* Con icono final el padding derecho se cierra al inset para que el
         circulo quede al ras de la pildora. */
      paddingLeft: s.padX,
      paddingRight: iconRight ? s.inset : s.padX,
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-wide)',
      lineHeight: 1,
      color: v.fg,
      background: bg,
      border: 'var(--border-w-hair) solid ' + v.bd,
      borderRadius: 'var(--radius-pill)',
      boxShadow: disabled ? 'none' : [v.edge, press ? 'none' : v.lift].filter(x => x && x !== 'none').join(',') || 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : 1,
      /* Se hunde al presionar, no se desplaza: escala, que es transform puro. */
      transform: press && live ? 'scale(.98)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      minWidth: 0
    }
  }, iconLeft, children), iconRight ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: s.dot,
      height: s.dot,
      flexShrink: 0,
      borderRadius: 'var(--radius-pill)',
      background: v.dot,
      transform: hover && live ? 'translate3d(4px,-1px,0) scale(1.05)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-fluid)'
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Doble bisel (Doppelrand). Una tarjeta nunca se apoya plana sobre el fondo:
   va dentro de una carcasa con su propio filo y radio grande, y el nucleo
   lleva su fondo, su realce superior y un radio concentrico calculado
   (--radius-shell menos el padding de la carcasa). Es el acabado por defecto;
   `bezel={false}` devuelve la tarjeta plana para casos anidados, donde un
   segundo bisel dentro de otro se lee como ruido. */
function Card({
  theme = 'light',
  padding = 'md',
  interactive = false,
  grid = false,
  accent = null,
  bezel = true,
  className = '',
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--pad-card)',
    lg: 'var(--pad-card-lg)'
  };
  const dark = theme !== 'light';
  const bg = theme === 'void' ? 'var(--ground-void)' : theme === 'deep' ? 'var(--ground-navy)' : theme === 'dark' ? 'var(--surface-card-dark)' : 'var(--surface-card)';
  const accents = {
    evidence: 'var(--accent-evidence)',
    myth: 'var(--accent-myth)',
    info: 'var(--accent-info)'
  };
  const core = /*#__PURE__*/React.createElement("div", {
    className: grid ? dark ? 'ecc-grid' : 'ecc-grid-light' : undefined,
    style: {
      position: 'relative',
      overflow: 'hidden',
      padding: pads[padding],
      background: bg,
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      borderRadius: bezel ? 'var(--bezel-core-radius)' : 'var(--radius-card)',
      boxShadow: [dark ? 'var(--bezel-core-sheen-dark)' : 'var(--bezel-core-sheen-light)', dark ? 'var(--shadow-on-dark)' : interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)'].join(','),
      color: dark ? 'var(--text-on-dark)' : 'var(--text-body)'
    }
  }, accent ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: accents[accent],
      zIndex: 'var(--z-raised)'
    }
  }) : null, children);
  const shell = bezel ? dark ? 'ecc-bezel ecc-bezel-on-dark' : 'ecc-bezel' : '';
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    className: [shell, className].filter(Boolean).join(' ') || undefined,
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transform: interactive && hover ? 'translate3d(0,-4px,0)' : 'none',
      transition: 'var(--transition-surface)',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, rest), core);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Divider({
  label = null,
  onDark = false,
  style,
  ...rest
}) {
  const line = onDark ? 'var(--border-on-dark)' : 'var(--border-subtle)';
  const ink = onDark ? 'var(--text-on-dark-faint)' : 'var(--text-faint)';
  if (!label) return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      border: 0,
      borderTop: 'var(--border-w-hair) solid ' + line,
      margin: 0,
      ...style
    }
  }, rest));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: line
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: ink
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: line
    }
  }));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 40,
  lg: 48
};
const VARIANTS = {
  solid: {
    bg: 'var(--navy-700)',
    fg: 'var(--white)',
    bd: 'transparent',
    hover: 'var(--navy-800)'
  },
  subtle: {
    bg: 'var(--navy-050)',
    fg: 'var(--navy-700)',
    bd: 'var(--border-subtle)',
    hover: 'var(--navy-100)'
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--navy-700)',
    bd: 'transparent',
    hover: 'var(--navy-050)'
  },
  onDark: {
    bg: 'var(--surface-glass)',
    fg: 'var(--white)',
    bd: 'var(--border-on-dark)',
    hover: 'rgba(255,255,255,.18)'
  }
};
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  disabled = false,
  round = true,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const d = SIZES[size] || SIZES.md,
    v = VARIANTS[variant] || VARIANTS.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: d,
      height: d,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: v.fg,
      background: hover && !disabled ? v.hover : v.bg,
      border: 'var(--border-w-hair) solid ' + v.bd,
      borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : 1,
      transform: hover && !disabled ? 'scale(1.05)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Logo({
  variant = 'horizontal',
  theme = 'dark',
  size = 40,
  src = null,
  style,
  ...rest
}) {
  const ink = theme === 'dark' ? 'var(--white)' : 'var(--navy-700)';
  const sub = theme === 'dark' ? 'var(--cyan-300)' : 'var(--cyan-600)';
  /* El isotipo transparente es cyan: sobre fondo claro se lava. En theme="light"
     se usa la version en cuadro navy salvo que el consumidor pase src explicito. */
  const file = src || (theme === 'light' ? 'assets/isotipo-ecc-navy.png' : 'assets/isotipo-ecc.png');
  const mark = /*#__PURE__*/React.createElement("img", {
    src: file,
    alt: "Entrena con Ciencia",
    width: size,
    height: size,
    style: {
      display: 'block',
      borderRadius: theme === 'light' && !src ? 'var(--radius-sm)' : 0
    }
  });
  if (variant === 'mark') return /*#__PURE__*/React.createElement("span", _extends({
    style: style
  }, rest), mark);
  const stacked = variant === 'stacked';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: 'center',
      gap: stacked ? size * 0.18 : size * 0.28,
      ...style
    }
  }, rest), mark, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: stacked ? 'center' : 'flex-start',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-display)',
      fontWeight: 'var(--weight-black)',
      fontSize: size * 0.46,
      letterSpacing: '-0.005em',
      textTransform: 'uppercase',
      color: ink
    }
  }, "Entrena"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-medium)',
      fontSize: size * 0.24,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: sub,
      marginTop: size * 0.10
    }
  }, "con Ciencia")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  onDark = false,
  style,
  ...rest
}) {
  const line = onDark ? 'var(--border-on-dark)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      borderBottom: 'var(--border-w-hair) solid ' + line,
      ...style
    }
  }, rest), items.map(it => {
    const id = it.value || it,
      label = it.label || it,
      on = id === value;
    const ink = on ? onDark ? 'var(--white)' : 'var(--navy-900)' : onDark ? 'var(--text-on-dark-faint)' : 'var(--text-muted)';
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(id),
      style: {
        appearance: 'none',
        background: 'none',
        border: 0,
        padding: '0 0 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-body-md)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-tight)',
        color: ink,
        borderBottom: 'var(--border-w) solid ' + (on ? 'var(--cyan-400)' : 'transparent'),
        marginBottom: -1,
        transition: 'var(--transition-control)'
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  active = false,
  onDark = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = typeof onClick === 'function';
  const base = onDark ? {
    bg: active ? 'var(--cyan-400)' : 'rgba(255,255,255,.08)',
    fg: active ? 'var(--navy-950)' : 'var(--text-on-dark-muted)',
    bd: active ? 'transparent' : 'var(--border-on-dark)'
  } : {
    bg: active ? 'var(--navy-700)' : 'var(--white)',
    fg: active ? 'var(--white)' : 'var(--navy-700)',
    bd: active ? 'transparent' : 'var(--border-strong)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    role: interactive ? 'button' : undefined,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 30,
      padding: '0 14px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-medium)',
      color: base.fg,
      background: base.bg,
      border: 'var(--border-w-hair) solid ' + base.bd,
      borderRadius: 'var(--radius-pill)',
      cursor: interactive ? 'pointer' : 'default',
      filter: hover && interactive && !active ? 'brightness(.97)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  onDark = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: checked ? 'var(--navy-700)' : onDark ? 'rgba(255,255,255,.06)' : 'var(--surface-card)',
      border: 'var(--border-w-hair) solid ' + (checked ? 'var(--navy-700)' : onDark ? 'var(--border-on-dark-strong)' : 'var(--border-strong)'),
      borderRadius: 'var(--radius-xs)',
      transition: 'var(--transition-control)'
    }
  }, checked ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 6.2 4.6 9 10 3",
    stroke: "var(--cyan-300)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label = null,
  hint = null,
  error = null,
  prefix = null,
  suffix = null,
  onDark = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const bd = error ? 'var(--coral-500)' : focus ? 'var(--cyan-500)' : onDark ? 'var(--border-on-dark)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      minHeight: 44,
      padding: '0 var(--pad-control-x)',
      background: onDark ? 'rgba(255,255,255,.06)' : 'var(--surface-card)',
      border: 'var(--border-w-hair) solid ' + bd,
      borderRadius: 'var(--radius-control)',
      boxShadow: focus ? 'var(--ring-focus)' : 'none',
      transition: 'var(--transition-control)'
    }
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      appearance: 'none',
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-md)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)'
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, suffix) : null), error || hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-caption)',
      color: error ? 'var(--coral-500)' : onDark ? 'var(--text-on-dark-faint)' : 'var(--text-muted)'
    }
  }, error || hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label = null,
  options = [],
  hint = null,
  onDark = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      minHeight: 44,
      padding: '0 var(--pad-control-x)',
      background: onDark ? 'rgba(255,255,255,.06)' : 'var(--surface-card)',
      border: 'var(--border-w-hair) solid ' + (focus ? 'var(--cyan-500)' : onDark ? 'var(--border-on-dark)' : 'var(--border-strong)'),
      borderRadius: 'var(--radius-control)',
      boxShadow: focus ? 'var(--ring-focus)' : 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-md)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-strong)',
      cursor: 'pointer',
      transition: 'var(--transition-control)'
    }
  }, rest), options.map(o => {
    const v = o.value !== undefined ? o.value : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, o.label || v);
  })), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-caption)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label = null,
  checked = false,
  onChange,
  disabled = false,
  onDark = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 44,
      height: 24,
      flexShrink: 0,
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      background: checked ? 'var(--cyan-500)' : onDark ? 'rgba(255,255,255,.16)' : 'var(--navy-200)',
      borderRadius: 'var(--radius-pill)',
      transition: 'background-color var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      background: 'var(--white)',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-sm)',
      transform: 'translateX(' + (checked ? 20 : 0) + 'px)',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-sm)',
      color: onDark ? 'var(--text-on-dark)' : 'var(--text-body)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/social/CarouselDeck.jsx
try { (() => {
/* Carrusel de post: 1080 x 1350 por lamina. Sigue el orden del guion:
   cover, mito, estudio, resultado, aplicación + CTA. */
function CarouselDeck({
  index = 0,
  asset = '../../assets/isotipo-ecc.png',
  assetLight = '../../assets/isotipo-ecc-navy.png'
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    StatFigure,
    StudyMeta,
    MythBuster,
    PmidRef,
    Badge,
    Button,
    Divider
  } = B;
  const Shell = ({
    children,
    dark = true,
    pad = 90
  }) => /*#__PURE__*/React.createElement("div", {
    className: 'ecc-grain-canvas ' + (dark ? 'ecc-atmos' : ''),
    style: {
      position: 'relative',
      width: 1080,
      height: 1350,
      overflow: 'hidden',
      padding: pad,
      background: dark ? undefined : 'var(--surface-page)',
      color: dark ? 'var(--text-on-dark)' : 'var(--text-body)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginBottom: 58
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: dark ? asset : assetLight,
    width: 52,
    height: 52,
    alt: "",
    style: {
      borderRadius: dark ? 0 : 'var(--radius-xs)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 18,
      color: dark ? 'var(--cyan-300)' : 'var(--cyan-600)'
    }
  }, "Entrena con Ciencia"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: dark ? 'var(--border-on-dark)' : 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-num",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 18,
      color: dark ? 'var(--text-on-dark-faint)' : 'var(--text-faint)'
    }
  }, String(index + 1).padStart(2, '0'), " / 05")), children);
  const H = ({
    children,
    size = 98,
    color = 'var(--white)'
  }) => /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-cover)',
      fontWeight: 'var(--weight-bold)',
      fontSize: size,
      lineHeight: 'var(--leading-cover)',
      letterSpacing: 'var(--tracking-cover)',
      textTransform: 'uppercase',
      color
    }
  }, children);
  const P = ({
    children,
    color = 'var(--text-on-dark-muted)',
    size = 38
  }) => /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: size,
      lineHeight: 'var(--leading-body)',
      letterSpacing: 'var(--tracking-tight)',
      color,
      maxWidth: '26ch'
    }
  }, children);
  const slides = [/*#__PURE__*/React.createElement(Shell, {
    key: "s1"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 42
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-rule",
    style: {
      width: 88,
      height: 5
    }
  }), /*#__PURE__*/React.createElement(H, {
    size: 136
  }, "M\xE1s prote\xEDna", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold-400)'
    }
  }, "no es m\xE1s m\xFAsculo")), /*#__PURE__*/React.createElement(P, null, "Lo que midi\xF3 un ensayo controlado de 4 semanas en hombres que entrenan fuerza")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 24
    }
  }, Badge ? /*#__PURE__*/React.createElement(Badge, {
    tone: "evidence"
  }, "Desliza") : null, /*#__PURE__*/React.createElement("span", {
    className: "ecc-num",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 22,
      color: 'var(--cyan-300)'
    }
  }, "PMID 20921542"))), /*#__PURE__*/React.createElement(Shell, {
    key: "s2",
    dark: false
  }, /*#__PURE__*/React.createElement(H, {
    size: 82,
    color: "var(--text-strong)"
  }, "La creencia", /*#__PURE__*/React.createElement("br", null), "com\xFAn"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56
    }
  }, MythBuster ? /*#__PURE__*/React.createElement(MythBuster, {
    scale: 2.3,
    myth: "Mientras m\xE1s prote\xEDna comes, m\xE1s m\xFAsculo ganas: por eso hacen falta varios batidos al d\xEDa",
    fact: "Pasado cierto punto, comer m\xE1s prote\xEDna no a\xF1ade m\xFAsculo medible",
    style: {
      borderRadius: 26
    }
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(P, {
    color: "var(--text-muted)"
  }, "Investigadores lo pusieron a prueba aislando una sola variable"))), /*#__PURE__*/React.createElement(Shell, {
    key: "s3"
  }, /*#__PURE__*/React.createElement(H, {
    size: 82
  }, "El estudio"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 52
    }
  }, StudyMeta ? /*#__PURE__*/React.createElement(StudyMeta, {
    onDark: true,
    scale: 2.4,
    columns: 2,
    items: [{
      label: 'Participantes',
      value: 'n = 40 hombres entrenados'
    }, {
      label: 'Grupos',
      value: '1.2 vs 2.4 g/kg'
    }, {
      label: 'Protocolo',
      value: 'Fuerza 6 días/semana'
    }, {
      label: 'Duración',
      value: '4 semanas'
    }]
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 52
    }
  }, /*#__PURE__*/React.createElement(P, null, "La \xFAnica diferencia entre los grupos fue la cantidad de prote\xEDna al d\xEDa")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    onDark: true,
    pmid: "20921542",
    label: "Estudio hero",
    style: {
      height: 46,
      fontSize: 22,
      padding: '0 17px'
    }
  }) : null)), /*#__PURE__*/React.createElement(Shell, {
    key: "s4"
  }, /*#__PURE__*/React.createElement(H, {
    size: 82
  }, "El resultado"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 66
    }
  }, StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "0",
    unit: "g",
    label: "de m\xFAsculo extra en el grupo de 2.4 g/kg",
    note: "frente al grupo de 1.2 g/kg",
    size: "xl"
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      height: 1,
      background: 'var(--border-on-dark)'
    }
  }), StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "1.6",
    unit: "g/kg",
    label: "donde se aplana la ganancia",
    tone: "info",
    size: "lg"
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(P, null, "El peso perdido fue el mismo. Lo que cambi\xF3 fue de d\xF3nde sali\xF3"))), /*#__PURE__*/React.createElement(Shell, {
    key: "s5",
    dark: false
  }, /*#__PURE__*/React.createElement(H, {
    size: 82,
    color: "var(--text-strong)"
  }, "Qu\xE9 hacer"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 52,
      display: 'flex',
      flexDirection: 'column',
      gap: 34
    }
  }, /*#__PURE__*/React.createElement(P, {
    color: "var(--text-body)"
  }, "Apunta a 1.6 g/kg al d\xEDa repartidos en 3 o 4 comidas. Para 70 kg son unos 112 g: una pechuga grande m\xE1s dos huevos."), Divider ? /*#__PURE__*/React.createElement(Divider, {
    label: "Referencias"
  }) : null, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    pmid: "20921542",
    style: {
      height: 46,
      fontSize: 22,
      padding: '0 17px'
    }
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 32
    }
  }, Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "evidence",
    size: "lg",
    style: {
      minHeight: 92,
      fontSize: 34,
      padding: '0 46px',
      borderRadius: 'var(--radius-md)'
    }
  }, "Comenta PROTE") : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 30,
      lineHeight: 1.4,
      color: 'var(--text-muted)',
      maxWidth: '18ch'
    }
  }, "y te enviamos la gu\xEDa de prote\xEDna")))];
  return slides[Math.max(0, Math.min(slides.length - 1, index))];
}
Object.assign(__ds_scope, { CarouselDeck });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social/CarouselDeck.jsx", error: String((e && e.message) || e) }); }

// ui_kits/social/ReelCover.jsx
try { (() => {
/* Cover de Reel / Short: 1080 x 1920. Dos a cinco palabras sobre el painpoint del viewer.
   Fondo con atmosfera (halo cyan + grano), nunca navy plano. */
function ReelCover({
  variant = 'question',
  words = 'Dormir poco te frena',
  highlight = 'te frena',
  kicker = 'Basado en evidencia',
  stat = '60%',
  statLabel = 'más músculo perdido con el mismo déficit',
  left = 'Ayuno 16 h',
  right = 'Como todo el día',
  pmid = '20921542',
  asset = '../../assets/isotipo-ecc.png'
}) {
  const a = words.replace(highlight, '').trim(),
    b = highlight;
  const cover = {
    fontFamily: 'var(--font-display)',
    fontVariationSettings: 'var(--vf-cover)',
    fontWeight: 'var(--weight-bold)',
    lineHeight: 'var(--leading-cover)',
    letterSpacing: 'var(--tracking-cover)',
    textTransform: 'uppercase',
    color: 'var(--white)',
    margin: 0
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ecc-atmos ecc-grain-canvas",
    style: {
      position: 'relative',
      width: 1080,
      height: 1920,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      background: 'rgba(255,255,255,.14)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 76,
      left: 76,
      right: 76,
      display: 'flex',
      alignItems: 'center',
      gap: 26
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: asset,
    width: 72,
    height: 72,
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 21,
      color: 'var(--cyan-300)'
    }
  }, kicker), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-on-dark)'
    }
  })), variant === 'question' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 76,
      right: 76,
      top: '50%',
      transform: 'translateY(-54%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 52
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-rule",
    style: {
      width: 104,
      height: 5
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      ...cover,
      fontSize: 170
    }
  }, a, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold-400)'
    }
  }, b))) : null, variant === 'stat' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 76,
      right: 76,
      top: '50%',
      transform: 'translateY(-52%)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 21,
      color: 'var(--text-on-dark-faint)'
    }
  }, "El resultado"), /*#__PURE__*/React.createElement("span", {
    className: "ecc-num",
    style: {
      display: 'block',
      marginTop: 22,
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-cover)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 380,
      lineHeight: .8,
      letterSpacing: '-0.04em',
      color: 'var(--gold-400)'
    }
  }, stat), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 30,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-medium)',
      fontSize: 58,
      lineHeight: 1.15,
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--white)',
      maxWidth: '17ch'
    }
  }, statLabel)) : null, variant === 'versus' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      transform: 'translateY(-52%)'
    }
  }, [[left, 'var(--coral-400)', '01'], [right, 'var(--cyan-400)', '02']].map(([txt, col, idx], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 36,
      padding: '52px 76px',
      borderTop: '1px solid var(--border-on-dark)',
      borderBottom: i === 1 ? '1px solid var(--border-on-dark)' : 'none',
      background: i === 1 ? 'rgba(255,255,255,.03)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      background: col
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 20,
      color: 'var(--text-on-dark-faint)',
      paddingTop: 14
    }
  }, idx), /*#__PURE__*/React.createElement("span", {
    style: {
      ...cover,
      fontSize: 104
    }
  }, txt))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '76px 76px 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      ...cover,
      fontSize: 100,
      color: 'var(--gold-400)'
    }
  }, "\xBFQui\xE9n pierde", /*#__PURE__*/React.createElement("br", null), "m\xE1s grasa?"))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 76,
      right: 76,
      bottom: 76,
      display: 'flex',
      alignItems: 'center',
      gap: 26
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-num",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 25,
      letterSpacing: 'var(--tracking-mono)',
      color: 'var(--cyan-300)'
    }
  }, "PMID ", pmid), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-on-dark)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 20,
      color: 'var(--text-on-dark-faint)'
    }
  }, "Entrena con Ciencia")));
}
Object.assign(__ds_scope, { ReelCover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social/ReelCover.jsx", error: String((e && e.message) || e) }); }

// ui_kits/social/ReelOverlay.jsx
try { (() => {
/* Graficos en pantalla sobre el fotograma del video (1080 x 1920).
   Todo texto se apoya en scrim o en caja opaca: nunca suelto sobre imagen. */
function ReelOverlay({
  kind = 'hook',
  asset = '../../assets/isotipo-ecc.png'
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    StatFigure,
    StudyMeta,
    PmidRef,
    Badge,
    Button
  } = B;
  const box = {
    background: 'rgba(11,20,37,.84)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border-on-dark)',
    boxShadow: 'var(--edge-top),var(--shadow-on-dark)',
    borderRadius: 'var(--radius-xl)'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ecc-grain-canvas",
    style: {
      position: 'relative',
      width: 1080,
      height: 1920,
      overflow: 'hidden',
      background: 'linear-gradient(158deg,var(--navy-600) 0%,var(--navy-900) 58%,var(--navy-975) 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-grid",
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--glow-cyan)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-bottom)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-top)',
      opacity: .55
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 68,
      left: 68,
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: asset,
    width: 58,
    height: 58,
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      fontSize: 19,
      color: 'rgba(255,255,255,.72)'
    }
  }, "Entrena con Ciencia")), kind === 'hook' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 68,
      right: 68,
      bottom: 210
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline',
      padding: '16px 24px',
      background: 'var(--gold-400)',
      color: 'var(--accent-evidence-ink)',
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 50,
      lineHeight: 1.42,
      letterSpacing: 'var(--tracking-tight)',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone'
    }
  }, "Muchos creen que m\xE1s prote\xEDna es m\xE1s m\xFAsculo")) : null, kind === 'stat' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 68,
      right: 68,
      top: '50%',
      transform: 'translateY(-50%)',
      ...box,
      padding: 66
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-rule",
    style: {
      marginBottom: 36
    }
  }), StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "60",
    unit: "%",
    label: "m\xE1s m\xFAsculo perdido durmiendo 5.5 h",
    note: "n = 10 \xB7 14 d\xEDas",
    size: "xl"
  }) : null) : null, kind === 'study' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 68,
      right: 68,
      bottom: 186,
      ...box,
      padding: 58
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      marginBottom: 30
    }
  }, Badge ? /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    style: {
      height: 38,
      fontSize: 19,
      padding: '0 15px'
    }
  }, "Estudio hero") : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 46,
      letterSpacing: 'var(--tracking-display)',
      color: 'var(--white)'
    }
  }, "Universidad McMaster")), StudyMeta ? /*#__PURE__*/React.createElement(StudyMeta, {
    onDark: true,
    scale: 2.4,
    columns: 2,
    items: [{
      label: 'Participantes',
      value: 'n = 40 hombres'
    }, {
      label: 'Grupos',
      value: '1.2 vs 2.4 g/kg'
    }, {
      label: 'Protocolo',
      value: 'Fuerza 6 días/sem'
    }, {
      label: 'Duración',
      value: '4 semanas'
    }]
  }) : null) : null, kind === 'cta' ? /*#__PURE__*/React.createElement("div", {
    className: "ecc-atmos",
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 46,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: asset,
    width: 210,
    height: 210,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-display)',
      fontWeight: 'var(--weight-black)',
      fontSize: 120,
      lineHeight: .94,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      color: 'var(--white)'
    }
  }, "Entrena"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 18,
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-medium)',
      fontSize: 38,
      letterSpacing: '.30em',
      textTransform: 'uppercase',
      color: 'var(--cyan-300)'
    }
  }, "con Ciencia")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 40,
      lineHeight: 1.4,
      color: 'var(--text-on-dark-muted)',
      maxWidth: '21ch'
    }
  }, "S\xEDguenos para entrenar con evidencia, no con mitos"), Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "evidence",
    size: "lg",
    style: {
      minHeight: 100,
      fontSize: 40,
      padding: '0 58px',
      borderRadius: 'var(--radius-md)'
    }
  }, "Comenta PROTE") : null) : null, kind !== 'cta' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 68,
      bottom: 98
    }
  }, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    onDark: true,
    pmid: "20921542",
    style: {
      height: 46,
      fontSize: 22,
      padding: '0 17px'
    }
  }) : null) : null);
}
Object.assign(__ds_scope, { ReelOverlay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social/ReelOverlay.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/HomeHero.jsx
try { (() => {
function HomeHero() {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Button,
    Badge,
    StatFigure,
    PmidRef
  } = B;
  return /*#__PURE__*/React.createElement("section", {
    className: "ecc-atmos",
    style: {
      borderBottom: '1px solid var(--border-on-dark)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-split ecc-pad",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      paddingTop: 'var(--gap-section-xl)',
      paddingBottom: 'var(--gap-section)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal ecc-reveal-1",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-rule",
    style: {
      width: 56,
      height: 3,
      flex: '0 0 56px'
    }
  }), Badge ? /*#__PURE__*/React.createElement(Badge, {
    tone: "outlineOnDark"
  }, "Fitness basado en evidencia") : null), /*#__PURE__*/React.createElement("h1", {
    className: "ecc-cover ecc-reveal ecc-reveal-2",
    style: {
      marginTop: 'var(--space-6)',
      fontSize: 'clamp(42px,6.4vw,78px)',
      color: 'var(--white)'
    }
  }, "Entrena con ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold-400)'
    }
  }, "evidencia"), ",", /*#__PURE__*/React.createElement("br", null), "no con mitos"), /*#__PURE__*/React.createElement("p", {
    className: "ecc-reveal ecc-reveal-3",
    style: {
      marginTop: 'var(--space-6)',
      maxWidth: '41ch',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-lg)',
      lineHeight: 'var(--leading-body)',
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--text-on-dark-muted)'
    }
  }, "Cada video cuenta la historia de un estudio: qu\xE9 midi\xF3, en qui\xE9nes y qu\xE9 encontr\xF3. Sin promesas m\xE1gicas y con el PMID a la vista."), /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal ecc-reveal-4",
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-10)',
      flexWrap: 'wrap'
    }
  }, Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "evidence",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-play",
      style: {
        fontSize: 17
      }
    })
  }, "Ver los videos") : null, Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "onDark",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-microscope",
      style: {
        fontSize: 18
      }
    })
  }, "C\xF3mo verificamos") : null)), /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal ecc-reveal-3 ecc-bezel ecc-bezel-on-dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-bezel-core ecc-bezel-core-on-dark",
    style: {
      padding: 'var(--pad-card-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--cyan-400)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      color: 'var(--text-on-dark-faint)'
    }
  }, "Estudio de la semana")), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 'var(--space-4)',
      fontSize: 'var(--text-h3)',
      color: 'var(--white)',
      lineHeight: 1.22
    }
  }, "Dormir 5.5 h con d\xE9ficit cal\xF3rico"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'var(--space-6) 0',
      height: 1,
      background: 'var(--border-on-dark)'
    }
  }), StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "60",
    unit: "%",
    label: "m\xE1s m\xFAsculo perdido con el mismo d\xE9ficit",
    note: "n = 10 \xB7 14 d\xEDas",
    size: "md"
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)'
    }
  }, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    onDark: true,
    pmid: "20921542",
    label: "Estudio hero"
  }) : null)))));
}
Object.assign(__ds_scope, { HomeHero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/HomeHero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/LeadMagnet.jsx
try { (() => {
function LeadMagnet() {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Input,
    Button,
    Checkbox,
    Badge,
    Divider
  } = B;
  const [sent, setSent] = React.useState(false);
  const [ok, setOk] = React.useState(true);
  const [guía, setGuía] = React.useState('PESO');
  return /*#__PURE__*/React.createElement("section", {
    className: "ecc-grid-light",
    style: {
      background: 'var(--surface-inset)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-split ecc-split-form ecc-pad",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      paddingTop: 'var(--gap-section-xl)',
      paddingBottom: 'var(--gap-section-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-eyebrow"
  }, "Gu\xEDas gratuitas"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--space-4)',
      fontSize: 'clamp(30px,4.4vw,46px)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, "Las dos gu\xEDas que pedimos comentar en los videos"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--space-4)',
      maxWidth: '52ch',
      fontSize: 'var(--text-body-lg)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-muted)'
    }
  }, "PESO trae la calculadora de d\xE9ficit cal\xF3rico. PROTE trae cuanta prote\xEDna necesitas y como repartirla. Ambas citan los estudios en los que se basan."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-6)'
    }
  }, ['PESO', 'PROTE'].map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    onClick: () => setGuía(g),
    style: {
      appearance: 'none',
      cursor: 'pointer',
      padding: '12px 22px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      letterSpacing: 'var(--tracking-mono)',
      background: guía === g ? 'var(--navy-700)' : 'var(--surface-card)',
      color: guía === g ? '#fff' : 'var(--navy-700)',
      border: '1px solid ' + (guía === g ? 'var(--navy-700)' : 'var(--border-strong)')
    }
  }, "Comenta ", g)))), /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal ecc-reveal-2 ecc-bezel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-bezel-core",
    style: {
      padding: 'var(--pad-card-lg)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--navy-900)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--evidence-fill)'
    }
  }), "Enviado"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-h3)'
    }
  }, "Revisa tu correo"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-body-sm)',
      color: 'var(--text-muted)',
      lineHeight: 1.55
    }
  }, "Te enviamos la gu\xEDa ", guía, ". Si no llega en 5 minutos, revisa spam."), Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => setSent(false)
  }, "Enviar otra") : null) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      color: 'var(--text-faint)'
    }
  }, "Gu\xEDa ", guía), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 6,
      fontSize: 'var(--text-h3)'
    }
  }, "Te la enviamos por correo")), Input ? /*#__PURE__*/React.createElement(Input, {
    label: "Tu correo",
    type: "email",
    required: true,
    placeholder: "nombre@correo.com",
    prefix: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-envelope-simple",
      style: {
        fontSize: 17
      }
    })
  }) : null, Checkbox ? /*#__PURE__*/React.createElement(Checkbox, {
    label: "Quiero tambien el estudio de la semana",
    checked: ok,
    onChange: e => setOk(e.target.checked)
  }) : null, Button ? /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "evidence",
    fullWidth: true,
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-arrow-right",
      style: {
        fontSize: 17
      }
    })
  }, "Recibir la gu\xEDa ", guía) : null, Divider ? /*#__PURE__*/React.createElement(Divider, null) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-caption)',
      color: 'var(--text-faint)'
    }
  }, "Un correo por semana. Puedes salir con un clic."))))));
}
Object.assign(__ds_scope, { LeadMagnet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/LeadMagnet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SiteFooter.jsx
try { (() => {
function SiteFooter({
  asset = '../../assets/isotipo-ecc.png'
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Logo,
    Divider
  } = B;
  const cols = [['Contenido', ['Reels', 'Fichas de estudio', 'Guías']], ['Temas', ['Hipertrofia', 'Nutrición', 'Sueño', 'Suplementación']], ['Canal', ['Cómo verificamos', 'Contacto', 'Colaboraciones']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ground-void)',
      color: 'var(--text-on-dark-muted)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-cols ecc-pad",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      paddingTop: 'var(--gap-section)',
      paddingBottom: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", null, Logo ? /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    theme: "dark",
    size: 40,
    src: asset
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--space-5)',
      maxWidth: '32ch',
      fontSize: 'var(--text-body-sm)',
      lineHeight: 1.6,
      color: 'var(--text-on-dark-faint)'
    }
  }, "Fitness y nutrici\xF3n basados en evidencia. Cada afirmaci\xF3n se rastrea a un estudio con PMID.")), cols.map(([title, links]) => /*#__PURE__*/React.createElement("div", {
    key: title
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-label",
    style: {
      color: 'var(--text-on-dark-faint)'
    }
  }, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 'var(--space-4) 0 0',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--text-on-dark-muted)',
      textDecoration: 'none',
      fontSize: 'var(--text-body-sm)'
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    className: "ecc-pad",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      paddingBottom: 'var(--space-10)'
    }
  }, Divider ? /*#__PURE__*/React.createElement(Divider, {
    onDark: true
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-5)',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-6)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-caption)',
      color: 'var(--text-on-dark-faint)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Entrena con Ciencia \xB7 Per\xFA"), /*#__PURE__*/React.createElement("span", null, "El contenido es informativo y no sustituye consulta m\xE9dica"))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SiteHeader.jsx
try { (() => {
/* Isla flotante: la navegacion no se pega al borde superior de la ventana.
   Es una pildora de vidrio despegada, centrada y del ancho de su contenido.
   El blur vive aqui y en el overlay, que son fixed/sticky: nunca sobre
   contenido que scrollea. */
function SiteHeader({
  page = 'inicio',
  onNavigate,
  asset = '../../assets/isotipo-ecc.png'
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Logo,
    Button
  } = B;
  const [open, setOpen] = React.useState(false);
  const items = [['inicio', 'Videos'], ['ficha', 'Fichas de estudio'], ['guías', 'Guías']];
  const go = id => {
    setOpen(false);
    onNavigate && onNavigate(id);
  };

  /* El menu abierto bloquea el scroll del documento detras y se cierra con
     Escape, que es la salida que espera cualquiera que abra algo a pantalla
     completa. */
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : prev || '';
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev || '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    className: open ? "ecc-island is-above" : "ecc-island",
    style: {
      padding: '0 var(--space-2) 0 var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-8)'
    }
  }, Logo ? /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    theme: "dark",
    size: 32,
    src: asset,
    style: {
      cursor: 'pointer'
    },
    onClick: () => go('inicio')
  }) : null, /*#__PURE__*/React.createElement("nav", {
    className: "ecc-island-nav"
  }, items.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(id);
    },
    style: {
      textDecoration: 'none',
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--tracking-tight)',
      color: page === id ? 'var(--white)' : 'var(--text-on-dark-muted)',
      position: 'relative',
      paddingBottom: 2,
      transition: 'color var(--dur-fast) var(--ease-fluid)'
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: -6,
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: 'var(--cyan-400)',
      transform: 'translateX(-50%) scale(' + (page === id ? 1 : 0) + ')',
      transition: 'transform var(--dur-base) var(--ease-fluid)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-island-cta"
  }, Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "evidence",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-arrow-up-right",
      style: {
        fontSize: 15
      }
    })
  }, "Recibir la gu\xEDa") : null), /*#__PURE__*/React.createElement("button", {
    "aria-label": open ? 'Cerrar menú' : 'Abrir menú',
    "aria-expanded": open,
    onClick: () => setOpen(o => !o),
    className: "ecc-island-burger",
    style: {
      appearance: 'none',
      border: 0,
      background: 'transparent',
      color: 'var(--white)',
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: open ? 'ecc-burger is-open' : 'ecc-burger',
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)))))), /*#__PURE__*/React.createElement("div", {
    className: open ? 'ecc-overlay is-open' : 'ecc-overlay',
    "aria-hidden": !open,
    onClick: e => {
      if (e.target === e.currentTarget) setOpen(false);
    },
    style: {
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      textAlign: 'center'
    }
  }, items.map(([id, label], i) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    className: "ecc-mask-item",
    onClick: e => {
      e.preventDefault();
      go(id);
    },
    style: {
      textDecoration: 'none',
      color: page === id ? 'var(--gold-400)' : 'var(--white)',
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--vf-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'clamp(38px,7vw,68px)',
      lineHeight: 1.06,
      letterSpacing: 'var(--tracking-display)',
      transitionDelay: open ? 60 + i * 70 + 'ms' : '0ms'
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    className: "ecc-mask-item ecc-label",
    style: {
      marginTop: 'var(--space-8)',
      color: 'var(--text-on-dark-faint)',
      transitionDelay: open ? 60 + items.length * 70 + 'ms' : '0ms'
    }
  }, "Cada afirmaci\xF3n con su PMID"))));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/StudyArticle.jsx
try { (() => {
function StudyArticle({
  onBack
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Badge,
    Tag,
    MythBuster,
    StudyMeta,
    StatFigure,
    Callout,
    PmidRef,
    Divider,
    Button,
    Card
  } = B;
  return /*#__PURE__*/React.createElement("article", {
    className: "ecc-pad",
    style: {
      maxWidth: 900,
      margin: '0 auto',
      paddingTop: 'var(--gap-section-xl)',
      paddingBottom: 'var(--gap-section)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, Button ? /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onBack,
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ph-light ph-arrow-left",
      style: {
        fontSize: 16
      }
    })
  }, "Videos") : null, Badge ? /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "Ficha de estudio") : null, Tag ? /*#__PURE__*/React.createElement(Tag, null, "Sue\xF1o") : null), /*#__PURE__*/React.createElement("h1", {
    className: "ecc-reveal",
    style: {
      marginTop: 'var(--space-6)',
      fontSize: 58,
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, "Dormir 5.5 h cambia de d\xF3nde sale el peso que pierdes"), /*#__PURE__*/React.createElement("p", {
    className: "ecc-reveal ecc-reveal-1",
    style: {
      marginTop: 'var(--space-5)',
      maxWidth: 'var(--measure-prose)',
      fontSize: 'var(--text-body-lg)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-muted)'
    }
  }, "El sue\xF1o no solo afecta c\xF3mo te sientes en el gimnasio: en d\xE9ficit cal\xF3rico decide que parte del peso perdido es grasa y que parte es m\xFAsculo."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)',
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    pmid: "20921542",
    label: "Estudio hero"
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-caption)',
      color: 'var(--text-faint)',
      alignSelf: 'center'
    }
  }, "Publicado 12 ago 2026 \xB7 4 min")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'var(--gap-section) 0 var(--space-8)'
    }
  }, Divider ? /*#__PURE__*/React.createElement(Divider, {
    label: "La creencia"
  }) : null), MythBuster ? /*#__PURE__*/React.createElement(MythBuster, {
    myth: "Si mantienes el d\xE9ficit, dormir poco solo te deja cansado",
    fact: "Con el mismo d\xE9ficit, dormir 5.5 h cambio la proporci\xF3n de grasa y m\xFAsculo perdidos"
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'var(--gap-section) 0 var(--space-8)'
    }
  }, Divider ? /*#__PURE__*/React.createElement(Divider, {
    label: "Metodolog\xEDa"
  }) : null), StudyMeta ? /*#__PURE__*/React.createElement(StudyMeta, {
    columns: 4,
    items: [{
      label: 'Participantes',
      value: 'n = 10'
    }, {
      label: 'Diseño',
      value: 'Cruzado'
    }, {
      label: 'Déficit',
      value: '-680 kcal/día'
    }, {
      label: 'Duración',
      value: '14 días'
    }]
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--space-6)',
      maxWidth: 'var(--measure-prose)',
      fontSize: 'var(--text-body-md)',
      lineHeight: 'var(--leading-body)'
    }
  }, "Los participantes pasaron por las dos condiciones con el mismo d\xE9ficit cal\xF3rico y la misma dieta. La \xFAnica diferencia fue el tiempo en cama: 8.5 h frente a 5.5 h."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'var(--gap-section) 0 var(--space-8)'
    }
  }, Divider ? /*#__PURE__*/React.createElement(Divider, {
    label: "Resultado"
  }) : null), Card ? /*#__PURE__*/React.createElement(Card, {
    theme: "deep",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-16)',
      flexWrap: 'wrap'
    }
  }, StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "60",
    unit: "%",
    label: "m\xE1s m\xFAsculo perdido durmiendo 5.5 h",
    size: "lg"
  }) : null, StatFigure ? /*#__PURE__*/React.createElement(StatFigure, {
    value: "55",
    unit: "%",
    label: "menos grasa perdida",
    tone: "info",
    size: "lg"
  }) : null)) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--space-6)',
      maxWidth: 'var(--measure-prose)',
      fontSize: 'var(--text-body-md)',
      lineHeight: 'var(--leading-body)'
    }
  }, "El peso en la balanza fue pr\xE1cticamente el mismo en ambas condiciones. Lo que cambi\xF3 fue de d\xF3nde sali\xF3 ese peso."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--gap-section)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, Callout ? /*#__PURE__*/React.createElement(Callout, {
    kind: "practice"
  }, "Protege 7 a 9 h de sue\xF1o mientras estas en d\xE9ficit. Si no puedes, sube prote\xEDna a 1.6-2 g/kg y manten el trabajo de fuerza.") : null, Callout ? /*#__PURE__*/React.createElement(Callout, {
    kind: "limit"
  }, "Muestra peque\xF1a (10 personas) y solo 14 d\xEDas. Sirve para la direcci\xF3n del efecto, no para su magnitud exacta.") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-8)'
    }
  }, Callout ? /*#__PURE__*/React.createElement(Callout, {
    kind: "pinned"
  }, "En el video contamos solo este estudio. Si te interesa el efecto sobre el hambre, va en la ficha de grelina.") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--gap-section)'
    }
  }, Divider ? /*#__PURE__*/React.createElement(Divider, {
    label: "Referencias"
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)',
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    pmid: "20921542"
  }) : null, PmidRef ? /*#__PURE__*/React.createElement(PmidRef, {
    pmid: "22150425"
  }) : null)));
}
Object.assign(__ds_scope, { StudyArticle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/StudyArticle.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/VideoGrid.jsx
try { (() => {
/* `span` es el tamano de la pieza en el bento, no una propiedad del video:
   la parrilla es asimetrica a proposito y el primer elemento manda. */
const VIDEOS = [{
  cover: ['Dormir poco', 'te frena'],
  tema: 'Sueño',
  stat: '60%',
  pmid: '20921542',
  dur: '1:18',
  span: 'feature'
}, {
  cover: ['Más proteína', 'no es más músculo'],
  tema: 'Nutrición',
  stat: '1.6 g/kg',
  pmid: '22150425',
  dur: '1:24',
  span: 'wide'
}, {
  cover: ['Cafeína antes', 'de entrenar'],
  tema: 'Suplementación',
  stat: '+7%',
  pmid: '33388079',
  dur: '1:06',
  span: 'wide'
}, {
  cover: ['Entrenar al fallo', 'no es obligatorio'],
  tema: 'Hipertrofia',
  stat: '0 dif.',
  pmid: '34674314',
  dur: '1:32',
  span: 'third'
}, {
  cover: ['El cardio no', 'borra el músculo'],
  tema: 'Hipertrofia',
  stat: '-0.2 kg',
  pmid: '34503527',
  dur: '1:11',
  span: 'third'
}, {
  cover: ['Comer de noche', 'no engorda'],
  tema: 'Nutrición',
  stat: 'igual',
  pmid: '32662455',
  dur: '1:20',
  span: 'third'
}];
function VideoGrid({
  filter = 'Todos',
  onFilter
}) {
  const B = window.EntrenaConCienciaDesignSystem_858058 || {};
  const {
    Tag,
    Card,
    Badge
  } = B;
  const temas = ['Todos', 'Sueño', 'Nutrición', 'Hipertrofia', 'Suplementación'];
  const list = filter === 'Todos' ? VIDEOS : VIDEOS.filter(v => v.tema === filter);
  return /*#__PURE__*/React.createElement("section", {
    className: "ecc-pad",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      paddingTop: 'var(--gap-section)',
      paddingBottom: 'var(--gap-section)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ecc-reveal",
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-8)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ecc-eyebrow"
  }, "El archivo"), /*#__PURE__*/React.createElement("h2", null, "\xDAltimos videos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, temas.map(t => Tag ? /*#__PURE__*/React.createElement(Tag, {
    key: t,
    active: filter === t,
    onClick: () => onFilter && onFilter(t)
  }, t) : null))), /*#__PURE__*/React.createElement("div", {
    className: "ecc-bento"
  }, list.map((v, i) => {
    const feature = v.span === 'feature';
    return /*#__PURE__*/React.createElement(Card, {
      key: v.pmid,
      interactive: true,
      padding: "none",
      className: 'ecc-bento-' + v.span + ' ecc-reveal ecc-reveal-' + Math.min(5, i + 1)
    }, /*#__PURE__*/React.createElement("div", {
      className: "ecc-atmos",
      style: {
        position: 'relative',
        flex: '1 1 auto',
        aspectRatio: feature ? undefined : v.span === 'wide' ? '16 / 10' : '4 / 5',
        minHeight: feature ? 300 : undefined,
        padding: feature ? 'var(--space-8)' : 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--scrim-bottom)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 'var(--space-5)',
        left: 'var(--space-5)',
        right: 'var(--space-5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, Badge ? /*#__PURE__*/React.createElement(Badge, {
      tone: "outlineOnDark"
    }, v.tema) : null, /*#__PURE__*/React.createElement("span", {
      className: "ecc-num",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-caption)',
        color: 'var(--text-on-dark-muted)'
      }
    }, v.dur)), /*#__PURE__*/React.createElement("span", {
      className: "ecc-cover",
      style: {
        position: 'relative',
        fontSize: feature ? 58 : 37,
        color: 'var(--white)'
      }
    }, v.cover[0], /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gold-400)'
      }
    }, v.cover[1]))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--space-5) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ecc-num",
      style: {
        fontFamily: 'var(--font-display)',
        fontVariationSettings: 'var(--vf-display)',
        fontWeight: 'var(--weight-bold)',
        fontSize: feature ? 36 : 29,
        letterSpacing: 'var(--tracking-display)',
        background: 'var(--evidence-fill)',
        color: 'var(--evidence-fill-ink)',
        padding: '2px 10px',
        borderRadius: 'var(--radius-xs)'
      }
    }, v.stat), /*#__PURE__*/React.createElement("span", {
      className: "ecc-num",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-caption)',
        color: 'var(--cyan-600)'
      }
    }, "PMID ", v.pmid)));
  })));
}
Object.assign(__ds_scope, { VideoGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/VideoGrid.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.MythBuster = __ds_scope.MythBuster;

__ds_ns.PmidRef = __ds_scope.PmidRef;

__ds_ns.StatFigure = __ds_scope.StatFigure;

__ds_ns.StudyMeta = __ds_scope.StudyMeta;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.CarouselDeck = __ds_scope.CarouselDeck;

__ds_ns.ReelCover = __ds_scope.ReelCover;

__ds_ns.ReelOverlay = __ds_scope.ReelOverlay;

__ds_ns.HomeHero = __ds_scope.HomeHero;

__ds_ns.LeadMagnet = __ds_scope.LeadMagnet;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.StudyArticle = __ds_scope.StudyArticle;

__ds_ns.VideoGrid = __ds_scope.VideoGrid;

})();
