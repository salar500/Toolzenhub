/* BMI, BMR (Mifflin-St Jeor) and daily calories (BMR x activity factor). Metric inputs: kilograms, centimetres.

   BMI = kg / m^2. Adult categories are the WHO international classification: under 18.5, 18.5 to 24.9, 25 to 29.9,
   30 and over. For Asian populations the WHO expert consultation of 2004 (Lancet 363:157-163) kept those categories
   and added 23.0 (increased risk) and 27.5 (higher risk) as points for public health action; they are shown beside the
   categories, not instead of them. The category uses the BMI rounded to one decimal, as it is displayed.

   BMR (Mifflin MD, St Jeor ST et al., Am J Clin Nutr 1990;51:241-247), kcal a day:
       10 x kg + 6.25 x cm - 5 x age + 5   (male)       10 x kg + 6.25 x cm - 5 x age - 161   (female)
   Daily calories = BMR x an activity factor. The factors 1.2, 1.375, 1.55, 1.725 and 1.9 are conventional multipliers;
   sources word the activity levels differently, so they are an estimate, not a measurement. 1 kcal = 4.184 kJ. */

import { parseNumber, plain } from "../common/number-text.js";

export const ACTIVITY = [
    { value: "1.2", label: "Little or no exercise (x 1.2)" },
    { value: "1.375", label: "Light exercise, 1 to 3 days a week (x 1.375)" },
    { value: "1.55", label: "Moderate exercise, 3 to 5 days a week (x 1.55)" },
    { value: "1.725", label: "Hard exercise, 6 to 7 days a week (x 1.725)" },
    { value: "1.9", label: "Very hard exercise or a physical job (x 1.9)" }
];

export const SEX = [
    { value: "", label: "Choose" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
];

export function bmi(kg, cm) {

    const m = cm / 100;

    return kg / (m * m);

}

export function bmiCategory(value) {

    const v = Math.round(value * 10) / 10;

    if (v < 18.5) return "Below the normal range (underweight)";
    if (v < 25) return "Within the normal range";
    if (v < 30) return "Above the normal range (overweight)";

    return "In the obesity range";

}

export function asianPoint(value) {

    const v = Math.round(value * 10) / 10;

    if (v < 23) return "Below 23.0";
    if (v < 27.5) return "23.0 to 27.4: increased risk";

    return "27.5 or more: higher risk";

}

export function mifflin(sex, kg, cm, age) {

    return 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);

}

function readBody(values, { age: ageRange, needSex }) {

    const errors = {};
    const kg = parseNumber(values.weight);
    const cm = parseNumber(values.height);
    const age = parseNumber(values.age);

    if (!Number.isFinite(kg) || kg < 20 || kg > 300) errors.weight = "Enter the weight in kilograms, from 20 to 300.";
    if (!Number.isFinite(cm) || cm < 100 || cm > 250) errors.height = "Enter the height in centimetres, from 100 to 250.";
    if (!Number.isFinite(age) || age < ageRange[0] || age > ageRange[1] || age !== Math.floor(age)) errors.age = `Enter the age in whole years, from ${ageRange[0]} to ${ageRange[1]}.`;
    if (needSex && values.sex !== "male" && values.sex !== "female") errors.sex = "Choose male or female: the formula has a different constant for each.";

    return { errors, kg, cm, age };

}

const blank = (values, keys) => keys.some((k) => String(values[k] ?? "").trim() === "");

export function solveBmi(values) {

    if (blank(values, ["weight", "height", "age"])) {
        return { state: "incomplete" };
    }

    const { errors, kg, cm, age } = readBody(values, { age: [1, 120], needSex: false });

    if (!errors.age && age < 18) {
        errors.age = "These BMI categories are for adults aged 18 or more. For a child or teenager, BMI is read against growth charts for their age and sex; ask a doctor.";
    }

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const value = bmi(kg, cm);
    const metrics = [
        { label: "BMI", value: `${plain(Math.round(value * 10) / 10, 1)} kg/m²`, primary: true },
        { label: "WHO adult category", value: bmiCategory(value) },
        { label: "WHO action points for Asian populations", value: asianPoint(value) },
        { label: "Weight range for a BMI of 18.5 to 24.9 at this height", value: `${plain(18.5 * (cm / 100) ** 2, 1)} to ${plain(24.9 * (cm / 100) ** 2, 1)} kg` }
    ];

    return {
        state: "ok",
        metrics,
        notes: ["BMI is a screening number, not a diagnosis. It does not separate muscle from fat or show where fat is carried. Talk to a doctor about your health."],
        result: { value },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}

export function solveBmr(values) {

    if (blank(values, ["weight", "height", "age"]) || String(values.sex ?? "") === "") {
        return { state: "incomplete" };
    }

    const { errors, kg, cm, age } = readBody(values, { age: [15, 100], needSex: true });

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const kcal = mifflin(values.sex, kg, cm, age);

    if (kcal <= 0) {
        return { state: "invalid", errors: { weight: "These numbers give a result at or below 0, which the formula cannot describe. Check the weight, height and age." } };
    }

    const metrics = [
        { label: "Basal metabolic rate", value: `${plain(Math.round(kcal), 0)} kcal a day`, primary: true },
        { label: "In kilojoules", value: `${plain(Math.round(kcal * 4.184), 0)} kJ a day` },
        { label: "Per hour", value: `${plain(Math.round(kcal / 24), 0)} kcal` }
    ];

    return {
        state: "ok",
        metrics,
        notes: ["BMR is an estimate of the energy used at complete rest. It is not a calorie target. The formula was developed for healthy adults and is not meant for pregnancy or breastfeeding."],
        result: { kcal },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}

export function solveCalorie(values) {

    const base = solveBmr(values);

    if (base.state !== "ok") {
        return base;
    }

    const factor = Number(values.activity || "1.2");

    if (!ACTIVITY.some((a) => Number(a.value) === factor)) {
        return { state: "invalid", errors: { activity: "Choose an activity level." } };
    }

    const bmr = base.result.kcal;
    const daily = bmr * factor;
    const metrics = [
        { label: "Estimated daily calories to stay at the same weight", value: `${plain(Math.round(daily), 0)} kcal`, primary: true },
        { label: "Basal metabolic rate (BMR)", value: `${plain(Math.round(bmr), 0)} kcal` },
        { label: "Activity multiplier", value: `x ${plain(factor, 3)}` },
        { label: "In kilojoules", value: `${plain(Math.round(daily * 4.184), 0)} kJ` }
    ];

    return {
        state: "ok",
        metrics,
        notes: ["This is an estimate of the energy your body uses in a day, not a diet target. Real needs vary with body composition, health, medicines, pregnancy and more; ask a doctor or registered dietitian before changing how much you eat."],
        result: { daily, bmr, factor },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
