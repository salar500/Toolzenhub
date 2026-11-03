/* Unit conversion with exact, defined factors to a base unit per kind of quantity.
   Length: metre (inch 0.0254, foot 0.3048, yard 0.9144 and mile 1609.344 m are exact by international agreement).
   Mass: kilogram (pound 0.45359237 kg, exact). Area: square metre. Volume: litre (US gallon 3.785411784 L and
   imperial gallon 4.54609 L are exact by definition; US fluid ounce 0.0295735295625 L; US cup 8 fl oz).
   Speed: metre per second (mph 0.44704, knot 1852/3600). Temperature uses formulas, not a factor. */

import { parseNumber } from "../common/number-text.js";

export const UNITS = [
    { id: "mm", group: "Length", label: "Millimetre (mm)", to: 0.001 },
    { id: "cm", group: "Length", label: "Centimetre (cm)", to: 0.01 },
    { id: "m", group: "Length", label: "Metre (m)", to: 1 },
    { id: "km", group: "Length", label: "Kilometre (km)", to: 1000 },
    { id: "in", group: "Length", label: "Inch (in)", to: 0.0254 },
    { id: "ft", group: "Length", label: "Foot (ft)", to: 0.3048 },
    { id: "yd", group: "Length", label: "Yard (yd)", to: 0.9144 },
    { id: "mi", group: "Length", label: "Mile (mi)", to: 1609.344 },

    { id: "mg", group: "Mass", label: "Milligram (mg)", to: 0.000001 },
    { id: "g", group: "Mass", label: "Gram (g)", to: 0.001 },
    { id: "kg", group: "Mass", label: "Kilogram (kg)", to: 1 },
    { id: "quintal", group: "Mass", label: "Quintal (100 kg)", to: 100 },
    { id: "tonne", group: "Mass", label: "Tonne (1,000 kg)", to: 1000 },
    { id: "oz", group: "Mass", label: "Ounce (oz)", to: 0.028349523125 },
    { id: "lb", group: "Mass", label: "Pound (lb)", to: 0.45359237 },

    { id: "sqm", group: "Area", label: "Square metre (m²)", to: 1 },
    { id: "sqkm", group: "Area", label: "Square kilometre (km²)", to: 1000000 },
    { id: "ha", group: "Area", label: "Hectare (ha)", to: 10000 },
    { id: "acre", group: "Area", label: "Acre", to: 4046.8564224 },
    { id: "sqft", group: "Area", label: "Square foot (ft²)", to: 0.09290304 },
    { id: "sqyd", group: "Area", label: "Square yard (yd²)", to: 0.83612736 },
    { id: "sqin", group: "Area", label: "Square inch (in²)", to: 0.00064516 },

    { id: "ml", group: "Volume", label: "Millilitre (mL)", to: 0.001 },
    { id: "l", group: "Volume", label: "Litre (L)", to: 1 },
    { id: "m3", group: "Volume", label: "Cubic metre (m³)", to: 1000 },
    { id: "usfloz", group: "Volume", label: "US fluid ounce", to: 0.0295735295625 },
    { id: "uscup", group: "Volume", label: "US cup", to: 0.2365882365 },
    { id: "usgal", group: "Volume", label: "US gallon", to: 3.785411784 },
    { id: "ukgal", group: "Volume", label: "UK (imperial) gallon", to: 4.54609 },

    { id: "ms", group: "Speed", label: "Metre per second (m/s)", to: 1 },
    { id: "kmh", group: "Speed", label: "Kilometre per hour (km/h)", to: 1 / 3.6 },
    { id: "mph", group: "Speed", label: "Mile per hour (mph)", to: 0.44704 },
    { id: "kn", group: "Speed", label: "Knot", to: 1852 / 3600 },

    { id: "c", group: "Temperature", label: "Celsius (°C)" },
    { id: "f", group: "Temperature", label: "Fahrenheit (°F)" },
    { id: "k", group: "Temperature", label: "Kelvin (K)" }
];

export const UNIT_OPTIONS = UNITS.map((u) => ({ value: u.id, label: u.label, group: u.group }));

const byId = (id) => UNITS.find((u) => u.id === id);

export function toKelvin(id, v) {

    return id === "c" ? v + 273.15 : id === "f" ? (v - 32) * 5 / 9 + 273.15 : v;

}

export function fromKelvin(id, k) {

    return id === "c" ? k - 273.15 : id === "f" ? (k - 273.15) * 9 / 5 + 32 : k;

}

/* the number as text with up to 10 significant digits and no rounding noise (0.1 + 0.2 style) */
export function show(value) {

    if (value === 0) return "0";

    const a = Math.abs(value);

    if (a >= 1e15 || a < 1e-7) {
        return Number(value.toPrecision(10)).toExponential().replace("e+", " x 10^").replace("e-", " x 10^-");
    }

    const rounded = Number(value.toPrecision(10));
    const [whole, frac = ""] = String(rounded).split(".");

    return `${Number(whole).toLocaleString("en-US")}${frac ? "." + frac : ""}`.replace(/^-0(?=\.)/, "-0");

}

export function convert(value, fromId, toId) {

    const from = byId(fromId);
    const to = byId(toId);

    if (from.group === "Temperature") {
        return fromKelvin(toId, toKelvin(fromId, value));
    }

    return (value * from.to) / to.to;

}

export function solveUnits(values) {

    if (String(values.value).trim() === "") {
        return { state: "incomplete" };
    }

    const value = parseNumber(values.value);
    const from = byId(values.from);
    const to = byId(values.to);
    const errors = {};

    if (!Number.isFinite(value) || Math.abs(value) > 1e15) errors.value = "Enter the value as a number (up to 1,000,000,000,000,000).";
    if (!from) errors.from = "Choose the unit to convert from.";
    if (!to) errors.to = "Choose the unit to convert to.";

    if (!errors.from && !errors.to && from.group !== to.group) {
        errors.to = `${from.group} cannot be converted to ${to.group.toLowerCase()}. Choose a unit from the same group (${from.group}).`;
    }

    if (!errors.value && from?.group === "Temperature" && toKelvin(from.id, value) < 0) {
        errors.value = "That is below absolute zero (0 K, -273.15 °C, -459.67 °F).";
    }

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const out = convert(value, from.id, to.id);
    const metrics = [
        { label: `${show(value)} ${from.label.replace(/ \(.*\)$/, "")} in ${to.label.replace(/ \(.*\)$/, "")}`, value: show(out), primary: true }
    ];

    if (from.group !== "Temperature") {
        metrics.push({ label: `1 ${from.label.replace(/ \(.*\)$/, "")} equals`, value: `${show(convert(1, from.id, to.id))} ${to.label.replace(/ \(.*\)$/, "")}` });
        metrics.push({ label: `1 ${to.label.replace(/ \(.*\)$/, "")} equals`, value: `${show(convert(1, to.id, from.id))} ${from.label.replace(/ \(.*\)$/, "")}` });
    }

    return {
        state: "ok",
        metrics,
        notes: [],
        result: { out },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
