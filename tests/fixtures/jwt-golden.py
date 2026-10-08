"""
Independent reference vectors for the JWT Decoder (Tool Pack 22).

Written with the Python standard library only (base64, json, datetime), NOT from the JavaScript engine, so a
mistake in the engine cannot be copied into the expected values. It builds tokens from known header and payload
text, encodes them with Python's own base64url, and works out the UTC dates of NumericDate values with datetime.

Run:  python tests/fixtures/jwt-golden.py   (writes tests/fixtures/jwt-golden.json)
The unit test tests/unit/jwt-decoder.test.mjs reads that file.
"""
import base64
import json
import os
import sys
from datetime import datetime, timedelta, timezone

sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))


def b64url(data, padded=False):
    text = base64.urlsafe_b64encode(data).decode("ascii")
    return text if padded else text.rstrip("=")


def pretty(text):
    """what the formatter must show: the parsed object, two-space indent, characters as they are"""
    return json.dumps(json.loads(text), indent=2, ensure_ascii=False)


def token(header_text, payload_text, signature=b"example-signature-not-real-0000000", padded=False):
    return ".".join([
        b64url(header_text.encode("utf-8"), padded),
        b64url(payload_text.encode("utf-8"), padded),
        b64url(signature, padded) if signature is not None else "",
    ])


HEADER = '{"alg":"HS256","typ":"JWT"}'
EXAMPLE_PAYLOAD = ('{"iss":"https://issuer.example.invalid","sub":"example-user-001","aud":"example-app",'
                   '"name":"Ada Example","iat":1700000000,"nbf":1700000000,"exp":1700003600,"jti":"example-0001"}')

# payloads whose UTF-8 length modulo 3 is 0, 1 and 2, so the unpadded base64url ends after 4, 2 and 3 characters
PAD_PAYLOADS = ['{"a":"xxxxx"}', '{"a":"xxxx"}', '{"a":"xxx"}']

UNICODE_PAYLOADS = [
    # raw UTF-8: accented, CJK, an astral emoji
    '{"name":"Ren' + chr(0xe9) + 'e","city":"' + chr(0x6771) + chr(0x4eac) + '","mood":"' + chr(0x1F600) + '"}',
    # the same kinds of characters as JSON escapes (a surrogate pair for the emoji)
    '{"name":"Ren\\u00e9e","city":"\\u6771\\u4eac","mood":"\\ud83d\\ude00"}',
]


def utc_text(seconds):
    whole = int(seconds // 1)
    frac = seconds - whole
    base = datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=whole)
    text = base.strftime("%Y-%m-%dT%H:%M:%S")
    if frac:
        text += ("%.3f" % frac)[1:].rstrip("0")
    return text + "Z"


def local_text(seconds, offset_minutes):
    whole = int(seconds // 1)
    zone = timezone(timedelta(minutes=offset_minutes))
    try:
        return (datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=whole)).astimezone(zone).strftime("%Y-%m-%d %H:%M:%S")
    except OverflowError:  # past the last year Python can write; the test does not compare these
        return None


TIME_VALUES = [0, 1, -1, 1700000000, 1700003600, 951782400, 253402300799, 1700000000.5]

out = {
    "example": token(HEADER, EXAMPLE_PAYLOAD),
    "exampleHeader": pretty(HEADER),
    "examplePayload": pretty(EXAMPLE_PAYLOAD),
    "padding": [
        {"payload": p, "unpadded": token(HEADER, p), "padded": token(HEADER, p, padded=True), "pretty": pretty(p)}
        for p in PAD_PAYLOADS
    ],
    "unicode": [{"payload": p, "token": token(HEADER, p), "pretty": pretty(p)} for p in UNICODE_PAYLOADS],
    "unsigned": {"token": token('{"alg":"none"}', '{"sub":"x"}', signature=None)},
    "times": [{"seconds": s, "utc": utc_text(s), "kolkata": local_text(s, 330), "newYorkWinter": local_text(s, -300)} for s in TIME_VALUES],
    # a winter and a summer instant in New York (UTC-5 and UTC-4)
    "newYork": {"winter": {"seconds": 1700000000, "local": local_text(1700000000, -300)}, "summer": {"seconds": 1720000000, "local": local_text(1720000000, -240)}},
}

with open(os.path.join(HERE, "jwt-golden.json"), "w", encoding="ascii", newline="\n") as f:
    json.dump(out, f, indent=1, ensure_ascii=True)
    f.write("\n")

print("wrote tests/fixtures/jwt-golden.json")
