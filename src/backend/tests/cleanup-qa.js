require('dotenv').config();
const m = require('mysql2/promise');
(async () => {
  const c = await m.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await c.query("DELETE mi FROM MENU_ITEMS mi JOIN STALLS s ON mi.stall_id = s.id WHERE s.name = 'Warung QA 2'");
  await c.query("DELETE FROM STALLS WHERE name = 'Warung QA 2'");
  const [qa] = await c.query("SELECT id FROM USERS WHERE email LIKE '%@test.local' OR (email LIKE 'qa2%' AND role='seller')");
  for (const u of qa) { await c.query('DELETE FROM SELLERS WHERE user_id = ?', [u.id]); await c.query('DELETE FROM USERS WHERE id = ?', [u.id]); }
  console.log('cleaned qa rows:', qa.length);
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
