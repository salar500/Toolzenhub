"""
Pinned zone-to-country reference for the World Clock city directory (Tool Pack 28).

It reads the IANA `zone.tab` and `iso3166.tab` that ship inside the Python `tzdata` package and writes, for every zone in zone.tab, the
ISO 3166-1 country code(s) that list it, plus the list of valid country codes and the tzdata release they came from. Nothing else is kept
(no coordinates, no comments): the file only answers "does this zone belong to this country?".

The JavaScript tests read the committed zone-country.json. They do NOT need Python or a local tzdata install. Run this script only when
the pinned release is changed on purpose, then review the diff:

    python tests/fixtures/zone-country.py > tests/fixtures/zone-country.json

Run it with a Python that can see the tzdata package (not `python -I`, which hides user site-packages). Python 3.9+.
"""
import json
from importlib import resources

import tzdata


def rows(name):
    text = (resources.files("tzdata.zoneinfo") / name).read_text(encoding="utf-8")
    return [line.split("\t") for line in text.splitlines() if line and not line.startswith("#")]


zones = {}
for cols in rows("zone.tab"):
    # country code(s) \t coordinates \t zone \t [comment]
    codes, zone = cols[0], cols[2]
    zones.setdefault(zone, [])
    for code in codes.split(","):
        if code not in zones[zone]:
            zones[zone].append(code)

countries = sorted(cols[0] for cols in rows("iso3166.tab"))

print(json.dumps({
    "tzdata": tzdata.IANA_VERSION,
    "source": "zone.tab and iso3166.tab from the Python tzdata package",
    "zones": {zone: sorted(codes) for zone, codes in sorted(zones.items())},
    "countries": countries,
}, indent=1, ensure_ascii=False))
