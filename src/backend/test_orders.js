require('dotenv').config();
const http = require('http');
const db = require('./config/database');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const [users] = await db.query('SELECT id, role, full_name FROM USERS WHERE role = "buyer" LIMIT 1');
    if (users.length === 0) return console.log("No buyer");
    const user = users[0];
    console.log("Buyer:", user.full_name);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret_kantinku_jwt_key', { expiresIn: '1d' });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Orders Response:', res.statusCode);
        const orders = JSON.parse(data).data;
        if (orders.length > 0) {
          const detailOptions = { ...options, path: `/api/orders/${orders[0].id}` };
          const req2 = http.request(detailOptions, (res2) => {
            let data2 = '';
            res2.on('data', (c) => data2 += c);
            res2.on('end', () => console.log('Detail Response:', res2.statusCode, data2.substring(0, 500)));
          });
          req2.end();
        }
      });
    });

    req.on('error', (e) => console.error('Request error:', e.message));
    req.end();

  } catch (e) {
    console.error(e);
  }
}
test();
