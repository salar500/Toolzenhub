import { renderHeader } from "./components/header.js";

async function initHeader(){

    const container=document.getElementById("header");

    if(!container) return;

    container.innerHTML=await renderHeader();

}

export async function bootstrap(){

    await initHeader();

}
