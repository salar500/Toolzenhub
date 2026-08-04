// assets/js/utils/dom.js

export const $ = (selector, parent = document) =>
  parent.querySelector(selector);

export const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

export function create(tag, className = "") {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  return element;
}
