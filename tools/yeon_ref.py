#!/usr/bin/env python3
"""Extract exactly one YEON locked reference image from the handoff ZIP.
Usage: python tools/yeon_ref.py YEON_LOCKED_DESIGN_CODEX_HANDOFF.zip labs out/references
Read the selected image visually; never print/base64 the whole ZIP into agent context.
"""
import hashlib
import sys
import zipfile
from pathlib import Path

PAGES = {
    "home": "01_HOMEPAGE/LOCKED_homepage_fog_layers_nav.png",
    "labs": "02_LAB_DNA/LOCKED_lab_dna_white_steel_blue_filters.png",
    "papers": "03_PAPERS/LOCKED_papers_search_filter_inspector.png",
    "methods": "04_METHODS/METHODS_last_polished_candidate_verify.png",
    "compare": "05_LAB_COMPARE/LOCKED_lab_compare_three_column_overlap.png",
    "constellation": "06_CONSTELLATION/LOCKED_constellation_evidence_loom_light.png",
}
def main():
    if len(sys.argv) != 4 or sys.argv[2] not in PAGES:
        raise SystemExit("Usage: yeon_ref.py ZIP {home|labs|papers|methods|compare|constellation} OUT_DIR")
    archive, page, folder = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
    suffix = "01_PRIMARY_DESIGN_REFERENCES/" + PAGES[page]
    with zipfile.ZipFile(archive) as z:
        matches = [n for n in z.namelist() if n.endswith(suffix) and not n.endswith("/")]
        if len(matches) != 1:
            raise RuntimeError(f"Expected one locked image for {page}; got {len(matches)}")
        data = z.read(matches[0])
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / (page + ".png")
    path.write_bytes(data)
    print(path.as_posix(), "SHA256", hashlib.sha256(data).hexdigest(), "bytes", len(data))
if __name__ == "__main__":
    main()
