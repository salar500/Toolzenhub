/**
 * The Practice Labs search index (departments, labs, learning paths and lessons), from the same data as the pages
 * (assets/js/practice-labs/learn-html.js), written to /practice-labs/search-index.json by src/learn-search-index.njk.
 */
import { learnSearchIndex } from "../../assets/js/practice-labs/learn-html.js";

export default function () {
  return learnSearchIndex();
}
