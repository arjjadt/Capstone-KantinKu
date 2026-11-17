const http = require('http');

http.get('http://localhost:5000/api/stalls/fa364bf1-20c1-4021-b4d7-933012b11a63', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Stall:', json.data.name);
    console.log('Menus count:', json.data.menu.length);
    json.data.menu.forEach(m => console.log('- ' + m.name));
  });
}).on('error', err => console.log('Error:', err.message));
