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
    const navLinks = [...document.querySelectorAll('.navbar__links a')].map(a => a.textContent.trim());
    const emailAnywhere = document.body.innerHTML.includes('edu_teclistaa');
    const mailtoCount = (document.body.innerHTML.match(/mailto:/g) || []).length;
    const link = [...document.querySelectorAll('.navbar__links a')].find(a => a.textContent.trim() === 'Diseño web');
    link.click();
    await new Promise((r) => setTimeout(r, 250));
    const activePanel = document.querySelector('.section-panel.is-active');
    return {
      navDesktop: navLinks,
      emailAnywhere,
      mailtoCount,
      click: {
        hash: location.hash,
        activeSection: activePanel ? activePanel.dataset.section : null,
        activeTitle: activePanel ? (activePanel.querySelector('.section-title') || {}).textContent : null,
      },
    };
  })()`;

  const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log('DESKTOP:', JSON.stringify(result.result.value, null, 2));

  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await sleep(1300);
  const expr2 = `(async () => {
    document.querySelector('.navbar__toggle').click();
    await new Promise((r) => setTimeout(r, 450));
    const items = [...document.querySelectorAll('.navbar__mobile a')].map(a => a.textContent.trim());
    const link = [...document.querySelectorAll('.navbar__mobile a')].find(a => a.textContent.trim() === 'Diseño web');
    link.click();
    await new Promise((r) => setTimeout(r, 250));
    return {
      mobileItems: items,
      hashAfter: location.hash,
      activeSection: document.querySelector('.section-panel.is-active') ? document.querySelector('.section-panel.is-active').dataset.section : null,
      menuOpen: document.querySelector('.navbar__mobile').classList.contains('navbar__mobile--open'),
      emailAnywhere: document.body.innerHTML.includes('edu_teclistaa'),
    };
  })()`;
  const result2 = await send('Runtime.evaluate', { expression: expr2, returnByValue: true, awaitPromise: true });
  console.log('MOBILE:', JSON.stringify(result2.result.value, null, 2));

  // Legal modal paragraphs (must not contain the email)
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/#contacto-seccion' });
  await sleep(1300);
  const expr3 = `(async () => {
    const panel = document.querySelector('.section-panel.is-active');
    const infoCards = panel.querySelectorAll('.contacto__info-card');
    const legalButtons = [...panel.querySelectorAll('.section-footer__legal button')];
    legalButtons[0].click();
    await new Promise((r) => setTimeout(r, 300));
    const modalText = document.querySelector('.section-footer__modal-card') ? document.querySelector('.section-footer__modal-card').textContent : '';
    await new Promise((r) => setTimeout(r, 50));
    // trigger Escape via keydown
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise((r) => setTimeout(r, 200));
    legalButtons[1] && legalButtons[1].click();
    await new Promise((r) => setTimeout(r, 300));
    const modal2 = document.querySelector('.section-footer__modal-card') ? document.querySelector('.section-footer__modal-card').textContent : '';
    return {
      infoCardTitles: [...infoCards].map(c => (c.querySelector('h3') || {}).textContent),
      avisoText: modalText.slice(0, 400),
      privacidadHasEmail: modal2.includes('edu_teclistaa'),
      footerHasEmailElement: !!document.querySelector('.section-footer__email'),
      fullEmailAnywhere: document.body.innerHTML.includes('edu_teclistaa'),
    };
  })()`;
  const result3 = await send('Runtime.evaluate', { expression: expr3, returnByValue: true, awaitPromise: true });
  console.log('CONTACT/LEGAL:', JSON.stringify(result3.result.value, null, 2));
  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
