require('dotenv').config();
const db = require('./config/database');
const { v4: uuidv4 } = require('uuid');

async function addMenus() {
  try {
    const [stalls] = await db.query('SELECT id FROM STALLS WHERE name = "Warung babeh" LIMIT 1');
    if (stalls.length === 0) {
      console.log('Warung babeh tidak ditemukan');
      process.exit(1);
    }
    
    const stallId = stalls[0].id;
    console.log('Menambahkan menu ke stall_id:', stallId);
    
    const dummyMenus = [
      { id: uuidv4(), stall_id: stallId, name: 'Sate Ayam Madura', price: 20000, photo_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Soto Betawi Daging', price: 35000, photo_url: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Gado-Gado Spesial', price: 15000, photo_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Nasi Kuning Komplit', price: 18000, photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Bebek Goreng Kremes', price: 30000, photo_url: 'https://images.unsplash.com/photo-1626082895617-2c6ab30f48eb?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Ayam Bakar Madu', price: 22000, photo_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Ikan Gurame Asam Manis', price: 45000, photo_url: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Es Jeruk Nipis', price: 6000, photo_url: 'https://images.unsplash.com/photo-1559839914-16aae036b158?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Es Cendol Dawet', price: 10000, photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800', availability: 'available' },
      { id: uuidv4(), stall_id: stallId, name: 'Kerupuk Udang Jumbo', price: 3000, photo_url: 'https://images.unsplash.com/photo-1626082895617-2c6ab30f48eb?auto=format&fit=crop&q=80&w=800', availability: 'available' }
    ];

    for (const menu of dummyMenus) {
      await db.query(
        'INSERT INTO MENU_ITEMS (id, stall_id, name, price, photo_url, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [menu.id, menu.stall_id, menu.name, menu.price, menu.photo_url, menu.availability]
      );
      console.log('Berhasil menambahkan:', menu.name);
    }
    
    console.log('Selesai!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addMenus();
