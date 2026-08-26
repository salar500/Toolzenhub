import {
    renderAboutTemplate
} from "./about-template.js";


export function renderAboutPage() {

    const app = document.getElementById("app");

    if (!app) {
        return;
    }

    app.innerHTML = renderAboutTemplate();

}
