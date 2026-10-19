"""
Generates assets/js/tools/world-clock/country-zones.js, the World Clock's country to time-zone data.

The data is the IANA zone.tab that ships inside the Python tzdata package: for every country (ISO 3166-1 alpha-2) the zones the
database lists for it, in zone.tab order, and the short description zone.tab gives a zone where a country has several ("Eastern
(most areas)", "New South Wales (most areas)"). Nothing else is kept: no coordinates, no names. The relationships are IANA's own;
the generator adds and removes nothing.

It is NOT the test fixture. tests/fixtures/zone-country.json is the pinned record the tests compare this file against; the product
reads this file, which carries the descriptions the fixture leaves out.

    python scripts/world-clock/generate-country-zones.py > assets/js/tools/world-clock/country-zones.js

Run it with a Python that can see the tzdata package (not `python -I`). Run it only when the pinned tzdata release is changed on
purpose, regenerate tests/fixtures/zone-country.json with its own script too, and review both diffs. Python 3.9+.
"""
import json
from importlib import resources

import tzdata

text = (resources.files("tzdata.zoneinfo") / "zone.tab").read_text(encoding="utf-8")

countries = {}
for line in text.splitlines():
    if not line or line.startswith("#"):
        continue
    cols = line.split("\t")
    code, zone = cols[0], cols[2]
    note = cols[3].strip() if len(cols) > 3 else ""
    assert "|" not in zone and "|" not in note, line
    for c in code.split(","):
        countries.setdefault(c, []).append(f"{zone}|{note}" if note else zone)

out = []
out.append("/* =========================================================")
out.append("   ToolZen Hub")
out.append("   World Clock: country to time-zone data (Tool Pack 28)")
out.append("")
out.append(f"   GENERATED from the IANA zone.tab in tzdata {tzdata.IANA_VERSION} by")
out.append("   scripts/world-clock/generate-country-zones.py. Do not edit by hand.")
out.append("")
out.append("   For each ISO 3166-1 country, the zones IANA lists for it, in zone.tab")
out.append("   order; a zone is \"Area/City\" or \"Area/City|description\" (zone.tab's own")
out.append("   words, given where a country has several zones). Loaded only when a")
out.append("   country or region is searched or browsed. It lists zones, not cities:")
out.append("   it says nothing about which cities exist.")
out.append("========================================================= */")
out.append("")
out.append(f"export const TZDATA = {json.dumps(tzdata.IANA_VERSION)};")
out.append("")
out.append("export const COUNTRY_ZONES = Object.freeze({")
items = sorted(countries.items())
for i, (code, zones) in enumerate(items):
    out.append(f"    {code}: {json.dumps(zones, ensure_ascii=False)}" + ("," if i < len(items) - 1 else ""))
out.append("});")
print("\n".join(out))
