#!/usr/bin/env bash
# Copia la landing de venta (proyecto ecc-landing, sitio estático) a public/vsl/,
# que el sitio sirve en entrenaciencia.com/vsl.
#
# Uso:  bash scripts/sync-vsl.sh [ruta-a-ecc-landing]
#       (por defecto ../ecc-landing)
#
# Repetirlo cada vez que se actualice la landing. No editar public/vsl/ a mano:
# los cambios se hacen en ecc-landing y se vuelven a copiar con este script.
set -euo pipefail

ORIGEN="${1:-../ecc-landing}"
DESTINO="public/vsl"

if [ ! -f "$ORIGEN/landing-escritorio.html" ] || [ ! -f "$ORIGEN/landing-movil.html" ]; then
  echo "No encuentro la landing en '$ORIGEN' (faltan landing-escritorio.html / landing-movil.html)." >&2
  exit 1
fi

rm -rf "$DESTINO"
mkdir -p "$DESTINO"

# Solo lo que la landing necesita para funcionar (sin listicles, docs ni configuración).
for item in index.html legal.html landing-escritorio.html landing-movil.html support.js image-slot.js _ds assets vendor; do
  cp -R "$ORIGEN/$item" "$DESTINO/"
done

# index.html redirige a la versión de celular o escritorio con una ruta relativa.
# Servido en /vsl (sin barra final) esa ruta apuntaría a la raíz del sitio, así que se fija a /vsl/.
sed -i.bak "s|location.replace((m?'landing-movil.html':'landing-escritorio.html')|location.replace((m?'/vsl/landing-movil.html':'/vsl/landing-escritorio.html')|; s|href=\"landing-escritorio.html\"|href=\"/vsl/landing-escritorio.html\"|" "$DESTINO/index.html"
rm -f "$DESTINO/index.html.bak"
grep -q "/vsl/landing-movil.html" "$DESTINO/index.html" || { echo "No pude ajustar la redirección de index.html." >&2; exit 1; }

echo "Landing copiada a $DESTINO desde $ORIGEN"
