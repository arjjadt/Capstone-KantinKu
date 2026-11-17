require('dotenv').config();
const http = require('http');
const db = require('./config/database');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const [users] = await db.query('SELECT id, role FROM USERS WHERE role = "seller" LIMIT 1');
    if (users.length === 0) return console.log("No seller");
    const user = users[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret_kantinku_jwt_key', { expiresIn: '1d' });

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_user_id = ?', [user.id]);
    if (stalls.length === 0) return console.log("No stall");

    const [splits] = await db.query('SELECT id FROM ORDER_SPLITS WHERE stall_id = ? LIMIT 1', [stalls[0].id]);
    if (splits.length === 0) return console.log("No split");
    
    const splitId = splits[0].id;

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/seller/queue/${splitId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => console.log('Response:', res.statusCode, data));
    });

    req.on('error', (e) => console.error('Request error:', e.message));
    req.end();

  } catch (e) {
    console.error(e);
  }
}
test();
