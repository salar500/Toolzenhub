/* =========================================================
   ToolZen Hub
   HTML, CSS and the DOM path: playground exercises checked by web/dom-check.js on the rendered page. Each model passes
   and each starter does not (pinned by tests/browser/practice-labs-webplay.spec.js).
========================================================= */

export const WEB_EXERCISES = Object.freeze([
    {
        id: "web-x-first-page", task: "Give the page a main heading (h1) that says ShopLite and a paragraph below it describing the shop.",
        starter: "<!-- write your HTML here -->\n",
        rules: [
            { id: "h1", type: "exists", selector: "h1", text: "ShopLite", label: "An h1 heading says ShopLite", advice: "Add <h1>ShopLite</h1>." },
            { id: "p", type: "exists", selector: "h1 ~ p", text: "\\w", label: "A paragraph follows the heading", advice: "Add a <p> with some text after the heading." }
        ],
        model: "<h1>ShopLite</h1>\n<p>Everyday products for home and work, delivered across India.</p>"
    },
    {
        id: "web-x-link-image", task: "Add a link to /practice-labs/ with the text Practice Labs, and an image (any src) with alternative text describing it.",
        starter: "<p>Learn more:</p>\n<img src=\"lamp.png\">",
        rules: [
            { id: "link", type: "exists", selector: "a[href=\"/practice-labs/\"]", text: "Practice Labs", label: "A link to /practice-labs/ with meaningful text", advice: "<a href=\"/practice-labs/\">Practice Labs</a>" },
            { id: "img", type: "count", selector: "img", min: 1, label: "There is an image", advice: "Add an <img src=\"...\">." },
            { id: "alt", type: "none", selector: "img:not([alt])", label: "Every image has alt text", advice: "Add alt=\"...\" describing the image (alt=\"\" only for decorative images)." },
            { id: "altText", type: "attr", selector: "img", attr: "alt", label: "The alt text is not empty", advice: "Describe what the image shows, for example alt=\"LED desk lamp\"." }
        ],
        model: "<p>Learn more in the <a href=\"/practice-labs/\">Practice Labs</a>.</p>\n<img src=\"lamp.png\" alt=\"LED desk lamp on a wooden desk\">"
    },
    {
        id: "web-x-semantic", task: "Lay out a page with semantic elements: a header containing a nav, a main with an h1, and a footer.",
        starter: "<div class=\"top\">ShopLite</div>\n<div class=\"content\">Welcome</div>\n<div class=\"bottom\">© ShopLite</div>",
        rules: [
            { id: "header", type: "exists", selector: "header nav", label: "A header containing a nav", advice: "<header><nav>...</nav></header>" },
            { id: "main", type: "exists", selector: "main h1", label: "A main element with an h1", advice: "<main><h1>...</h1></main>" },
            { id: "footer", type: "exists", selector: "footer", label: "A footer", advice: "<footer>...</footer>" },
            { id: "one-main", type: "none", selector: "main ~ main", label: "Only one main element", advice: "A page has a single main landmark." }
        ],
        model: "<header>\n  <nav><a href=\"/\">Home</a> <a href=\"/cart\">Cart</a></nav>\n</header>\n<main>\n  <h1>Welcome to ShopLite</h1>\n</main>\n<footer>© ShopLite</footer>"
    },
    {
        id: "web-x-form", task: "Build a sign-in form with an email field (type email), a password field (type password), a visible label for each, and a submit button.",
        starter: "<form>\n  <input placeholder=\"Email\">\n  <input placeholder=\"Password\">\n  <div>Sign in</div>\n</form>",
        rules: [
            { id: "email", type: "exists", selector: "form input[type=email]", label: "An email input", advice: "<input type=\"email\" ...> gives the right keyboard and built-in checks." },
            { id: "password", type: "exists", selector: "form input[type=password]", label: "A password input", advice: "<input type=\"password\" ...> hides the characters." },
            { id: "labels", type: "labelled", selector: "form input", label: "Every field has a label", advice: "Use <label for=\"email\">Email</label> with id=\"email\" on the input; a placeholder is not a label." },
            { id: "submit", type: "exists", selector: "form button:not([type=button]):not([type=reset]), form input[type=submit]", label: "A submit button", advice: "Use a real <button> inside the form, not a div." }
        ],
        model: "<form>\n  <label for=\"email\">Email</label>\n  <input id=\"email\" type=\"email\" autocomplete=\"email\">\n  <label for=\"password\">Password</label>\n  <input id=\"password\" type=\"password\" autocomplete=\"current-password\">\n  <button>Sign in</button>\n</form>"
    },
    {
        id: "web-x-table", task: "Show three products in a table with a caption and column headers (th with scope=\"col\") for Product and Price.",
        starter: "<div>Product | Price</div>\n<div>Lamp | 1299</div>",
        rules: [
            { id: "caption", type: "exists", selector: "table > caption", text: "\\w", label: "The table has a caption", advice: "<caption>ShopLite products</caption> as the first child of the table." },
            { id: "th", type: "count", selector: "table th[scope=col]", min: 2, label: "Column headers with scope=\"col\"", advice: "<th scope=\"col\">Product</th>" },
            { id: "rows", type: "count", selector: "table tbody tr", min: 3, label: "Three product rows", advice: "One <tr> per product inside <tbody>." }
        ],
        model: "<table>\n  <caption>ShopLite products</caption>\n  <thead><tr><th scope=\"col\">Product</th><th scope=\"col\">Price (₹)</th></tr></thead>\n  <tbody>\n    <tr><td>LED Desk Lamp</td><td>1299</td></tr>\n    <tr><td>Steel Water Bottle</td><td>499</td></tr>\n    <tr><td>Laptop Backpack</td><td>1799</td></tr>\n  </tbody>\n</table>"
    },
    {
        id: "web-x-css-basics", task: "Style the page with CSS in a <style> element: make .price bold, and give the .buy button a blue background (#1d4ed8) with white text.",
        starter: "<style>\n  /* your CSS */\n</style>\n<p class=\"price\">₹1,299</p>\n<button class=\"buy\">Add to cart</button>",
        rules: [
            { id: "bold", type: "style", selector: ".price", prop: "font-weight", pattern: "^(6|7|8|9)00$|^bold", label: ".price is bold", advice: ".price { font-weight: 700; }" },
            { id: "bg", type: "style", selector: ".buy", prop: "background-color", pattern: "^rgb\\(29, 78, 216\\)$", label: ".buy has the blue background #1d4ed8", advice: ".buy { background-color: #1d4ed8; }" },
            { id: "fg", type: "style", selector: ".buy", prop: "color", pattern: "^rgb\\(255, 255, 255\\)$", label: ".buy has white text", advice: ".buy { color: #fff; }" }
        ],
        model: "<style>\n  .price { font-weight: 700; }\n  .buy { background-color: #1d4ed8; color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; }\n</style>\n<p class=\"price\">₹1,299</p>\n<button class=\"buy\">Add to cart</button>"
    },
    {
        id: "web-x-flex", task: "Make .cards a flex container that wraps, with a 16px gap between the cards.",
        starter: "<style>\n  .card { border: 1px solid #999; padding: 8px; width: 120px; }\n</style>\n<div class=\"cards\">\n  <div class=\"card\">Lamp</div><div class=\"card\">Bottle</div><div class=\"card\">Backpack</div>\n</div>",
        rules: [
            { id: "flex", type: "style", selector: ".cards", prop: "display", pattern: "^flex$", label: ".cards uses display: flex", advice: ".cards { display: flex; }" },
            { id: "wrap", type: "style", selector: ".cards", prop: "flex-wrap", pattern: "^wrap$", label: "The cards wrap onto new lines", advice: "flex-wrap: wrap; lets narrow screens show the cards on several lines." },
            { id: "gap", type: "style", selector: ".cards", prop: "column-gap", pattern: "^16px$", label: "A 16px gap between cards", advice: "gap: 16px; spaces the items without margins." }
        ],
        model: "<style>\n  .cards { display: flex; flex-wrap: wrap; gap: 16px; }\n  .card { border: 1px solid #999; padding: 8px; width: 120px; }\n</style>\n<div class=\"cards\">\n  <div class=\"card\">Lamp</div><div class=\"card\">Bottle</div><div class=\"card\">Backpack</div>\n</div>"
    },
    {
        id: "web-x-accessible-button", task: "The cart icon below is a clickable div with no name. Replace it with a real button that has an accessible name (visible text or aria-label) and keep the icon decorative.",
        starter: "<div class=\"icon\" onclick=\"openCart()\">🛒</div>",
        rules: [
            { id: "button", type: "exists", selector: "button", label: "Uses a real button element", advice: "Buttons are focusable and work with the keyboard; divs are not." },
            { id: "name", type: "named", selector: "button", label: "The button has a name in words", advice: "Add visible text (Cart) or aria-label=\"Open cart\"." },
            { id: "nodiv", type: "none", selector: "div[onclick]", label: "No clickable div remains", advice: "Remove the div with onclick." }
        ],
        model: "<button type=\"button\" aria-label=\"Open cart\"><span aria-hidden=\"true\">🛒</span> Cart</button>"
    }
]);
