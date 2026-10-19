/* =========================================================
   ToolZen Hub
   World Clock: the city directory (Tool Pack 28)

   A SELECTION of well-known cities, written by hand for this site,
   each tied to the IANA time zone that keeps its clock. It is not a
   list of every city in the world and never claims to be: the page
   says so, and any time zone the browser supports can still be added
   by its IANA name (see clock-engine.js).

   Inclusion rule (no demand data exists, so none is claimed):
     - national capitals and best-known large cities, so that the
       countries people name most have an entry where the browser has
       a zone for them;
     - the major metros of India (the site's main audience);
     - at least one city for each unusual-offset zone (Kathmandu,
       Adelaide, Darwin, St John's, Tehran, Kabul, Yangon, Chatham,
       Lord Howe) and for the International Date Line extremes
       (Kiritimati, Pago Pago).
   One entry per (city, country). A second same-named city in one
   country is not included; it stays reachable through the zone search.

   Entry: { id, city, country, zone, region, aliases }
     id       slug of the city + "-" + lower-case ISO 3166-1 alpha-2
              country code, e.g. "mumbai-in", "london-gb", "london-ca".
              The country is part of the identity, so two cities with
              one name never share an id.
     country  two-letter ISO code; COUNTRY_NAMES gives the English name.
     zone     IANA identifier (modern spelling).
     region   Africa, Americas, Asia, Europe or Oceania. A browsing
              aid only, taken from the zone's IANA area (Atlantic and
              Indian zones are placed by hand below); not a statement
              about any border.
     aliases  0 to 3 other names people use.

   Zones and countries are checked against a pinned copy of the IANA
   zone.tab (tests/fixtures/zone-country.json) and against the
   browser at test time. Nothing here is fetched.
========================================================= */

export const MAX_ALIASES = 3;

export const REGIONS = Object.freeze(["Africa", "Americas", "Asia", "Europe", "Oceania"]);

export const COUNTRY_NAMES = Object.freeze({
    AE: "United Arab Emirates", AF: "Afghanistan", AM: "Armenia", AO: "Angola", AR: "Argentina",
    AS: "American Samoa", AT: "Austria", AU: "Australia", AZ: "Azerbaijan",
    BD: "Bangladesh", BE: "Belgium", BG: "Bulgaria", BH: "Bahrain", BO: "Bolivia",
    BR: "Brazil", BT: "Bhutan", BY: "Belarus",
    CA: "Canada", CD: "DR Congo", CH: "Switzerland", CI: "Ivory Coast", CL: "Chile",
    CN: "China", CO: "Colombia", CR: "Costa Rica", CU: "Cuba", CY: "Cyprus", CZ: "Czechia",
    DE: "Germany", DK: "Denmark", DO: "Dominican Republic", DZ: "Algeria",
    EC: "Ecuador", EE: "Estonia", EG: "Egypt", ES: "Spain", ET: "Ethiopia",
    FI: "Finland", FJ: "Fiji", FR: "France",
    GB: "United Kingdom", GE: "Georgia", GH: "Ghana", GR: "Greece", GT: "Guatemala", GU: "Guam",
    HK: "Hong Kong", HR: "Croatia", HU: "Hungary",
    ID: "Indonesia", IE: "Ireland", IL: "Israel", IN: "India", IQ: "Iraq", IR: "Iran", IS: "Iceland", IT: "Italy",
    JM: "Jamaica", JO: "Jordan", JP: "Japan",
    KE: "Kenya", KH: "Cambodia", KI: "Kiribati", KR: "South Korea", KW: "Kuwait", KZ: "Kazakhstan",
    LB: "Lebanon", LK: "Sri Lanka", LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", LY: "Libya",
    MA: "Morocco", MG: "Madagascar", MM: "Myanmar", MN: "Mongolia", MU: "Mauritius", MV: "Maldives",
    MX: "Mexico", MY: "Malaysia", MZ: "Mozambique",
    NA: "Namibia", NC: "New Caledonia", NG: "Nigeria", NL: "Netherlands", NO: "Norway", NP: "Nepal", NZ: "New Zealand",
    OM: "Oman",
    PA: "Panama", PE: "Peru", PF: "French Polynesia", PG: "Papua New Guinea", PH: "Philippines", PK: "Pakistan",
    PL: "Poland", PR: "Puerto Rico", PT: "Portugal", PY: "Paraguay",
    QA: "Qatar",
    RO: "Romania", RS: "Serbia", RU: "Russia",
    SA: "Saudi Arabia", SD: "Sudan", SE: "Sweden", SG: "Singapore", SN: "Senegal",
    TH: "Thailand", TN: "Tunisia", TO: "Tonga", TR: "Turkey", TW: "Taiwan", TZ: "Tanzania",
    UA: "Ukraine", UG: "Uganda", US: "United States", UY: "Uruguay", UZ: "Uzbekistan",
    VE: "Venezuela", VN: "Vietnam",
    WS: "Samoa",
    ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe"
});

/* zones whose IANA area does not say the region */
const REGION_OVERRIDES = Object.freeze({
    "Atlantic/Reykjavik": "Europe",
    "Indian/Maldives": "Asia",
    "Indian/Mauritius": "Africa",
    "Indian/Antananarivo": "Africa"
});

const AREA_REGIONS = Object.freeze({
    Africa: "Africa",
    America: "Americas",
    Asia: "Asia",
    Australia: "Oceania",
    Europe: "Europe",
    Pacific: "Oceania"
});

/* the region a zone belongs to by the rule above, or "" when the rule has no answer */
export function regionOf(zone) {
    return REGION_OVERRIDES[zone] ?? AREA_REGIONS[String(zone).split("/")[0]] ?? "";
}

/* lower case, accents removed, every run of other characters one space */
export function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/\p{M}+/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export function slugOf(city) {
    return normalizeText(city).replace(/ /g, "-");
}

/* [city, country, zone, aliases] */
const ROWS = [
    /* Asia */
    ["Mumbai", "IN", "Asia/Kolkata", ["Bombay"]],
    ["Delhi", "IN", "Asia/Kolkata", ["New Delhi"]],
    ["Bengaluru", "IN", "Asia/Kolkata", ["Bangalore"]],
    ["Chennai", "IN", "Asia/Kolkata", ["Madras"]],
    ["Kolkata", "IN", "Asia/Kolkata", ["Calcutta"]],
    ["Hyderabad", "IN", "Asia/Kolkata"],
    ["Pune", "IN", "Asia/Kolkata", ["Poona"]],
    ["Ahmedabad", "IN", "Asia/Kolkata"],
    ["Karachi", "PK", "Asia/Karachi"],
    ["Lahore", "PK", "Asia/Karachi"],
    ["Islamabad", "PK", "Asia/Karachi"],
    ["Hyderabad", "PK", "Asia/Karachi"],
    ["Dhaka", "BD", "Asia/Dhaka", ["Dacca"]],
    ["Colombo", "LK", "Asia/Colombo"],
    ["Kathmandu", "NP", "Asia/Kathmandu", ["Katmandu"]],
    ["Thimphu", "BT", "Asia/Thimphu"],
    ["Kabul", "AF", "Asia/Kabul"],
    ["Tashkent", "UZ", "Asia/Tashkent"],
    ["Almaty", "KZ", "Asia/Almaty"],
    ["Tehran", "IR", "Asia/Tehran", ["Teheran"]],
    ["Baghdad", "IQ", "Asia/Baghdad"],
    ["Dubai", "AE", "Asia/Dubai"],
    ["Abu Dhabi", "AE", "Asia/Dubai"],
    ["Doha", "QA", "Asia/Qatar"],
    ["Riyadh", "SA", "Asia/Riyadh"],
    ["Jeddah", "SA", "Asia/Riyadh"],
    ["Kuwait City", "KW", "Asia/Kuwait"],
    ["Muscat", "OM", "Asia/Muscat"],
    ["Manama", "BH", "Asia/Bahrain"],
    ["Tel Aviv", "IL", "Asia/Jerusalem", ["Tel Aviv-Yafo"]],
    ["Jerusalem", "IL", "Asia/Jerusalem"],
    ["Amman", "JO", "Asia/Amman"],
    ["Beirut", "LB", "Asia/Beirut"],
    ["Nicosia", "CY", "Asia/Nicosia"],
    ["Baku", "AZ", "Asia/Baku"],
    ["Tbilisi", "GE", "Asia/Tbilisi"],
    ["Yerevan", "AM", "Asia/Yerevan"],
    ["Bangkok", "TH", "Asia/Bangkok"],
    ["Hanoi", "VN", "Asia/Ho_Chi_Minh"],
    ["Ho Chi Minh City", "VN", "Asia/Ho_Chi_Minh", ["Saigon"]],
    ["Phnom Penh", "KH", "Asia/Phnom_Penh"],
    ["Yangon", "MM", "Asia/Yangon", ["Rangoon"]],
    ["Kuala Lumpur", "MY", "Asia/Kuala_Lumpur", ["KL"]],
    ["Singapore", "SG", "Asia/Singapore"],
    ["Jakarta", "ID", "Asia/Jakarta"],
    ["Manila", "PH", "Asia/Manila"],
    ["Hong Kong", "HK", "Asia/Hong_Kong", ["HK"]],
    ["Beijing", "CN", "Asia/Shanghai", ["Peking"]],
    ["Shanghai", "CN", "Asia/Shanghai"],
    ["Shenzhen", "CN", "Asia/Shanghai"],
    ["Taipei", "TW", "Asia/Taipei"],
    ["Seoul", "KR", "Asia/Seoul"],
    ["Tokyo", "JP", "Asia/Tokyo"],
    ["Osaka", "JP", "Asia/Tokyo"],
    ["Ulaanbaatar", "MN", "Asia/Ulaanbaatar", ["Ulan Bator"]],
    ["Malé", "MV", "Indian/Maldives"],

    /* Europe */
    ["London", "GB", "Europe/London"],
    ["Birmingham", "GB", "Europe/London"],
    ["Edinburgh", "GB", "Europe/London"],
    ["Dublin", "IE", "Europe/Dublin"],
    ["Lisbon", "PT", "Europe/Lisbon", ["Lisboa"]],
    ["Madrid", "ES", "Europe/Madrid"],
    ["Barcelona", "ES", "Europe/Madrid"],
    ["Paris", "FR", "Europe/Paris"],
    ["Brussels", "BE", "Europe/Brussels"],
    ["Amsterdam", "NL", "Europe/Amsterdam"],
    ["Luxembourg", "LU", "Europe/Luxembourg"],
    ["Berlin", "DE", "Europe/Berlin"],
    ["Frankfurt", "DE", "Europe/Berlin"],
    ["Munich", "DE", "Europe/Berlin", ["München"]],
    ["Zurich", "CH", "Europe/Zurich"],
    ["Geneva", "CH", "Europe/Zurich"],
    ["Vienna", "AT", "Europe/Vienna", ["Wien"]],
    ["Rome", "IT", "Europe/Rome", ["Roma"]],
    ["Milan", "IT", "Europe/Rome", ["Milano"]],
    ["Athens", "GR", "Europe/Athens"],
    ["Copenhagen", "DK", "Europe/Copenhagen"],
    ["Stockholm", "SE", "Europe/Stockholm"],
    ["Oslo", "NO", "Europe/Oslo"],
    ["Helsinki", "FI", "Europe/Helsinki"],
    ["Reykjavik", "IS", "Atlantic/Reykjavik"],
    ["Warsaw", "PL", "Europe/Warsaw"],
    ["Prague", "CZ", "Europe/Prague"],
    ["Budapest", "HU", "Europe/Budapest"],
    ["Bucharest", "RO", "Europe/Bucharest"],
    ["Sofia", "BG", "Europe/Sofia"],
    ["Belgrade", "RS", "Europe/Belgrade"],
    ["Zagreb", "HR", "Europe/Zagreb"],
    ["Riga", "LV", "Europe/Riga"],
    ["Tallinn", "EE", "Europe/Tallinn"],
    ["Vilnius", "LT", "Europe/Vilnius"],
    ["Kyiv", "UA", "Europe/Kyiv", ["Kiev"]],
    ["Minsk", "BY", "Europe/Minsk"],
    ["Moscow", "RU", "Europe/Moscow"],
    ["Saint Petersburg", "RU", "Europe/Moscow", ["St Petersburg"]],
    ["Istanbul", "TR", "Europe/Istanbul"],

    /* Africa */
    ["Cairo", "EG", "Africa/Cairo"],
    ["Lagos", "NG", "Africa/Lagos"],
    ["Accra", "GH", "Africa/Accra"],
    ["Abidjan", "CI", "Africa/Abidjan"],
    ["Dakar", "SN", "Africa/Dakar"],
    ["Casablanca", "MA", "Africa/Casablanca"],
    ["Algiers", "DZ", "Africa/Algiers"],
    ["Tunis", "TN", "Africa/Tunis"],
    ["Tripoli", "LY", "Africa/Tripoli"],
    ["Khartoum", "SD", "Africa/Khartoum"],
    ["Addis Ababa", "ET", "Africa/Addis_Ababa"],
    ["Nairobi", "KE", "Africa/Nairobi"],
    ["Kampala", "UG", "Africa/Kampala"],
    ["Dar es Salaam", "TZ", "Africa/Dar_es_Salaam"],
    ["Kinshasa", "CD", "Africa/Kinshasa"],
    ["Luanda", "AO", "Africa/Luanda"],
    ["Lusaka", "ZM", "Africa/Lusaka"],
    ["Harare", "ZW", "Africa/Harare"],
    ["Maputo", "MZ", "Africa/Maputo"],
    ["Windhoek", "NA", "Africa/Windhoek"],
    ["Johannesburg", "ZA", "Africa/Johannesburg", ["Joburg"]],
    ["Cape Town", "ZA", "Africa/Johannesburg"],
    ["Port Louis", "MU", "Indian/Mauritius"],
    ["Antananarivo", "MG", "Indian/Antananarivo"],

    /* Americas */
    ["New York", "US", "America/New_York", ["NYC", "New York City"]],
    ["Boston", "US", "America/New_York"],
    ["Washington, D.C.", "US", "America/New_York", ["Washington DC", "DC"]],
    ["Philadelphia", "US", "America/New_York"],
    ["Atlanta", "US", "America/New_York"],
    ["Miami", "US", "America/New_York"],
    ["Detroit", "US", "America/Detroit"],
    ["Chicago", "US", "America/Chicago"],
    ["Houston", "US", "America/Chicago"],
    ["Dallas", "US", "America/Chicago"],
    ["Birmingham", "US", "America/Chicago"],
    ["Denver", "US", "America/Denver"],
    ["Phoenix", "US", "America/Phoenix"],
    ["Los Angeles", "US", "America/Los_Angeles", ["LA"]],
    ["San Francisco", "US", "America/Los_Angeles", ["SF"]],
    ["San Jose", "US", "America/Los_Angeles"],
    ["Seattle", "US", "America/Los_Angeles"],
    ["Las Vegas", "US", "America/Los_Angeles"],
    ["Anchorage", "US", "America/Anchorage"],
    ["Toronto", "CA", "America/Toronto"],
    ["Ottawa", "CA", "America/Toronto"],
    ["Montreal", "CA", "America/Toronto"],
    ["London", "CA", "America/Toronto"],
    ["Winnipeg", "CA", "America/Winnipeg"],
    ["Calgary", "CA", "America/Edmonton"],
    ["Edmonton", "CA", "America/Edmonton"],
    ["Vancouver", "CA", "America/Vancouver"],
    ["Halifax", "CA", "America/Halifax"],
    ["St. John's", "CA", "America/St_Johns", ["Saint John's", "St Johns"]],
    ["Mexico City", "MX", "America/Mexico_City", ["Ciudad de México"]],
    ["Guadalajara", "MX", "America/Mexico_City"],
    ["Monterrey", "MX", "America/Monterrey"],
    ["Tijuana", "MX", "America/Tijuana"],
    ["Guatemala City", "GT", "America/Guatemala"],
    ["San José", "CR", "America/Costa_Rica"],
    ["Panama City", "PA", "America/Panama"],
    ["Havana", "CU", "America/Havana", ["La Habana"]],
    ["Kingston", "JM", "America/Jamaica"],
    ["Santo Domingo", "DO", "America/Santo_Domingo"],
    ["San Juan", "PR", "America/Puerto_Rico"],
    ["Bogotá", "CO", "America/Bogota"],
    ["Quito", "EC", "America/Guayaquil"],
    ["Lima", "PE", "America/Lima"],
    ["Caracas", "VE", "America/Caracas"],
    ["La Paz", "BO", "America/La_Paz"],
    ["Santiago", "CL", "America/Santiago"],
    ["Buenos Aires", "AR", "America/Argentina/Buenos_Aires"],
    ["Montevideo", "UY", "America/Montevideo"],
    ["Asunción", "PY", "America/Asuncion"],
    ["São Paulo", "BR", "America/Sao_Paulo"],
    ["Rio de Janeiro", "BR", "America/Sao_Paulo", ["Rio"]],
    ["Brasília", "BR", "America/Sao_Paulo"],
    ["Manaus", "BR", "America/Manaus"],

    /* Oceania */
    ["Sydney", "AU", "Australia/Sydney"],
    ["Canberra", "AU", "Australia/Sydney"],
    ["Melbourne", "AU", "Australia/Melbourne"],
    ["Brisbane", "AU", "Australia/Brisbane"],
    ["Adelaide", "AU", "Australia/Adelaide"],
    ["Darwin", "AU", "Australia/Darwin"],
    ["Perth", "AU", "Australia/Perth"],
    ["Hobart", "AU", "Australia/Hobart"],
    ["Lord Howe Island", "AU", "Australia/Lord_Howe"],
    ["Auckland", "NZ", "Pacific/Auckland"],
    ["Wellington", "NZ", "Pacific/Auckland"],
    ["Chatham Islands", "NZ", "Pacific/Chatham"],
    ["Suva", "FJ", "Pacific/Fiji"],
    ["Port Moresby", "PG", "Pacific/Port_Moresby"],
    ["Noumea", "NC", "Pacific/Noumea"],
    ["Papeete", "PF", "Pacific/Tahiti"],
    ["Honolulu", "US", "Pacific/Honolulu"],
    ["Hagåtña", "GU", "Pacific/Guam", ["Guam"]],
    ["Pago Pago", "AS", "Pacific/Pago_Pago"],
    ["Apia", "WS", "Pacific/Apia"],
    ["Nuku'alofa", "TO", "Pacific/Tongatapu"],
    ["Kiritimati", "KI", "Pacific/Kiritimati", ["Christmas Island"]]
];

export const DIRECTORY = Object.freeze(
    ROWS.map(([city, country, zone, aliases = []]) =>
        Object.freeze({
            id: `${slugOf(city)}-${country.toLowerCase()}`,
            city,
            country,
            zone,
            region: regionOf(zone),
            aliases: Object.freeze([...aliases])
        })
    )
);

const BY_ID = new Map(DIRECTORY.map((entry) => [entry.id, entry]));

/* a Map, never an object: ids such as "__proto__" or "constructor" find nothing */
export const getEntry = (id, directory = DIRECTORY) =>
    directory === DIRECTORY
        ? BY_ID.get(id) ?? null
        : directory.find((entry) => entry.id === id) ?? null;

export const countryName = (code) =>
    COUNTRY_NAMES[code] ?? code;

/* "Mumbai, India" */
export const placeName = (entry) =>
    `${entry.city}, ${countryName(entry.country)}`;


/* =========================================================
   Search
========================================================= */

const prepared = new WeakMap();

function fieldsOf(entry) {

    let fields = prepared.get(entry);

    if (!fields) {

        const names = [entry.city, ...entry.aliases].map(normalizeText);

        fields = {
            names,
            country: normalizeText(countryName(entry.country)),
            code: entry.country.toLowerCase(),
            city: names[0],
            zone: normalizeText(entry.zone),
            zoneLast: normalizeText(entry.zone.split("/").pop())
        };

        prepared.set(entry, fields);

    }

    return fields;

}

/* does the typed word match inside one name? Names of three letters or fewer (aliases such as "LA") match only exactly. */
function wordMatchesName(word, name) {

    if (name.length <= 3) {
        return name === word;
    }

    if (name.split(" ").some((part) => part.startsWith(word))) {
        return true;
    }

    return word.length >= 3 && name.includes(word);

}

/*
 * Entries matching what the visitor typed, best first.
 *   Every typed word must match: a word of the city or an alias, or of
 *   the country name, or the exact two-letter country code, or (only when
 *   the query looks like a zone path, with a slash or underscore) a word
 *   of the city's IANA zone name (Asia/Tokyo).
 *   Rank: 0 the city or an alias is exactly the query; 1 one starts
 *   with it (or the city gives its zone its name); 2 a word of one
 *   starts with it; 3 matched through the country or the zone;
 *   4 contained in a name. Then alphabetical by city (plain
 *   comparison, never the browser's locale), then the directory's own
 *   order for cities that share a name.
 */
export function searchDirectory(query, { region = "", limit = 10, entries = DIRECTORY } = {}) {

    const q = normalizeText(query);

    if (q === "") {
        return [];
    }

    const words = q.split(" ");

    /* zone names are searched only when the visitor typed one (a slash or an underscore): "london" must not also list every city on Europe/London */
    const zoneQuery = /[/_]/.test(String(query));

    const scored = [];

    for (const entry of entries) {

        if (region && entry.region !== region) {
            continue;
        }

        const f = fieldsOf(entry);

        let throughCountry = false;
        let throughZone = false;
        let matches = true;

        for (const word of words) {

            if (f.names.some((name) => wordMatchesName(word, name))) {
                continue;
            }

            if (f.country.split(" ").some((part) => part.startsWith(word)) || word === f.code) {
                throughCountry = true;
                continue;
            }

            /* the zone's own name, so "America/Chicago" finds the cities that keep that clock */
            if (zoneQuery && f.zone.split(" ").some((part) => part.startsWith(word))) {
                throughZone = true;
                continue;
            }

            matches = false;
            break;

        }

        if (!matches) {
            continue;
        }

        let rank;

        if (throughCountry || throughZone) {
            /* the city that gives the zone its name (Tokyo for Asia/Tokyo) outranks the others in it */
            rank = !throughCountry && f.zoneLast === f.city ? 1 : 3;
        } else if (f.names.includes(q)) {
            rank = 0;
        } else if (f.names.some((name) => name.length > 3 && name.startsWith(q))) {
            rank = 1;
        } else if (f.names.some((name) => name.length > 3 && name.split(" ").some((part) => part.startsWith(words[0])))) {
            rank = 2;
        } else {
            rank = 4;
        }

        scored.push({ entry, rank, city: f.city, order: scored.length });

    }

    /* same rank and same city name: the directory's own order, which lists the better-known city first (London, United Kingdom before London, Canada) */
    scored.sort((a, b) =>
        a.rank - b.rank
        || (a.city < b.city ? -1 : a.city > b.city ? 1 : 0)
        || a.order - b.order
    );

    return scored.slice(0, limit).map((item) => item.entry);

}

/* every entry of a region, alphabetical (the browse list); `total` is how many there are before the cap */
export function browseRegion(region, { limit = 60, entries = DIRECTORY } = {}) {

    const all = entries
        .filter((entry) => entry.region === region)
        .sort((a, b) => {
            const x = normalizeText(a.city);
            const y = normalizeText(b.city);
            return (x < y ? -1 : x > y ? 1 : 0) || (a.country < b.country ? -1 : 1);
        });

    return { entries: all.slice(0, limit), total: all.length };

}
