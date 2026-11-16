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

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080, m: false },
  { name: 'desktop-1366', w: 1366, h: 768, m: false },
  { name: 'tablet-landscape-1024', w: 1024, h: 768, m: true },
  { name: 'tablet-portrait-768', w: 768, h: 1024, m: true },
  { name: 'tablet-portrait-810', w: 810, h: 1080, m: true },
  { name: 'mobile-portrait-375', w: 375, h: 667, m: true },
  { name: 'mobile-landscape-844', w: 844, h: 390, m: true },
];

async function main() {
  const report = {};
  for (const vp of VIEWPORTS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await sleep(1300);
    const expr = `(async () => {
      const ids = ['inicio','trabajos','cursos-online','desarrollo-web','contacto-seccion'];
      const out = {};
      for (const id of ids) {
        document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('is-active'));
        const panel = document.querySelector('.section-panel[data-section="' + id + '"]');
        panel.classList.add('is-active');
        await new Promise((r) => setTimeout(r, 50));
        const root = panel.querySelector('.hero, .section');
        const cs = getComputedStyle(root);
        const r = root.getBoundingClientRect();
        const footer = panel.querySelector('.section-footer');
        const fcs = footer ? getComputedStyle(footer) : {};
        out[id] = {
          rootBoxBottomGap: Math.round((window.innerHeight - r.bottom) * 10) / 10,
          paddingBottom: cs.paddingBottom,
          paddingTop: cs.paddingTop,
          position: cs.position,
          overflow: cs.overflow,
          display: cs.display,
          justify: cs.justifyContent,
          minHeight: cs.minHeight,
          footerMarginTop: fcs.marginTop,
          footerPosition: fcs.position,
        };
      }
      return out;
    })()`;
    const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    report[vp.name] = result.result.value;
    ws.close();
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
