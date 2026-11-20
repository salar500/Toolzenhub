/**
 * The Practice Labs learning-path pages (overview, path, level, module and lesson), from the curriculum
 * (assets/js/practice-labs/curriculum.js). Same shape as the directory pages (src/_data/directory.js):
 * each page has permalink, title, description, html (the finished <main>), jsonld and kind.
 */
import { learnPages } from "../../assets/js/practice-labs/learn-html.js";
import { breadcrumbTrail } from "../../assets/js/components/breadcrumb.js";
import { breadcrumbLd, sitePath } from "../_lib/seo.js";

export default function () {
  return learnPages().map(({ url, trail, ...page }) => ({
    ...page,
    permalink: sitePath(url),
    jsonld: [breadcrumbLd(breadcrumbTrail(trail), sitePath(url))],
  }));
}
