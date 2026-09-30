/* =====================================================================
   CONTROLS: builds the side panel
   ===================================================================== */
let uid = 0;
function Controls(host) {
  return {
    title(text) { host.append(h('p', { class: 'ctl-title' }, text)); },
    hint(text) { host.append(h('p', { class: 'hint' }, text)); },
    slider({ label, min, max, step, value, format = v => fmt(v), onInput }) {
      const id = 'c' + (++uid), out = h('output', { for: id });
      const inp = h('input', { type: 'range', id, min, max, step, value });
      const upd = () => { out.textContent = format(+inp.value); inp.style.setProperty('--p', ((+inp.value - min) / (max - min) * 100) + '%'); };
      inp.addEventListener('input', () => { upd(); onInput(+inp.value); });
      upd(); host.append(h('div', { class: 'ctl slider' }, h('label', { for: id }, label), out, inp));
      return { set(v) { inp.value = v; upd(); }, get: () => +inp.value };
    },
    buttons(list) {
      const row = h('div', { class: 'ctl buttons' });
      const els = list.map(b => { const e = h('button', { type: 'button', class: b.primary ? 'btn primary' : 'btn', onclick: b.onClick }, b.label); row.append(e); return e; });
      host.append(row); return els;
    },
    select({ label, options, value, onChange }) {
      const id = 'c' + (++uid);
      const sel = h('select', { id }, options.map(o => { const op = h('option', { value: o.value }, o.label); if (o.value === value) op.selected = true; return op; }));
      sel.addEventListener('change', () => onChange(sel.value));
      host.append(h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel)); return sel;
    },
    toggle({ label, value, onChange }) {
      const id = 'c' + (++uid), inp = h('input', { type: 'checkbox', id });
      inp.checked = value; inp.addEventListener('change', () => onChange(inp.checked));
      host.append(h('div', { class: 'ctl toggle' }, inp, h('label', { for: id }, label))); return inp;
    },
    readout() { const e = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(e); return e; }
  };
}
