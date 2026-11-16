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

const VPS = [
  { name: 'desktop-1920', w: 1920, h: 1080, m: false },
  { name: 'tablet-landscape-1024', w: 1024, h: 768, m: true },
  { name: 'tablet-portrait-768', w: 768, h: 1024, m: true },
  { name: 'mobile-375', w: 375, h: 667, m: true },
  { name: 'mobile-landscape-844', w: 844, h: 390, m: true },
];

async function main() {
  for (const vp of VPS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/#trabajos' });
    await sleep(1200);
    const expr = `(async () => {
      const panel = document.querySelector('.section-panel.is-active');
      const credit = panel.querySelector('.section-footer__credit');
      const link = credit.querySelector('a');
      const cs = getComputedStyle(link);
      const beforeColor = cs.color;
      const href = link.getAttribute('href');
      link.click();
      await new Promise(r => setTimeout(r, 250));
      const active = document.querySelector('.section-panel.is-active');
      return {
        creditText: credit.textContent.trim(),
        linkText: link.textContent.trim(),
        href,
        linkColor: beforeColor,
        creditColor: getComputedStyle(credit).color,
        hashAfter: location.hash,
        activeSection: active ? active.dataset.section : null,
        footerIdentical: (() => {
          const all = [...document.querySelectorAll('.section-footer')].map(f => f.innerHTML.trim());
          return all.every(h => h === all[0]);
        })(),
      };
    })()`;
    const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    console.log(vp.name, JSON.stringify(result.result.value));
    ws.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
