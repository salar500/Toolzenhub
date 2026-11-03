/* Unit Converter (Converter). The page is drawn by common/simple-calculator.js; the exact factors are in
   formulas/units.js. Length, mass, area, volume, speed and temperature; no live data, nothing is looked up. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveUnits, UNIT_OPTIONS } from "../formulas/units.js";

const calculator = createSimpleCalculator({
    prefix: "uc",
    toolId: "unit-converter",
    eyebrow: "Converter Tool",
    intro: "Convert between common units of length, mass, area, volume, speed and temperature, using exact defined factors.",
    sectionTitle: "Choose the Units",
    sectionText: "Enter a value, choose the unit it is in and the unit you want. Both units must be in the same group. Results update as you type.",
    emptyMessage: "Enter a value and choose the two units to see the conversion.",
    footnote: "Converted with the exact defined factors, shown to up to 10 significant digits.",
    fields: [
        { key: "value", label: "Value", value: "1", hint: "The number to convert. Negative values are fine for temperature." },
        { key: "from", label: "From", kind: "select", value: "km", options: UNIT_OPTIONS, hint: "The unit your value is in." },
        { key: "to", label: "To", kind: "select", value: "mi", options: UNIT_OPTIONS, hint: "The unit you want, from the same group as the first." }
    ],
    solve: solveUnits,
    howTo: [
        "Enter the value you want to convert.",
        "Choose the unit it is in, then the unit you want. Units are grouped by length, mass, area, volume, speed and temperature.",
        "Read the converted value and the factor between the two units."
    ],
    reading: [
        "<strong>Length, mass, area, volume and speed</strong> are converted through a base unit (metre, kilogram, square metre, litre, metre per second) using exact defined factors: for example 1 inch is exactly 0.0254 m, 1 pound is exactly 0.45359237 kg and 1 mile is exactly 1,609.344 m.",
        "<strong>Temperature</strong> uses formulas, not a factor: °F = °C x 9/5 + 32 and K = °C + 273.15.",
        "<strong>Gallons</strong> differ: a US gallon is 3.785411784 litres and a UK (imperial) gallon is 4.54609 litres."
    ],
    example: {
        values: { value: "10", from: "km", to: "mi" },
        text: "10 kilometres to miles: 10 x 1,000 m / 1,609.344 m, which is about 6.2137 miles."
    },
    assumptions: [
        "Only units in the same group can be converted. Currency is not here, because exchange rates change and this site does not fetch live data.",
        "Results are shown to up to 10 significant digits; the stored factors are exact where the unit is defined exactly.",
        "Region-specific units that vary by place (for example local land measures) are not included.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Why can I not convert kilograms to litres?", a: "They measure different things. Converting mass to volume needs the density of the material, which this page does not assume." },
        { q: "Is a US gallon the same as a UK gallon?", a: "No. A US gallon is about 3.785 litres and a UK (imperial) gallon is about 4.546 litres." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
