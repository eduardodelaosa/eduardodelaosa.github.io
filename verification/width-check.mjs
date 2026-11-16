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
  { name: 'PC-1920', w: 1920, h: 1080, touch: false },
  { name: 'PC-1536', w: 1536, h: 864, touch: false },
  { name: 'PC-1366', w: 1366, h: 768, touch: false },
  { name: 'PC-1200', w: 1200, h: 800, touch: false },
  { name: 'PC-1081', w: 1081, h: 800, touch: false },
  { name: 'TABLET-PRO-1366', w: 1366, h: 1024, touch: true },
];

const EXPR = `(() => {
  const R = (el) => { const r = el.getBoundingClientRect(); return { left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10, width: Math.round(r.width * 10) / 10, top: Math.round(r.top * 10) / 10, height: Math.round(r.height * 10) / 10 }; };
  const logo = document.querySelector('.navbar__logo-mark');
  const socials = [...document.querySelectorAll('.navbar__social-link')];
  const lastSocial = socials[socials.length - 1];
  const navRef = { logo: R(logo), lastSocial: R(lastSocial) };
  const trabajos = document.querySelector('.section-panel[data-section="trabajos"]');
  const composition = trabajos.querySelector('.trabajos__composition');
  const studio = trabajos.querySelector('.studio-card');
  const media = trabajos.querySelector('.trabajos__media');
  const textCard = trabajos.querySelector('.trabajos__text-card');
  const dev = document.querySelector('.section-panel[data-section="desarrollo-web"]');
  const grid = dev.querySelector('.desarrollo-web__grid');
  const intro = dev.querySelector('.desarrollo-web__intro');
  const card = dev.querySelector('.desarrollo-web__card');
  const frame = dev.querySelector('.desarrollo-web__card-frame');
  return {
    navRef,
    trabajos: { container: R(trabajos.querySelector('.trabajos__container')), studio: R(studio), composition: R(composition), media: R(media), textCard: R(textCard) },
    dev: { grid: R(grid), intro: R(intro), card: R(card), frame: R(frame) },
    pointerFine: matchMedia('(pointer: fine)').matches,
    hoverHover: matchMedia('(hover: hover)').matches,
  };
})()`;

async function main() {
  const report = {};
  for (const vp of VPS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: false });
    if (vp.touch) {
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    } else {
      await send('Emulation.setTouchEmulationEnabled', { enabled: false });
      await send('Emulation.setEmulatedMedia', { features: [] });
    }
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(250);
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/#trabajos' });
    await sleep(1400);
    const t = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    await send('Runtime.evaluate', { expression: `location.hash = '#desarrollo-web'; void 0` });
    await sleep(400);
    const d = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    report[vp.name] = { trabajosView: t.result.value, devView: d.result.value };
    ws.close();
  }
  if (process.argv[2]) {
    const fs = await import('fs');
    fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
