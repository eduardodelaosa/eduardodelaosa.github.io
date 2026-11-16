const CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const URL_APP = 'http://127.0.0.1:5173/';

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false },
  { name: 'desktop-1366', width: 1366, height: 768, mobile: false },
  { name: 'tablet-landscape-1024', width: 1024, height: 768, mobile: true },
  { name: 'tablet-portrait-768', width: 768, height: 1024, mobile: true },
  { name: 'tablet-portrait-810', width: 810, height: 1080, mobile: true },
  { name: 'mobile-portrait-375', width: 375, height: 667, mobile: true },
  { name: 'mobile-portrait-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-landscape-844', width: 844, height: 390, mobile: true },
];

const SECTIONS = ['inicio', 'trabajos', 'cursos-online', 'desarrollo-web', 'contacto-seccion'];

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
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
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
  const report = {};

  for (const viewport of VIEWPORTS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    });
    await send('Runtime.evaluate', { expression: `location.href = '${URL_APP}';`, returnByValue: true });
    await sleep(1200);

    const expr = `(async () => {
      const ids = ${JSON.stringify(SECTIONS)};
      const out = {};
      for (const id of ids) {
        window.location.hash = '#' + id;
        await new Promise((r) => setTimeout(r, 220));
        const panel = document.querySelector('.section-panel[data-section="' + id + '"]');
        if (!panel) { out[id] = { error: 'no panel' }; continue; }
        const footer = panel.querySelector('.section-footer');
        if (!footer) { out[id] = { error: 'no footer' }; continue; }
        const inner = footer.querySelector('.section-footer__inner');
        const fr = footer.getBoundingClientRect();
        const ir = inner.getBoundingClientRect();
        const cs = getComputedStyle(footer);
        const rule = panel.querySelector('.hero__portrait-rule--bottom');
        const rr = rule ? rule.getBoundingClientRect() : null;
        out[id] = {
          winH: window.innerHeight,
          footerTop: Math.round(fr.top * 10) / 10,
          footerBottom: Math.round(fr.bottom * 10) / 10,
          gapFromBottom: Math.round((window.innerHeight - fr.bottom) * 10) / 10,
          footerHeight: Math.round(fr.height * 10) / 10,
          borderBottom: cs.borderTopWidth,
          borderTopColor: cs.borderTopColor,
          innerTop: Math.round(ir.top * 10) / 10,
          innerHeight: Math.round(ir.height * 10) / 10,
          panelOverflow: panel.scrollHeight - panel.clientHeight,
          scrollVisible: panel.scrollHeight > panel.clientHeight,
          bandContainsRule: rr ? (fr.top <= rr.top && rr.bottom <= fr.bottom) : null,
          emailPresent: (panel.textContent || '').includes('edu_teclistaa'),
        };
      }
      return out;
    })()`;

    const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    report[viewport.name] = result.result.value;
    ws.close();
  }

  const fs = await import('fs');
  const out = process.argv[2];
  if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
