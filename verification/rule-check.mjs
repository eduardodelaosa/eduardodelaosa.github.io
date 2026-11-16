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
  { name: 'tablet-portrait-768', w: 768, h: 1024, m: true },
  { name: 'mobile-landscape-844', w: 844, h: 390, m: true },
];

async function main() {
  const out = {};
  for (const vp of VIEWPORTS) {
    const { ws, send } = await connect();
    await send('Page.enable');
    await send('DOM.enable');
    await send('CSS.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await sleep(1300);
    const doc = await send('DOM.getDocument', { depth: 10 });
    const nodeIds = {};
    for (const id of ['trabajos', 'cursos-online', 'inicio']) {
      const { nodeId } = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: `.section-panel[data-section="${id}"] .hero, .section-panel[data-section="${id}"] .section` });
      nodeIds[id] = nodeId;
    }
    out[vp.name] = {};
    for (const id of Object.keys(nodeIds)) {
      const matched = await send('CSS.getMatchedStylesForNode', { nodeId: nodeIds[id] });
      const rules = [];
      for (const ruleMatch of matched.matchedCSSRules) {
        const rule = ruleMatch.rule;
        const pb = rule.style.cssProperties.filter((p) => p.name === 'padding-bottom' && p.parsedOk);
        if (pb.length) {
          rules.push({
            selector: rule.selectorList.text,
            origin: rule.origin,
            lines: rule.styleSheetId + ':' + JSON.stringify(rule.location),
            value: pb[0].value,
          });
        }
      }
      out[vp.name][id] = rules;
    }
    ws.close();
  }
  console.log(JSON.stringify(out, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
