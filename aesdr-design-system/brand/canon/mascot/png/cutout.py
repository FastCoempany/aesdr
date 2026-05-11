#!/usr/bin/env python3
"""Background-remove the cloud-backdrop source PNGs into transparent cutouts.

Usage (from repo root):
    python3 -m pip install rembg onnxruntime    # one-time, ~200MB model dl
    python3 aesdr-design-system/brand/canon/mascot/png/cutout.py

Reads:  brand/canon/mascot/png/source/leponeus-*.png
Writes: brand/canon/mascot/png/leponeus-*.png    (transparent PNGs)

Re-run any time you regenerate a source PNG. Existing cutouts are overwritten.
"""
from pathlib import Path
import sys
import time

try:
    from rembg import remove, new_session
except ImportError:
    sys.exit("missing dep: pip install rembg onnxruntime")

HERE = Path(__file__).resolve().parent
SRC = HERE / "source"
DST = HERE

POSES = ["doctrine", "diagnosis", "sprint", "fall",
         "recovery", "rest", "verdict", "owner"]

def main():
    if not SRC.is_dir():
        sys.exit(f"missing source dir: {SRC}")

    # isnet-general-use produces cleaner edges than u2net on iridescent
    # subjects. alpha_matting refines the soft edge between fur/scales and bg.
    session = new_session("isnet-general-use")

    for name in POSES:
        fp_in = SRC / f"leponeus-{name}.png"
        fp_out = DST / f"leponeus-{name}.png"
        if not fp_in.exists():
            print(f"  skip {name} (no source)")
            continue
        t = time.time()
        cut = remove(
            fp_in.read_bytes(),
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )
        fp_out.write_bytes(cut)
        print(f"  {name}: {time.time()-t:.1f}s  {fp_out.stat().st_size//1024} KB")

    print("done")

if __name__ == "__main__":
    main()
