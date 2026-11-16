import fs from 'fs';
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
  const outDir = process.env.TEMP + '\\opencode\\shots2';
  fs.mkdirSync(outDir, { recursive: true });

  const shot = async (name, vp, sectionId, scroll) => {
    await send('Emulation.setDeviceMetricsOverride', { width: vp[0], height: vp[1], deviceScaleFactor: 1, mobile: !!vp[2] });
    await send('Page.navigate', { url: `http://127.0.0.1:5173/#${sectionId}` });
    await sleep(1200);
    if (scroll) {
      await send('Runtime.evaluate', { expression: `document.querySelector('.section-panel.is-active').scrollTop = ${scroll}; void 0` });
      await sleep(200);
    }
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${outDir}\\${name}.png`, Buffer.from(data, 'base64'));
    console.log('shot', name);
  };

  await shot('1366-trabajos', [1366, 768], 'trabajos');
  await shot('1366-cursos', [1366, 768], 'cursos-online');
  await shot('1366-trabajos-scrolled', [1366, 768], 'trabajos', 9999);
  await shot('1920-trabajos', [1920, 1080], 'trabajos');
  await shot('768p-trabajos', [768, 1024, 1], 'trabajos');
  await shot('375p-contacto-end', [375, 667, 1], 'contacto-seccion', 999999);
  await shot('1024l-trabajos', [1024, 768, 1], 'trabajos');
  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
