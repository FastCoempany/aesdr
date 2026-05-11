#!/usr/bin/env python3
"""Build a single-file standalone HTML of the AESDR Brand Visual System.

Output: aesdr-design-system/dist/aesdr-brand-visual-system.standalone.html

Inlines everything the live page loads via the network:
  - ../colors_and_type.css                            (the brand tokens)
  - primitives.jsx, directions.jsx, synthesis.jsx     (as text/babel scripts)
  - React 18 + ReactDOM 18 + @babel/standalone        (vendored, production)
  - All 8 mascot PNGs as base64 data URIs             (via window.__MASCOT_PNG)

The result is a ~20 MB single .html file. Double-click to open in any
modern browser. Works offline except Google Fonts (which gracefully
fall back to system fonts).

Vendor runtimes live at build/vendor/. To refresh them:

    cd aesdr-design-system/build
    npm pack react@18.3.1 react-dom@18.3.1 @babel/standalone@7.29.0 \\
      --pack-destination .
    tar -xzOf react-18.3.1.tgz package/umd/react.production.min.js \\
      > vendor/react.production.min.js
    tar -xzOf react-dom-18.3.1.tgz package/umd/react-dom.production.min.js \\
      > vendor/react-dom.production.min.js
    tar -xzOf babel-standalone-7.29.0.tgz package/babel.min.js \\
      > vendor/babel.min.js
    rm *.tgz

Usage (paths are anchored to this file's location):

    python3 aesdr-design-system/build/build-standalone.py

Re-run any time synthesis.jsx, primitives.jsx, directions.jsx,
colors_and_type.css, or the mascot PNGs change.
"""
import base64
import json
import re
import sys
from pathlib import Path

# ---- paths (anchored to this file, not cwd) ----
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent                              # aesdr-design-system/
HTML_SRC = ROOT / "brand" / "AESDR Brand Visual System.html"
CSS_SRC  = ROOT / "colors_and_type.css"
JSX_DIR  = ROOT / "brand"
PNG_DIR  = ROOT / "brand" / "canon" / "mascot" / "png"
VENDOR   = HERE / "vendor"
DIST     = ROOT / "dist"
OUT      = DIST / "aesdr-brand-visual-system.standalone.html"

POSES = ["doctrine", "diagnosis", "sprint", "fall",
         "recovery", "rest", "verdict", "owner"]


def read_vendor(name: str) -> str:
    p = VENDOR / name
    if not p.exists():
        sys.exit(f"missing vendor file: {p}\n  see build-standalone.py header for refresh steps")
    return p.read_text()


def b64_data_uri(path: Path, mime: str = "image/png") -> str:
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def replace_or_die(html: str, pattern: str, replacement: str, label: str) -> str:
    new, n = re.subn(pattern, lambda _: replacement, html, count=1)
    if n == 0:
        sys.exit(f"build error: pattern not found while inlining {label}\n  pattern: {pattern}")
    return new


def build() -> None:
    print("aesdr · standalone build")
    DIST.mkdir(exist_ok=True)

    # ---- read local sources ----
    html = HTML_SRC.read_text()
    css = CSS_SRC.read_text()
    primitives_jsx = (JSX_DIR / "primitives.jsx").read_text()
    directions_jsx = (JSX_DIR / "directions.jsx").read_text()
    synthesis_jsx  = (JSX_DIR / "synthesis.jsx").read_text()

    # ---- read vendored runtimes ----
    react     = read_vendor("react.production.min.js")
    react_dom = read_vendor("react-dom.production.min.js")
    babel     = read_vendor("babel.min.js")

    # ---- encode mascot PNGs as data URIs ----
    print("  encoding 8 mascot PNGs as base64…")
    png_map = {pose: b64_data_uri(PNG_DIR / f"leponeus-{pose}.png") for pose in POSES}
    png_init_script = (
        "<script>\n"
        "// Standalone build: inline the 8 mascot PNGs as data URIs.\n"
        "// synthesis.jsx's pngPath() picks these up via window.__MASCOT_PNG.\n"
        f"window.__MASCOT_PNG = {json.dumps(png_map)};\n"
        "</script>"
    )

    # ---- inline replacements ----
    # 1. CSS link → inline <style>
    html = replace_or_die(
        html,
        r'<link rel="stylesheet" href="\.\./colors_and_type\.css">',
        f"<style>\n{css}\n</style>",
        "colors_and_type.css",
    )

    # 2. CDN <script src="..."> → inline <script>
    html = replace_or_die(
        html,
        r'<script src="https://unpkg\.com/react@[^"]+"[^>]*></script>',
        f"<script>\n{react}\n</script>",
        "react",
    )
    html = replace_or_die(
        html,
        r'<script src="https://unpkg\.com/react-dom@[^"]+"[^>]*></script>',
        f"<script>\n{react_dom}\n</script>",
        "react-dom",
    )
    html = replace_or_die(
        html,
        r'<script src="https://unpkg\.com/@babel/standalone@[^"]+"[^>]*></script>',
        f"<script>\n{babel}\n</script>",
        "@babel/standalone",
    )

    # 3. JSX <script src="*.jsx"> → inline text/babel block
    # Inject the PNG-init script BEFORE the first JSX block (must be on window
    # before synthesis.jsx runs).
    html = replace_or_die(
        html,
        r'<script type="text/babel" src="primitives\.jsx"></script>',
        f'{png_init_script}\n<script type="text/babel" data-presets="react">\n{primitives_jsx}\n</script>',
        "primitives.jsx",
    )
    html = replace_or_die(
        html,
        r'<script type="text/babel" src="directions\.jsx"></script>',
        f'<script type="text/babel" data-presets="react">\n{directions_jsx}\n</script>',
        "directions.jsx",
    )
    html = replace_or_die(
        html,
        r'<script type="text/babel" src="synthesis\.jsx"></script>',
        f'<script type="text/babel" data-presets="react">\n{synthesis_jsx}\n</script>',
        "synthesis.jsx",
    )

    # ---- write output ----
    OUT.write_text(html)
    size_mb = OUT.stat().st_size / 1024 / 1024
    print(f"wrote {OUT.relative_to(ROOT)} ({size_mb:.1f} MB)")
    print("\nDouble-click to open. No server needed. Offline-capable except Google Fonts.")


if __name__ == "__main__":
    build()
