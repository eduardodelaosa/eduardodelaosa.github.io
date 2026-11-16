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
  { name: 'PC-1920', w: 1920, h: 1080, m: false },
  { name: 'PC-1536', w: 1536, h: 864, m: false },
  { name: 'PC-1366', w: 1366, h: 768, m: false },
  { name: 'PC-1200', w: 1200, h: 800, m: false },
  { name: 'PC-1081', w: 1081, h: 800, m: false },
  { name: 'TB-H-1024', w: 1024, h: 768, m: true },
  { name: 'TB-H-900', w: 900, h: 700, m: true },
  { name: 'TB-V-768', w: 768, h: 1024, m: true },
  { name: 'TB-V-810', w: 810, h: 1080, m: true },
  { name: 'MV-390', w: 390, h: 844, m: true },
  { name: 'MV-375', w: 375, h: 667, m: true },
  { name: 'MH-844', w: 844, h: 390, m: true },
];

const MEASURE = `(() => {
  const panel = document.querySelector('.section-panel[data-section="desarrollo-web"]');
  const grid = panel.querySelector('.desarrollo-web__grid');
  const cards = [...panel.querySelectorAll('.desarrollo-web__card')];
  const g = grid.getBoundingClientRect();
  const items = cards.map((card) => {
    const frame = card.querySelector('.desarrollo-web__card-frame');
    const title = card.querySelector('.desarrollo-web__card-title');
    const cr = card.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    return {
      top: Math.round(cr.top * 10) / 10,
      left: Math.round(cr.left * 10) / 10,
      width: Math.round(cr.width * 10) / 10,
      frameTop: Math.round(fr.top * 10) / 10,
      frameBottom: Math.round(fr.bottom * 10) / 10,
      titleTop: Math.round(tr.top * 10) / 10,
      frameAboveTitle: fr.bottom <= tr.top + 0.6,
      frameFullWidth: fr.width >= cr.width - 14,
      title: title.textContent.trim().slice(0, 30),
    };
  });
  const rowTops = [...new Set(items.map((i) => Math.round(i.top)))];
  const cols = [...new Set(items.map((i) => Math.round(i.left)))];
  const perRow = {};
  items.forEach((i) => { const k = Math.round(i.top); perRow[k] = (perRow[k] || 0) + 1; });
  const container = grid.parentElement.getBoundingClientRect();
  const nav = [...document.querySelectorAll('.navbar__links a')].map((a) => a.textContent.trim());
  const linksEl = document.querySelector('.navbar__links');
  const navOverflow = linksEl ? linksEl.scrollWidth - linksEl.clientWidth : null;
  const navRect = linksEl ? linksEl.getBoundingClientRect() : null;
  const socialRect = document.querySelector('.navbar__social') ? document.querySelector('.navbar__social').getBoundingClientRect() : null;
  return {
    navLinks: nav,
    navOverflowPx: navOverflow,
    navLinksRight: navRect ? Math.round(navRect.right) : null,
    socialLeft: socialRect ? Math.round(socialRect.left) : null,
    cardsCount: cards.length,
    rows: rowTops.length,
    rowTops,
    cardsPerRow: Object.values(perRow),
    colsCount: cols.length,
    perRow,
    gridCentered: Math.abs((g.left + g.width / 2) - (container.left + container.width / 2)) < 1.5,
    gridWidth: Math.round(g.width),
    equalWidths: Math.abs(items[0].width - items[1].width) < 1,
    frameAboveTitleAll: items.every((i) => i.frameAboveTitle),
    frameFullWidthAll: items.every((i) => i.frameFullWidth),
    items,
  };
})()`;

async function main() {
  const report = {};
  for (const vp of VPS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/#desarrollo-web' });
    await sleep(1500);
    const r = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
    report[vp.name] = r.result.value;
    ws.close();
  }

  // Mobile menu label
  const { ws, send } = await connect();
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await sleep(1300);
  const r = await send('Runtime.evaluate', { expression: `(async () => {
    document.querySelector('.navbar__toggle').click();
    await new Promise(r => setTimeout(r, 400));
    return [...document.querySelectorAll('.navbar__mobile a')].map(a => a.textContent.trim());
  })()`, returnByValue: true, awaitPromise: true });
  report.mobileMenu = r.result.value;
  ws.close();

  console.log(JSON.stringify(report, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
