require('dotenv').config();
const http = require('http');
const db = require('./config/database');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const [users] = await db.query('SELECT id, role FROM USERS WHERE role = "seller" LIMIT 1');
    if (users.length === 0) { console.log("No seller found"); return; }
    
    const user = users[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret_kantinku_jwt_key', { expiresIn: '1d' });
    
    const postData = JSON.stringify({
      name: 'Warung Test',
      description: 'Test update',
      whatsapp_number: '0812345'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/seller/stall/my/profile',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => console.log('Response:', res.statusCode, data));
    });

    req.on('error', (e) => console.error('Request error:', e.message));
    req.write(postData);
    req.end();

  } catch (e) {
    console.error(e);
  }
}
test();
