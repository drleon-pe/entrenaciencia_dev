#!/usr/bin/env bash
# Copia la landing de venta (proyecto ecc-landing, sitio estático) a public/neurociencia/,
# que el sitio sirve en entrenaciencia.com/neurociencia.
#
# Uso:  bash scripts/sync-vsl.sh [ruta-a-ecc-landing]
#       (por defecto ../ecc-landing)
#
# Repetirlo cada vez que se actualice la landing. No editar public/neurociencia/ a mano:
# los cambios se hacen en ecc-landing y se vuelven a copiar con este script.
set -euo pipefail

ORIGEN="${1:-../ecc-landing}"
DESTINO="public/neurociencia"

if [ ! -f "$ORIGEN/landing-escritorio.html" ] || [ ! -f "$ORIGEN/landing-movil.html" ]; then
  echo "No encuentro la landing en '$ORIGEN' (faltan landing-escritorio.html / landing-movil.html)." >&2
  exit 1
fi

rm -rf "$DESTINO"
mkdir -p "$DESTINO"

# Solo lo que la landing necesita para funcionar (sin listicles, docs ni configuración).
for item in index.html legal.html legal-pago.html landing-escritorio.html landing-movil.html pago.html pago-escritorio.html pago-movil.html prueba-formato.html support.js image-slot.js _ds assets vendor; do
  cp -R "$ORIGEN/$item" "$DESTINO/"
done

# index.html redirige a la versión de celular o escritorio con una ruta relativa.
# Servido en /neurociencia (sin barra final) esa ruta apuntaría a la raíz del sitio, así que se fija a /neurociencia/.
# Desde el 15 oct 2026 la página publicada es la del formato nuevo (prueba-formato.html, una sola página para celular y escritorio).
# Se publica como landing.html (indexable) y index.html redirige ahí; las versiones anteriores siguen en landing-movil/escritorio.html.
sed "s|<meta name=\"robots\" content=\"noindex, nofollow\">||; s|<title>[^<]*</title>|<title>Transforma tu Cuerpo en 12 Semanas con Neurociencia \| Entrena con Ciencia</title>|" "$ORIGEN/prueba-formato.html" > "$DESTINO/landing.html"
sed -i.bak "s|location.replace((m?'landing-movil.html':'landing-escritorio.html')+location.search)|location.replace('/neurociencia/landing.html'+location.search)|; s|href=\"landing-escritorio.html\"|href=\"/neurociencia/landing.html\"|" "$DESTINO/index.html"
rm -f "$DESTINO/index.html.bak"
# La versión pagada guardada (pago.html) usa la misma corrección de rutas.
if [ -f "$DESTINO/pago.html" ]; then
  sed -i.bak "s|location.replace((m?'pago-movil.html':'pago-escritorio.html')|location.replace((m?'/neurociencia/pago-movil.html':'/neurociencia/pago-escritorio.html')|; s|href=\"pago-escritorio.html\"|href=\"/neurociencia/pago-escritorio.html\"|" "$DESTINO/pago.html"; rm -f "$DESTINO/pago.html.bak"
fi
grep -q "/neurociencia/landing.html" "$DESTINO/index.html" || { echo "No pude ajustar la redirección de index.html." >&2; exit 1; }

echo "Landing copiada a $DESTINO desde $ORIGEN"
