#!/usr/bin/env python3
"""Prepare Android launcher mipmaps from the exact supplied Stellar artwork.

The source artwork is intentionally not redesigned. This script only normalizes
its PNG encoding and resizes it to Android launcher densities.
"""

from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android-tv" / "app" / "src" / "main" / "res"
SOURCE = RES / "drawable-nodpi" / "stellar_app_icon.png"

DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}


def load_source() -> Image.Image:
    raw = SOURCE.read_bytes()
    if not raw.startswith(b"\x89PNG\r\n\x1a\n"):
        # The first GitHub upload path stored the PNG payload as base64 text.
        # Accept that representation so v0.5.3 can be rebuilt reproducibly.
        raw = base64.b64decode(raw, validate=False)

    image = Image.open(BytesIO(raw))
    image.load()
    return image.convert("RGBA")


def main() -> None:
    image = load_source()

    # Rewrite the source as a conventional PNG so AAPT2 can compile the tree.
    image.save(SOURCE, format="PNG", optimize=True)

    for density, size in DENSITIES.items():
        directory = RES / f"mipmap-{density}"
        directory.mkdir(parents=True, exist_ok=True)
        resized = image.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(directory / "stellar_launcher.png", format="PNG", optimize=True)
        resized.save(directory / "stellar_launcher_round.png", format="PNG", optimize=True)

    print("Prepared exact Stellar launcher artwork for: " + ", ".join(DENSITIES))


if __name__ == "__main__":
    main()
