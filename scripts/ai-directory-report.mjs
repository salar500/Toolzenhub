/**
 * Which AI products directory entries are due for a re-check (rule 4.11: at least every six months).
 *
 *   node scripts/ai-directory-report.mjs              due as of today
 *   node scripts/ai-directory-report.mjs 2027-06-01   due as of a given day
 *
 * A report, not a test: builds and tests stay the same whatever today's date is. Run it at each release checkpoint;
 * re-open every listed product's official page, update the entry and its verifiedOn, or remove it.
 */
import { AI_PRODUCTS } from "../assets/js/data/ai-directory.js";

const asOf = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const due = new Date(`${asOf}T00:00:00Z`);
due.setUTCMonth(due.getUTCMonth() - 6);
const limit = due.toISOString().slice(0, 10);

const overdue = AI_PRODUCTS.filter((p) => p.verifiedOn <= limit);

console.log(`AI products directory: ${AI_PRODUCTS.length} entries; as of ${asOf}, entries checked on or before ${limit} are due.`);
if (overdue.length === 0) {
    console.log("Nothing is due.");
} else {
    for (const p of overdue) console.log(`  due  ${p.verifiedOn}  ${p.id.padEnd(22)} ${p.url}`);
}
