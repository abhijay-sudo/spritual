"""Package the synced Capacitor iOS source for a Mac with full Xcode.

This deliberately does not claim to create a signed IPA or upload to TestFlight.
Run `npm run mobile:sync` before packaging.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "Spritual-iOS-build-handoff-0.1.0.zip"
PREFIX = "Spritual-iOS-build-handoff-0.1.0"
SOURCES = (
    "package.json",
    "package-lock.json",
    "web/package.json",
    "web/index.html",
    "web/tsconfig.json",
    "web/vite.config.ts",
    "web/capacitor.config.ts",
)
DIRECTORIES = ("web/src", "web/public", "web/ios", "packages")
EXCLUDED_PARTS = {
    "node_modules", "Pods", "DerivedData", "xcuserdata", "build",
    "output", "dist", "dist-native", "__pycache__", ".git",
}
EXCLUDED_NAMES = {".DS_Store", "tsconfig.tsbuildinfo"}

README = """# Spritual iOS build handoff (local alpha 0.1.0)

This ZIP contains the current Capacitor iOS Xcode project, its synchronized
offline web assets, and the source/lockfile needed to rebuild them. It is
**not an IPA** and cannot be installed directly on an iPhone.

On a Mac with full Xcode and sufficient disk space:

1. Extract this ZIP, then `cd Spritual-iOS-build-handoff-0.1.0`.
2. Run `npm ci` (Node 22.18+). A fresh install from this ZIP has not yet been
   exercised on another Mac.
3. Run `npm run build:native -w web` and
   `npm exec -w web -- cap sync ios`.
4. Open `web/ios/App/App.xcodeproj` in Xcode. Select an Apple Developer team;
   confirm that `in.co.spiritual.app` is available to that team or choose an
   owned test bundle identifier. Let Xcode resolve the Swift packages.
5. Build and test on an iPhone. For a friend on a separate device, archive and
   distribute through TestFlight, or use Ad Hoc signing with her registered
   device and the required distribution certificate/profile.

TestFlight requires a configured App Store Connect app and build upload.
External testers need an external group and Apple's beta review before they
can install. Do not tell a tester that this ZIP is an installable app.

This is a demo of three source-linked Gita selections with unreviewed original
explanations. Source redistribution rights and editorial approval remain
unresolved. There is no real account, payment, teacher approval or live AI.
Private notes are local to the installed app and not synced from a browser.
Do not distribute it as a public release or imply content approval.
"""


def include(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    return (
        path.is_file()
        and not path.is_symlink()
        and not any(part in EXCLUDED_PARTS for part in relative.parts)
        and path.name not in EXCLUDED_NAMES
        and not path.name.startswith(".env")
        and path.suffix not in {".p12", ".mobileprovision", ".provisionprofile", ".xcuserstate"}
    )


files = [ROOT / name for name in SOURCES]
for directory in DIRECTORIES:
    files.extend(path for path in (ROOT / directory).rglob("*") if include(path))
files = sorted(set(files), key=lambda path: path.relative_to(ROOT).as_posix())
if not all(path.is_file() for path in files):
    raise SystemExit("A required source file is missing")
if not (ROOT / "web/ios/App/App/public/index.html").is_file():
    raise SystemExit("Synced iOS web assets are missing; run npm run mobile:sync")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
    archive.writestr(f"{PREFIX}/README.md", README)
    for path in files:
        archive.write(path, f"{PREFIX}/{path.relative_to(ROOT).as_posix()}")

digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
print(json.dumps({"path": str(OUTPUT), "files": len(files) + 1, "bytes": OUTPUT.stat().st_size, "sha256": digest}, indent=2))
