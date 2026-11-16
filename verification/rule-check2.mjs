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
  await send('DOM.enable');
  await send('CSS.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await sleep(1500);
  // Find footer node via Runtime evaluate returning remote object? Simpler: iterate DOM to find body->main->section-panel...
  const doc = await send('DOM.getDocument', { depth: -1 });
  // find section node by attributes
  const { nodeId: secId } = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.section-panel[data-section="trabajos"] > section' });
  const { nodeId: heroId } = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.section-panel[data-section="inicio"] > section' });
  const { nodeId: cursId } = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.section-panel[data-section="cursos-online"] > section' });
  const inspectNode = async (label, nodeId) => {
    const matched = await send('CSS.getMatchedCSSRules'.replace('CSSRules', 'StylesForNode'), { nodeId });
    const out = [];
    for (const ruleMatch of matched.matchedCSSRules || []) {
      const rule = ruleMatch.rule;
      const text = rule.style.cssText || '';
      if (/padding/i.test(text)) {
        out.push({
          selector: rule.selectorList ? rule.selectorList.text : '?',
          cssText: text.replace(/\n/g, ' ').slice(0, 220),
        });
      }
    }
    console.log('==== ', label);
    console.log(JSON.stringify(out, null, 1));
  };
  await inspectNode('trabajos-root', secId);
  await inspectNode('inicio-root', heroId);
  await inspectNode('cursos-root', cursId);
  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
