/* =========================================================
   ToolZen Hub
   SIP Calculator: the chart

   One native SVG chart (no library): the total you have invested
   against the estimated value, over the years. It is drawn from the
   same yearly rows as the table, so the two cannot disagree. The
   table is the text equivalent of the chart and the chart is not
   needed to understand the result.

   Pure functions: they return strings and read no DOM. The page
   styles the parts through classes (see css/calculators/sip.css), so
   the lines differ by dash and marker as well as by colour.
========================================================= */

import {
    formatINR,
    formatINRCompact,
    formatDuration
} from "../common/formatter.js";

/* the drawing area, in SVG units (the SVG scales to the width of the page) */
const WIDTH = 480;
const HEIGHT = 300;
const MARGIN = { top: 16, right: 18, bottom: 42, left: 64 };

const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const num = (n) => n.toFixed(1);


/* a round axis maximum and step: 1, 2, 2.5 or 5 times a power of ten, about four steps */

export function niceScale(
    max,
    steps = 4
) {

    const rough = max / steps;
    const power = Math.pow(10, Math.floor(Math.log10(rough)));

    let unit = power;

    for (const factor of [1, 2, 2.5, 5, 10]) {

        unit = factor * power;

        if (unit >= rough) {
            break;
        }

    }

    return {
        step: unit,
        max: unit * Math.ceil(max / unit - 1e-9)
    };

}


/* the points drawn: the start (nothing yet) and the end of every year row */

export function chartPoints(
    result
) {

    const points = [{
        month: 0,
        invested: 0,
        value: 0
    }];

    for (const row of result.yearly) {

        points.push({
            month: (row.year - 1) * 12 + row.months,
            invested: row.invested,
            value: row.value
        });

    }

    return points;

}


/* a sentence that says what the chart shows (used as its text description and under the chart) */

export function chartSummary(
    result
) {

    const {
        plan,
        input
    } = result;

    return `Over ${formatDuration(input.months)}, the total you invest rises to ${formatINR(plan.totalInvested)} and the estimated value, at an assumed return of ${input.annualReturn}% a year, rises to ${formatINR(plan.estimatedValue)}. The gap between the two is the estimated growth, ${formatINR(plan.estimatedGrowth)}.`;

}


/* x-axis ticks in whole years, about five of them */

function yearTicks(
    months
) {

    const years = months / 12;

    const unit =
        [1, 2, 5, 10, 20].find(
            candidate => years / candidate <= 6
        ) ?? 20;

    const ticks = [];

    for (let year = 0; year <= years + 1e-9; year += unit) {
        ticks.push(year);
    }

    return ticks;

}


export function buildChartSvg(
    result
) {

    const points = chartPoints(result);

    const months = result.input.months;

    const top = Math.max(
        ...points.map(p => Math.max(p.invested, p.value))
    );

    const scale = niceScale(top);

    const x = (month) =>
        MARGIN.left + (PLOT_W * month) / months;

    const y = (amount) =>
        MARGIN.top + PLOT_H - (PLOT_H * amount) / scale.max;

    const path = (key) =>
        points
            .map(p => `${num(x(p.month))},${num(y(p[key]))}`)
            .join(" ");

    const last = points[points.length - 1];

    /* grid lines and y labels */

    let grid = "";

    for (let amount = 0; amount <= scale.max + 1e-9; amount += scale.step) {

        grid += `
        <line class="sip-chart__grid" x1="${MARGIN.left}" x2="${WIDTH - MARGIN.right}" y1="${num(y(amount))}" y2="${num(y(amount))}"/>
        <text class="sip-chart__label" x="${MARGIN.left - 8}" y="${num(y(amount) + 4)}" text-anchor="end">${formatINRCompact(amount)}</text>`;

    }

    /* x labels */

    let xLabels = "";

    for (const year of yearTicks(months)) {

        xLabels += `
        <text class="sip-chart__label" x="${num(x(year * 12))}" y="${HEIGHT - MARGIN.bottom + 18}" text-anchor="middle">${year}</text>`;

    }

    const title = "Total invested compared with estimated value";

    return `
            <svg
                class="sip-chart"
                viewBox="0 0 ${WIDTH} ${HEIGHT}"
                role="img"
                aria-labelledby="sip-chart-title sip-chart-desc"
                focusable="false"
            >

                <title id="sip-chart-title">${title}</title>
                <desc id="sip-chart-desc">${chartSummary(result)}</desc>
                ${grid}${xLabels}
                <line class="sip-chart__axis" x1="${MARGIN.left}" x2="${WIDTH - MARGIN.right}" y1="${num(y(0))}" y2="${num(y(0))}"/>
                <text class="sip-chart__label" x="${num(MARGIN.left + PLOT_W / 2)}" y="${HEIGHT - 6}" text-anchor="middle">Years</text>

                <polyline class="sip-chart__line sip-chart__line--invested" points="${path("invested")}"/>
                <polyline class="sip-chart__line sip-chart__line--value" points="${path("value")}"/>

                <rect class="sip-chart__marker sip-chart__marker--invested" x="${num(x(last.month) - 5)}" y="${num(y(last.invested) - 5)}" width="10" height="10"/>
                <circle class="sip-chart__marker sip-chart__marker--value" cx="${num(x(last.month))}" cy="${num(y(last.value))}" r="6"/>

            </svg>`;

}
