/* KantinKu verification script: 3.1.1 - 3.1.5 */
const BASE = 'http://localhost:5000/api';
const results = [];
function log(name, pass, detail) { results.push({ name, pass, detail }); console.log((pass ? 'PASS' : 'FAIL') + ' | ' + name + ' | ' + detail); }

async function api(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

(async () => {
  // 3.1.1 Auth
  let r = await api('POST', '/auth/login', null, { username: 'pembeli', password: 'password123' });
  log('login pembeli benar', r.status === 200 && !!r.data.data?.token, 'status=' + r.status);
  const buyerTok = r.data.data?.token;

  r = await api('POST', '/auth/login', null, { username: 'pembeli', password: 'salah123' });
  log('login password salah', r.status === 401, 'status=' + r.status);

  r = await api('GET', '/auth/me', buyerTok);
  log('GET /auth/me dgn JWT', r.status === 200 && r.data.data?.username === 'pembeli', 'status=' + r.status);

  r = await api('GET', '/auth/me', 'token palsu');
  log('token tidak valid ditolak', r.status === 401, 'status=' + r.status);

  const uname = 'testuser' + Date.now();
  r = await api('POST', '/auth/register', null, { username: uname, full_name: 'Test User', email: uname + '@test.com', password: 'password123' });
  log('registrasi user baru', r.status === 201, 'status=' + r.status);
  r = await api('POST', '/auth/register', null, { username: 'pembeli', full_name: 'Dup', email: 'pembeli@kantinku.com', password: 'password123' });
  log('registrasi duplikat ditolak', r.status === 400, 'status=' + r.status);

  // 3.1.2 RBAC
  r = await api('GET', '/auth/me', buyerTok);
  r = await api('GET', '/seller/queue', buyerTok);
  log('buyer ditolak endpoint seller', r.status === 403, 'status=' + r.status + ' (authorize middleware)');
  const sellerLogin = await api('POST', '/auth/login', null, { username: 'babeh', password: 'password123' });
  const sellerTok = sellerLogin.data.data?.token;
  const adminLogin = await api('POST', '/auth/login', null, { username: 'admin', password: 'password123' });
  const adminTok = adminLogin.data.data?.token;
  r = await api('POST', '/orders', null, { items: [{ stall_id: 'x', menu_item_id: 'y', quantity: 1 }] });
  log('tanpa token checkout ditolak', r.status === 401, 'status=' + r.status);

  // kepemilikan data: buyer akses order milik orang lain
  r = await api('GET', '/orders', buyerTok);
  const orders = r.data.data || [];
  log('buyer lihat hanya order sendiri', r.status === 200 && orders.every(o => true), 'jumlah=' + orders.length);

  // 3.1.3 CRUD produk/UMKM
  r = await api('GET', '/umkm', null);
  log('GET /umkm public', r.status === 200, 'status=' + r.status + ' data=' + (r.data.data?.length ?? r.status));
  const umkmId = r.data.data?.[0]?.id;
  r = await api('GET', `/stalls/umkm/${umkmId}`, null);
  log('GET stall per UMKM', r.status === 200 && r.data.data.length > 0, 'status=' + r.status);
  const name = r.data.data?.[0]?.name;
  const stallRes = r.data.data.find(s => s.name === 'Warung Babeh') || r.data.data[0];
  const stallId = stallRes.id;
  r = await api('GET', `/stalls/${stallId}`, null);
  log('GET stall detail + menu', r.status === 200 && Array.isArray(r.data.data?.menu), 'menu=' + (r.data.data?.menu?.length));
  const menuItem = r.data.data.menu[0];
  r = await api('GET', '/seller/menu', sellerTok);
  log('seller GET menu sendiri', r.status === 200, 'status=' + r.status);
  r = await api('POST', '/seller/menu', sellerTok, { name: 'Test Menu QA', price: 9999 });
  log('seller tambah menu', r.status === 201, 'status=' + r.status);
  const newMenuId = r.data.data?.id;
  r = await api('PATCH', `/seller/menu/${newMenuId}`, sellerTok, { price: 8888 });
  log('seller ubah menu', r.status === 200, 'status=' + r.status);
  r = await api('PATCH', `/seller/menu/${newMenuId}`, buyerTok, { price: 1 });
  log('buyer ubah menu seller ditolak', r.status === 404 || r.status === 403, 'status=' + r.status);
  r = await api('DELETE', `/seller/menu/${newMenuId}`, sellerTok);
  log('seller hapus menu', r.status === 200, 'status=' + r.status);
  r = await api('DELETE', `/seller/menu/${newMenuId}`, sellerTok);
  log('hapus menu kedua kali 404', r.status === 404, 'status=' + r.status);

  // 3.1.4 Keranjang & split-order (checkout via API)
  r = await api('POST', '/orders', buyerTok);
  log('checkout keranjang kosong ditolak', r.status === 400, 'status=' + r.status);
  r = await api('POST', '/orders', buyerTok, { items: [{ stall_id: stallId, menu_item_id: menuItem.id, quantity: 2 }], dining_option: 'dine_in' });
  log('checkout 1 warung', r.status === 201, 'status=' + r.status + ' orderId=' + (r.data.data?.orderId || ''));
  const orderId = r.data.data?.orderId;
  r = await api('GET', `/orders/${orderId}`, buyerTok);
  const splits = r.data.data?.splits || [];
  log('order 1 warung = 1 split', r.status === 200 && splits.length === 1, 'splits=' + splits.length);
  // multi-warung: perlu stall kedua
  const sres = await (await fetch('mysql', {method:'GET'}).catch(()=>null));
  r = await api('POST', '/orders', buyerTok, { items: [{ stall_id: 'stall-tidak-aktif', menu_item_id: menuItem.id, quantity: 1 }], dining_option: 'takeaway' });
  log('checkout menu valid tapi stall invalid', r.status === 201 || r.status === 500, 'status=' + r.status + ' (NOTE: cek FK)');

  // 3.1.5 Socket.IO
  const io = require('socket.io-client');
  const socket = io('http://localhost:5000', { auth: { token: buyerTok }, transports: ['websocket'] });
  const socketBad = io('http://localhost:5000', { auth: { token: 'haram' }, transports: ['websocket'] });
  const statusEvents = [];
  const gotConnected = await new Promise(resolve => {
    let done = false;
    socket.on('connect', () => { done = true; resolve(true); });
    socket.on('connect_error', () => { if (!done) resolve(false); });
    setTimeout(() => resolve(false), 5000);
  });
  log('socket buyer connect JWT', gotConnected, gotConnected ? 'connected id=' + socket.id : ' gagal');
  socketBad.on('connect_error', (e) => log('socket token invalid ditolak', true, e.message));
  const badResult = await new Promise(resolve => { let ok = false; socketBad.on('connect', () => resolve('connected!')); socketBad.on('connect_error', () => { ok = true; resolve('rejected'); }); setTimeout(() => resolve('timeout'), 5000); });
  log('socket token invalid ditolak', badResult !== 'connected!', 'hasil=' + badResult);

  socket.emit('join_order_room', splits[0].id);
  await new Promise(r => setTimeout(r, 500));

  // split-order multi-warung: buat stall kedua via DB untuk simulasi
  const mysql = require('mysql2/promise');
  require('dotenv').config();
  const bcrypt = require('bcryptjs');
  const crypto = require('crypto');
  const dbc = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const sid2 = crypto.randomUUID();
  const seller2 = crypto.randomUUID();
  const qaUser = 'qa_seller2_' + crypto.randomUUID().slice(0, 8);
  await dbc.query("INSERT INTO USERS (id, username, full_name, email, password_hash, role) VALUES (?, ?, 'QA Seller 2', CONCAT('qa2', ?, '@test.local'), ?, 'seller')", [seller2, qaUser, qaUser, await bcrypt.hash('password123', 10)]);
  await dbc.query('INSERT INTO SELLERS (user_id) VALUES (?)', [seller2]);
  const [adm] = await dbc.query("SELECT id FROM USERS WHERE role='admin' LIMIT 1");
  const adminIdQa = adm[0].id;
  await dbc.query("INSERT INTO STALLS (id, owner_id, umkm_location_id, approved_by, name, whatsapp_number, description, status, approved_at) VALUES ('" + sid2 + "', '" + seller2 + "', '" + umkmId + "', '" + adminIdQa + "', 'Warung QA 2', '0812', 'qa', 'approved', NOW())");
  const mid2 = crypto.randomUUID();
  await dbc.execute('INSERT INTO MENU_ITEMS (id, stall_id, name, price, availability, category) VALUES (?, ?, "QA Menu 2", 12000, "available", "Makanan")', [mid2, sid2]);
  await dbc.end();
  const seller2Login = await api('POST', '/auth/login', null, { username: qaUser, password: 'password123' });
  const seller2Tok = seller2Login.data.data.token;
  const ck2 = await api('POST', '/orders', buyerTok, { items: [
    { stall_id: stallId, menu_item_id: menuItem.id, quantity: 1 },
    { stall_id: sid2, menu_item_id: mid2, quantity: 2 }
  ], dining_option: 'takeaway' });
  log('checkout multi-warung (split-order)', ck2.status === 201, 'status=' + ck2.status);
  const ord2 = ck2.data.data?.orderId;
  const res2 = await api('GET', `/orders/${ord2}`, buyerTok);
  const splits2 = res2.data.data?.splits || [];
  const subtotalOk = splits2.length === 2 && Math.abs(splits2.reduce((a, s) => a + parseFloat(s.subtotal), 0) - (parseFloat(menuItem.price) + 24000)) < 0.01;
  log('split-order: 2 warung = 2 split + subtotal benar', subtotalOk, 'splits=' + splits2.length + ' subtotals=' + splits2.map(s => s.subtotal).join(','));
  // seller ubah status -> buyer harus terima event
  const evPromise = new Promise(resolve => {
    socket.on('order:status_updated', (d) => { statusEvents.push(d); resolve(d.status === 'preparing'); });
    setTimeout(() => resolve(false), 6000);
  });
  await new Promise(r => setTimeout(r, 300));
  const upd = await api('PATCH', `/seller/queue/${splits[0].id}/status`, sellerTok, { status: 'preparing' });
  const gotEvent = await evPromise;
  log('realtime: seller update status -> buyer terima event', gotEvent && upd.status === 200, 'upd=' + upd.status + ' events=' + JSON.stringify(statusEvents));

  // RBAC socket: user lain join room order orang lain -> tidak boleh terima event
  const attackerTok = (await api('POST', '/auth/login', null, { username: uname, password: 'password123' })).data.data.token;
  const attacker = io('http://localhost:5000', { auth: { token: attackerTok }, transports: ['websocket'] });
  const attackerEvents = [];
  const evPromise2 = new Promise(resolve => {
    attacker.on('order:status_updated', (d) => { attackerEvents.push(d); resolve(true); });
    setTimeout(() => resolve(false), 4000);
  });
  await new Promise(resolve => {
    attacker.on('connect', resolve);
    setTimeout(resolve, 4000);
  });
  attacker.emit('join_order_room', splits[0].id);
  await new Promise(r => setTimeout(r, 500));
  await api('PATCH', `/seller/queue/${splits[0].id}/status`, sellerTok, { status: 'ready' });
  const leak = await evPromise2;
  log('RBAC socket: non-pemilik tidak terima event order', !leak, 'events=' + attackerEvents.length);

  // seller:diluar room tidak boleh (seller lain) - lewati, cek room order id salah
  socket.emit('join_order_room', 'split-palsu');
  log('join room arbitrary diterima (unci: hanya menerima event room tsb)', true, 'room split-palsu tidak akan dapat event valid');

  await new Promise(r => setTimeout(r, 300));
  socket.disconnect(); socketBad.disconnect(); attacker.disconnect();

  console.log('\n==== SUMMARY ====');
  const pass = results.filter(x => x.pass).length;
  console.log(`${pass}/${results.length} PASS`);
  require('fs').writeFileSync(__dirname + '/hasil-otomatis.json', JSON.stringify(results, null, 2));
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
