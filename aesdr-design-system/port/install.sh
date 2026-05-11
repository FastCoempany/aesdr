#!/usr/bin/env bash
# AESDR brand port — copies foundation files from the design-system canon
# into their target paths on `main`.
#
# Run this from the repo root, on a fresh branch off main:
#
#     git checkout aesdr-design-system -- aesdr-design-system/port
#     bash aesdr-design-system/port/install.sh
#
# The script is re-runnable. Existing files at target paths are overwritten
# (so re-running after a canon update is safe and idempotent).
#
# After the script:
#   - public/mascot/leponeus-{8}.png   (the 8 transparent iridescent PNGs)
#   - components/brand/Mascot.tsx       (the typed React component)
#   - utils/brand/lesson-poses.ts       (the lesson → pose constant)
#   - app/opengraph-image.tsx           (the OG card)
#   - app/twitter-image.tsx             (re-exports opengraph-image)

set -euo pipefail

PORT_DIR="aesdr-design-system/port"
REPO_ROOT="$(pwd)"

if [ ! -d "$PORT_DIR" ]; then
  cat >&2 <<EOF
ERROR: $PORT_DIR not found.

Materialize the port dir first (from the canon branch):

    git checkout aesdr-design-system -- aesdr-design-system/port

Then re-run this script from the repo root.
EOF
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found. Run this script from the repo root." >&2
  exit 1
fi

echo "AESDR brand port · installing foundation files"
echo "  from: $PORT_DIR"
echo "  to:   $REPO_ROOT"
echo

# 1. Mascot PNGs → public/mascot/
echo "→ mascot PNGs"
mkdir -p "$REPO_ROOT/public/mascot"
cp -v "$PORT_DIR/public/mascot/"leponeus-*.png "$REPO_ROOT/public/mascot/"
echo

# 2. Mascot React component → components/brand/
echo "→ components/brand/Mascot.tsx"
mkdir -p "$REPO_ROOT/components/brand"
cp -v "$PORT_DIR/components/brand/Mascot.tsx" "$REPO_ROOT/components/brand/"
echo

# 3. Lesson-pose constant → utils/brand/
echo "→ utils/brand/lesson-poses.ts"
mkdir -p "$REPO_ROOT/utils/brand"
cp -v "$PORT_DIR/utils/brand/lesson-poses.ts" "$REPO_ROOT/utils/brand/"
echo

# 4. OG card routes → app/
echo "→ app/opengraph-image.tsx + app/twitter-image.tsx"
cp -v "$PORT_DIR/app/opengraph-image.tsx" "$REPO_ROOT/app/"
cp -v "$PORT_DIR/app/twitter-image.tsx" "$REPO_ROOT/app/"
echo

echo "─────────────────────────────────────────────────────"
echo "✔ Foundation files installed."
echo
echo "Next steps:"
echo
echo "  1. Verify types + build:"
echo "       npm run lint"
echo "       npm run build"
echo
echo "  2. Smoke-test the OG card:"
echo "       npm run dev"
echo "       open http://localhost:3000/opengraph-image"
echo
echo "  3. Stage + commit:"
echo "       git add public/mascot \\"
echo "               components/brand \\"
echo "               utils/brand \\"
echo "               app/opengraph-image.tsx \\"
echo "               app/twitter-image.tsx"
echo "       git commit -m 'foundation: AESDR brand port (mascot, lesson-poses, OG card)'"
echo "       git push -u origin <branch>"
echo
echo "  4. Open a PR. State file: state0511-design-system.md"
echo "─────────────────────────────────────────────────────"
