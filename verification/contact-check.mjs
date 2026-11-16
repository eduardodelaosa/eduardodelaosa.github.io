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
  { name: 'TB-H-1024', w: 1024, h: 768, m: true },
  { name: 'TB-V-768', w: 768, h: 1024, m: true },
  { name: 'TB-V-810', w: 810, h: 1080, m: true },
  { name: 'MV-390', w: 390, h: 844, m: true },
  { name: 'MV-375', w: 375, h: 667, m: true },
  { name: 'MH-844', w: 844, h: 390, m: true },
];

const MEASURE = `(() => {
  const panel = document.querySelector('.section-panel[data-section="contacto-seccion"]');
  const q = (s) => panel.querySelector(s);
  const rect = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top * 10) / 10, left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10 }; };
  const cards = [...panel.querySelectorAll('.contacto__info-card')];
  const email = cards[0], phone = cards[1];
  const address = q('.contacto__address');
  const form = q('.contacto__form');
  const card = q('.asistente__card');
  const inner = q('.asistente__card-inner');
  const intro = q('.final-section__intro');
  const re = rect(email), rp = rect(phone), ra = rect(address), rf = rect(form), rc = rect(card), ri = rect(inner), rin = rect(intro);
  const introStyle = getComputedStyle(intro);
  const leftTop = re.top;
  const leftBottom = rf.bottom;
  const rowGap1 = Math.round((Math.max(re.bottom, rp.bottom) >= ra.top ? ra.top - Math.max(re.bottom, rp.bottom) : ra.top - Math.max(re.bottom, rp.bottom)) * 100) / 100;
  const rowGap2 = Math.round((rf.top - ra.bottom) * 100) / 100;
  const colGap = Math.round((rp.left - re.right) * 100) / 100;
  const emailTitle = email ? email.querySelector('h3').textContent : null;
  const phoneTitle = phone ? phone.querySelector('h3').textContent : null;
  const sameWidth = Math.abs(re.width - rp.width) < 0.6;
  return {
    titles: [emailTitle, phoneTitle],
    cardsCount: cards.length,
    colGap,
    rowGap1,
    rowGap2,
    sameWidth,
    leftTop, leftBottom,
    leftHeight: Math.round((leftBottom - leftTop) * 10) / 10,
    rightTop: rc.top, rightBottom: rc.bottom,
    rightHeight: rc.height,
    topAligned: Math.abs(rc.top - leftTop) < 1,
    bottomAligned: Math.abs(rc.bottom - leftBottom) < 1,
    introDisplay: introStyle.display,
    introVisible: introStyle.display !== 'none' && rin.height > 0,
    introHeight: rin.height,
    rightClipped: ri.height > rc.height + 0.5 || inner.scrollHeight > card.clientHeight + 1,
    emailHref: email ? (email.querySelector('a') || {}).getAttribute?.('href') : null,
    transformed: [q('.contacto__info'), form, address].map((el) => getComputedStyle(el).transform),
    overflowX: panel.scrollWidth > panel.clientWidth,
    addressText: address ? address.textContent.replace(/\\s+/g, ' ').trim() : null,
  };
})()`;

async function main() {
  const report = {};
  for (const vp of VPS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/#contacto-seccion' });
    await sleep(1600);

    const before = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });

    // Interaction stability: open first question, wait, measure, close, wait, measure again
    await send('Runtime.evaluate', { expression: `document.querySelector('.section-panel[data-section="contacto-seccion"] .asistente__question-btn').click(); void 0` });
    await sleep(500);
    const opened = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
    await send('Runtime.evaluate', { expression: `document.querySelector('.section-panel[data-section="contacto-seccion"] .asistente__question-btn').click(); void 0` });
    await sleep(700);
    const closed = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });

    const b = before.result.value;
    const o = opened.result.value;
    const c = closed.result.value;
    report[vp.name] = {
      ...b,
      stableOnOpen: {
        emailTopDelta: Math.round((o.titles ? 0 : 0) + (o.leftTop - b.leftTop) * 100) / 100,
        addressTopDelta: Math.round((c ? 0 : 0) + 0),
      },
      openState: { leftHeight: o.leftHeight, rightHeight: o.rightHeight, leftTop: o.leftTop, leftBottom: o.leftBottom, rightBottom: o.rightBottom, topAligned: o.topAligned, bottomAligned: o.bottomAligned },
      closedState: { leftTop: c.leftTop, leftBottom: c.leftBottom, rightHeight: c.rightHeight, bottomAligned: c.bottomAligned, sameAsBefore: Math.abs(c.leftTop - b.leftTop) < 0.6 && Math.abs(c.leftBottom - b.leftBottom) < 0.6 },
    };
    ws.close();
  }
  if (process.argv[2]) {
    const fsm = await import('fs');
    fsm.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
