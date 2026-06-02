#!/usr/bin/env python3
"""
Génère toutes les icônes de l'app Op der Trap à partir d'un logo source.

Usage :
    python scripts/gen-icons.py [chemin_du_logo]

Par défaut, cherche assets/logo-source.png

Produit dans assets/ :
    - icon.png          (1024x1024 — icône principale iOS + fallback)
    - adaptive-icon.png (1024x1024 — Android, logo recadré dans la zone sûre)
    - splash-icon.png   (1024x1024 — écran de démarrage)
    - favicon.png        (48x48 — web)
"""
import os
import sys
from PIL import Image

# Couleur de fond (anthracite du logo Op der Trap)
BG = (35, 38, 43)  # #23262B

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, '..', 'assets'))


def load_source():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ASSETS, 'logo-source.png')
    if not os.path.exists(src):
        print(f"❌ Logo introuvable : {src}")
        print("   Place ton logo dans assets/logo-source.png puis relance.")
        sys.exit(1)
    print(f"📷 Logo source : {src}")
    return Image.open(src).convert('RGBA')


def square_on_bg(img, size, scale=1.0):
    """Place le logo centré sur un carré de fond BG, redimensionné à `scale`."""
    canvas = Image.new('RGBA', (size, size), BG + (255,))
    target = int(size * scale)
    # garde le ratio
    ratio = min(target / img.width, target / img.height)
    w, h = int(img.width * ratio), int(img.height * ratio)
    resized = img.resize((w, h), Image.LANCZOS)
    x, y = (size - w) // 2, (size - h) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas.convert('RGB')


def main():
    logo = load_source()
    os.makedirs(ASSETS, exist_ok=True)

    # icon.png : logo plein cadre (le badge circulaire touche presque les bords)
    square_on_bg(logo, 1024, scale=0.98).save(os.path.join(ASSETS, 'icon.png'))
    print("✅ icon.png")

    # adaptive-icon.png : Android recadre en cercle/arrondi et ne garde que ~66%
    # du centre → on réduit le logo à 70% pour que le texte du contour reste visible.
    square_on_bg(logo, 1024, scale=0.70).save(os.path.join(ASSETS, 'adaptive-icon.png'))
    print("✅ adaptive-icon.png")

    # splash-icon.png : logo un peu plus petit, centré sur le fond
    square_on_bg(logo, 1024, scale=0.62).save(os.path.join(ASSETS, 'splash-icon.png'))
    print("✅ splash-icon.png")

    # favicon.png (web)
    square_on_bg(logo, 48, scale=0.92).save(os.path.join(ASSETS, 'favicon.png'))
    print("✅ favicon.png")

    print("\n🎉 Terminé ! Toutes les icônes sont dans assets/.")
    print("   N'oublie pas de refaire un build : eas build --profile preview --platform android")


if __name__ == '__main__':
    main()
