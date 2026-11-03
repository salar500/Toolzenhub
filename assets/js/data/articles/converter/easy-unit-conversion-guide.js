/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title, description, dates, read time, related tools and
   articles) lives in data/articles.js.

   Article:
   Easy Unit Conversion Guide

   Category:
   Converter

   Every figure below was worked out by hand and checked against the Unit Converter's model, which uses the exact
   defined factors: 1 inch = 2.54 cm exactly, 1 pound = 0.45359237 kg exactly, 1 mile = 1,609.344 m exactly.
   10 km is 10,000 / 1,609.344 = 6.2137 miles; 5 ft 9 in is 69 in x 2.54 = 175.26 cm; 70 kg is 70 / 0.45359237 =
   154.32 lb; 37 C is 37 x 9/5 + 32 = 98.6 F; 100 km/h is 100 / 3.6 = 27.78 m/s. US gallon 3.785411784 L, UK gallon 4.54609 L.
========================================================= */


const article = {

    introduction:
        "Converting a unit is one multiplication, once you know which way to go. The common mistakes are multiplying when you should divide, using a rounded factor, and mixing up units that have the same name in different countries.",

    author: { name: "ToolZen Hub", type: "Organization", role: "Calculator Guides" },

    tags: ["Unit Conversion", "Length", "Weight", "Temperature"],

    keyTakeaways: [
        "To convert, multiply by the number of the new unit that fit in one of the old unit, or divide by the reverse.",
        "Many everyday factors are exact by definition: 1 inch is exactly 2.54 cm and 1 pound is exactly 0.45359237 kg.",
        "Temperature is different: it uses a formula, not just a factor: °F = °C × 9/5 + 32.",
        "A US gallon (3.785 litres) is smaller than a UK gallon (4.546 litres).",
        "Check the answer: if you convert to a smaller unit, the number should get bigger."
    ],

    calculator: {
        description:
            "Enter 10, choose kilometres to miles, and see 6.2137 miles, with the factor between the two units shown."
    },

    tableOfContents: [
        { id: "one-multiplication", label: "One Multiplication" },
        { id: "check-the-direction", label: "Check the Direction" },
        { id: "exact-and-rounded-factors", label: "Exact and Rounded Factors" },
        { id: "temperature-is-different", label: "Temperature Is Different" },
        { id: "units-with-the-same-name", label: "Units With the Same Name" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "one-multiplication",
            heading: "1. One Multiplication",
            paragraphs: [
                "Every conversion between two units of the same kind is a multiplication by a fixed number. One inch is 2.54 centimetres, so a length in inches times 2.54 is the length in centimetres. A person 5 feet 9 inches tall is 69 inches, and 69 × 2.54 = 175.26 centimetres.",
                "To go the other way, divide by the same number: 175.26 ÷ 2.54 = 69 inches."
            ]
        },
        {
            id: "check-the-direction",
            heading: "2. Check the Direction",
            paragraphs: [
                "A simple test avoids the most common mistake. If you convert to a smaller unit, the number must get bigger, because it takes more small units to make the same amount. Kilograms to pounds should give a bigger number; pounds to kilograms a smaller one.",
                "70 kilograms is 70 ÷ 0.45359237, about 154.32 pounds. The number grew, as it should. If you had multiplied by 0.4536 instead, you would get about 31.75, and the check would catch it."
            ]
        },
        {
            id: "exact-and-rounded-factors",
            heading: "3. Exact and Rounded Factors",
            paragraphs: [
                "Many everyday factors are exact by international definition: 1 inch is exactly 2.54 centimetres, 1 foot is exactly 0.3048 metres, 1 mile is exactly 1,609.344 metres and 1 pound is exactly 0.45359237 kilograms.",
                "Rounded versions such as 1.6 kilometres to a mile are fine for a rough idea, but they add up over longer distances. 10 kilometres is 10,000 ÷ 1,609.344 = 6.2137 miles; with 1.6 it would be 6.25."
            ]
        },
        {
            id: "temperature-is-different",
            heading: "4. Temperature Is Different",
            paragraphs: [
                "Celsius and Fahrenheit do not share a zero, so the conversion is a formula with a multiplication and an addition: °F = °C × 9/5 + 32. Body temperature of 37 °C is 37 × 9/5 + 32 = 98.6 °F.",
                "Kelvin is Celsius plus 273.15, so 0 °C is 273.15 K. Nothing can be colder than 0 K, which is why a converter should refuse a value below it."
            ]
        },
        {
            id: "units-with-the-same-name",
            heading: "5. Units With the Same Name",
            paragraphs: [
                "Some units share a name but not a size. A US gallon is 3.785411784 litres and a UK (imperial) gallon is 4.54609 litres, about 20% larger. A cup, a fluid ounce and a ton also differ between countries.",
                "When a recipe, a fuel figure or a label uses one of these, check which country's unit it means before converting."
            ]
        }
    ],

    example: {
        heading: "Example: A Speed in Two Units",
        paragraphs: [
            "A speed of 100 kilometres per hour is 100,000 metres in 3,600 seconds. Divide: 100,000 ÷ 3,600 = 27.78 metres per second.",
            "The shortcut is to divide kilometres per hour by 3.6. Check: the number got smaller because a metre per second is a bigger unit of speed than a kilometre per hour."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "Converting is easy once you name the two units and the factor between them. The mistakes come from the direction, from rounding too early, and from assuming that a unit means the same thing everywhere. A converter takes care of the arithmetic, but the checks are yours."
    },

    considerations: [
        "Name both units before you calculate.",
        "Check that the number moves the right way.",
        "Keep the exact factor until the last step, then round.",
        "Use the formula, not a factor, for temperature.",
        "Check which country's unit is meant."
    ],

    faq: [
        {
            question: "How do I convert inches to centimetres?",
            answer: "Multiply by 2.54. One inch is exactly 2.54 centimetres."
        },
        {
            question: "How do I convert Celsius to Fahrenheit?",
            answer: "Multiply by 9/5 (1.8) and add 32. 37 °C is 98.6 °F."
        },
        {
            question: "Why can I not convert kilograms to litres?",
            answer: "They measure different things. Converting mass to volume needs the density of the material, which depends on what it is."
        },
        {
            question: "Is a US gallon the same as a UK gallon?",
            answer: "No. A US gallon is about 3.785 litres and a UK (imperial) gallon is about 4.546 litres."
        },
        {
            question: "Can the Unit Converter convert currency?",
            answer: "No. Exchange rates change all the time and this site does not fetch live data, so currency is not included."
        }
    ]

};

export default article;
