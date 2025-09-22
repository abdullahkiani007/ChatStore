// ui/dom.js
export function createEl(tag, opts = {}, children = []) {
  const el = document.createElement(tag);
  if (opts.class) el.className = opts.class;
  if (opts.id) el.id = opts.id;
  if (opts.text) el.textContent = opts.text;
  if (opts.attrs)
    for (const [k, v] of Object.entries(opts.attrs)) el.setAttribute(k, v);
  if (opts.style) Object.assign(el.style, opts.style);
  for (const c of children) el.append(c);
  return el;
}
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
export const clearEl = (el) => {
  while (el.firstChild) el.firstChild.remove();
};
