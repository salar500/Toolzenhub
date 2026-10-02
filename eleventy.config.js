/**
 * Production build: the site served from the root of its own domain (https://toolzenhub.in/).
 *   npm run build   ->  dist/
 */
import { createConfig } from "./eleventy.shared.js";

export default createConfig({ base: "/", output: "dist" });
