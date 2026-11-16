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
    const out = {};
    for (const id of ids) {
      document.querySelectorAll('.section-panel').forEach(p => { p.classList.remove('is-active'); p.removeAttribute('inert'); p.setAttribute('aria-hidden','false'); });
      const panel = document.querySelector('.section-panel[data-section="' + id + '"]');
      panel.classList.add('is-active');
      await new Promise((r) => setTimeout(r, 60));
      const root = panel.querySelector('.hero, .section');
      const cs = getComputedStyle(root);
      const footer = panel.querySelector('.section-footer');
      // sample colors behind footer using elementFromPoint at footer center-left
      footer && footer.scrollIntoView({ block: 'end' });
      await new Promise((r) => setTimeout(r, 40));
      const fr = footer.getBoundingClientRect();
      const px = Math.round(fr.left + 30), py = Math.round(fr.top + fr.height / 2);
      footer.style.opacity = '0';
      const behind = document.elementFromPoint(px, py);
      footer.style.opacity = '';
      const bcs = behind ? getComputedStyle(behind) : null;
      const chain = [];
      let el = footer;
      while (el && el !== document.body) { chain.push(el.className && typeof el.className === 'string' ? (el.tagName.toLowerCase() + '.' + el.className.split(' ').slice(0,2).join('.')) : el.tagName.toLowerCase()); el = el.parentElement; }
      out[id] = {
        rootBg: cs.backgroundColor,
        rootBgImage: cs.backgroundImage.slice(0, 140),
        behindFooter: behind ? bcs.backgroundColor : 'n/a',
        behindClass: behind ? behind.className.toString().slice(0, 80) : 'n/a',
        footerBg: getComputedStyle(footer).backgroundColor,
        chain,
      };
    }
    return out;
  })()`;
  const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(result.result.value, null, 2));
  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
