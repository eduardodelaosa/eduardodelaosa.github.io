const PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { ws, send };
}

async function main() {
  const { ws, send } = await connect();
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await sleep(1500);

  const expr = `(async () => {
    const ids = ['inicio','trabajos','cursos-online','desarrollo-web','contacto-seccion'];
    const snapshots = {};
    for (const id of ids) {
      const panel = document.querySelector('.section-panel[data-section="' + id + '"]');
      const footer = panel.querySelector('.section-footer');
      const nav = [...footer.querySelectorAll('.section-footer__nav a')].map(a => [a.textContent.trim(), a.getAttribute('href')]);
      snapshots[id] = {
        html: footer.innerHTML.trim(),
        nav,
        credit: (footer.querySelector('.section-footer__credit') || {}).textContent || null,
        rights: (footer.querySelector('.section-footer__rights') || {}).textContent || null,
        legalButtons: footer.querySelectorAll('button').length,
        modal: !!footer.querySelector('.section-footer__modal'),
      };
    }
    const navsEqual = ids.every(id => JSON.stringify(snapshots[id].nav) === JSON.stringify(snapshots['trabajos'].nav));
    const htmlEqual = ids.every(id => snapshots[id].html === snapshots['trabajos'].html);

    // click footer "Web"
    const panel = document.querySelector('.section-panel[data-section="trabajos"]');
    const webLink = [...panel.querySelectorAll('.section-footer__nav a')].find(a => a.textContent.trim() === 'Web');
    webLink.click();
    await new Promise(r => setTimeout(r, 250));
    const active = document.querySelector('.section-panel.is-active');

    return {
      nav: snapshots['trabajos'].nav,
      navsEqual,
      htmlEqual,
      credit: snapshots['trabajos'].credit,
      rights: snapshots['trabajos'].rights,
      legalButtons: snapshots['trabajos'].legalButtons,
      modal: snapshots['trabajos'].modal,
      webClick: { hash: location.hash, section: active ? active.dataset.section : null },
    };
  })()`;
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result.value, null, 2));

  // Mobile footer row layout
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/#inicio' });
  await sleep(1300);
  const expr2 = `(async () => {
    const footer = document.querySelector('.section-panel.is-active .section-footer');
    footer.scrollIntoView({ block: 'end' });
    await new Promise(r => setTimeout(r, 150));
    const inner = footer.querySelector('.section-footer__inner');
    const cs = getComputedStyle(footer);
    const items = [...inner.children].map(el => { const r = el.getBoundingClientRect(); return { cls: el.className, top: Math.round(r.top), h: Math.round(r.height) }; });
    const rows = new Set(items.map(i => i.top)).size;
    return { footerHeight: Math.round(footer.getBoundingClientRect().height * 10) / 10, rows, items };
  })()`;
  const r2 = await send('Runtime.evaluate', { expression: expr2, returnByValue: true, awaitPromise: true });
  console.log('MOBILE375:', JSON.stringify(r2.result.value, null, 2));

  await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/#trabajos' });
  await sleep(1300);
  const r3 = await send('Runtime.evaluate', { expression: expr2, returnByValue: true, awaitPromise: true });
  console.log('MOBILE844x390:', JSON.stringify(r3.result.value, null, 2));

  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
