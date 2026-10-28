const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kantinku',
  port: process.env.DB_PORT || 3306,
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Connected to the database. Starting seed process...');

    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 1. Create Admin
    let adminId;
    const [existingAdmins] = await connection.execute('SELECT id FROM USERS WHERE username = "admin"');
    if (existingAdmins.length > 0) {
      adminId = existingAdmins[0].id;
      console.log('Admin user already exists');
    } else {
      adminId = uuidv4();
      await connection.execute(
        'INSERT INTO USERS (id, username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, 'admin', 'Administrator', 'admin@kantinku.com', passwordHash, 'admin']
      );
      await connection.execute('INSERT INTO ADMINS (user_id) VALUES (?)', [adminId]);
      console.log('Admin user created');
    }

    // 2. Create Buyer
    let buyerId;
    const [existingBuyers] = await connection.execute('SELECT id FROM USERS WHERE username = "pembeli"');
    if (existingBuyers.length > 0) {
      buyerId = existingBuyers[0].id;
      console.log('Buyer user already exists');
    } else {
      buyerId = uuidv4();
      await connection.execute(
        'INSERT INTO USERS (id, username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [buyerId, 'pembeli', 'Pembeli Biasa', 'pembeli@kantinku.com', passwordHash, 'buyer']
      );
      console.log('Buyer user created');
    }

    // 3. Create Seller "babeh"
    let sellerId;
    const [existingSellers] = await connection.execute('SELECT id FROM USERS WHERE username = "babeh"');
    if (existingSellers.length > 0) {
      sellerId = existingSellers[0].id;
      console.log('Seller user already exists');
    } else {
      sellerId = uuidv4();
      await connection.execute(
        'INSERT INTO USERS (id, username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [sellerId, 'babeh', 'Babeh', 'babeh@kantinku.com', passwordHash, 'seller']
      );
      await connection.execute('INSERT INTO SELLERS (user_id) VALUES (?)', [sellerId]);
      console.log('Seller user created');
    }

    // 4. Create UMKM "Bakrie Kantin"
    let umkmId;
    const [existingUmkms] = await connection.execute('SELECT id FROM UMKM_LOCATIONS WHERE name = "Bakrie Kantin"');
    if (existingUmkms.length > 0) {
      umkmId = existingUmkms[0].id;
      console.log('UMKM Bakrie Kantin already exists');
    } else {
      umkmId = uuidv4();
      await connection.execute(
        'INSERT INTO UMKM_LOCATIONS (id, name, description, city_region, full_address, status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [umkmId, 'Bakrie Kantin', 'Kantin Universitas Bakrie', 'Jakarta Selatan', 'Jl. HR Rasuna Said, Jakarta Selatan', 'approved', adminId]
      );
      console.log('UMKM Bakrie Kantin created');
    }

    // 5. Create Warung "Babeh"
    let stallId;
    const [existingStalls] = await connection.execute('SELECT id FROM STALLS WHERE name = "Warung Babeh"');
    if (existingStalls.length > 0) {
      stallId = existingStalls[0].id;
      console.log('Warung Babeh already exists');
    } else {
      stallId = uuidv4();
      await connection.execute(
        'INSERT INTO STALLS (id, owner_id, umkm_location_id, approved_by, name, whatsapp_number, description, status, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [stallId, sellerId, umkmId, adminId, 'Warung Babeh', '081234567890', 'Menjual aneka masakan khas Babeh', 'approved']
      );
      console.log('Warung Babeh created');
    }

    // 6. Create Dagangannya (Menu Items)
    const menus = [
      { id: uuidv4(), name: 'Nasi Goreng Spesial', price: 20000, availability: 'available', category: 'Makanan' },
      { id: uuidv4(), name: 'Mie Goreng Tek-Tek', price: 15000, availability: 'available', category: 'Makanan' },
      { id: uuidv4(), name: 'Ayam Geprek', price: 18000, availability: 'available', category: 'Makanan' },
      { id: uuidv4(), name: 'Es Teh Manis', price: 5000, availability: 'available', category: 'Minuman' },
      { id: uuidv4(), name: 'Es Jeruk', price: 7000, availability: 'available', category: 'Minuman' }
    ];

    const [existingMenu] = await connection.execute('SELECT id FROM MENU_ITEMS WHERE stall_id = ? LIMIT 1', [stallId]);
    if (existingMenu.length === 0) {
      for (const menu of menus) {
        await connection.execute(
          'INSERT INTO MENU_ITEMS (id, stall_id, name, price, availability, category) VALUES (?, ?, ?, ?, ?, ?)',
          [menu.id, stallId, menu.name, menu.price, menu.availability, menu.category]
        );
      }
      console.log(`Added \${menus.length} menu items to Warung Babeh`);
    } else {
      // update menu ids
      const [dbMenus] = await connection.execute('SELECT id FROM MENU_ITEMS WHERE stall_id = ?', [stallId]);
      menus[0].id = dbMenus[0].id;
    }

    // 7. Create Orders, Order Splits, and Order Items
    const [existingOrders] = await connection.execute('SELECT id FROM ORDERS WHERE buyer_user_id = ? LIMIT 1', [buyerId]);
    if (existingOrders.length === 0) {
      const orderId = uuidv4();
      const totalPrice = menus[0].price * 2; // Quantity 2 of first item
      await connection.execute(
        'INSERT INTO ORDERS (id, buyer_user_id, total_price, status) VALUES (?, ?, ?, ?)',
        [orderId, buyerId, totalPrice, 'completed']
      );

      const splitId = uuidv4();
      await connection.execute(
        'INSERT INTO ORDER_SPLITS (id, order_id, stall_id, queue_number, verification_code, dining_option, status, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [splitId, orderId, stallId, 'Q-001', '123456', 'dine_in', 'completed', totalPrice]
      );

      const orderItemId = uuidv4();
      await connection.execute(
        'INSERT INTO ORDER_ITEMS (id, order_split_id, menu_item_id, menu_name_snapshot, price_snapshot, quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderItemId, splitId, menus[0].id, menus[0].name, menus[0].price, 2, 'Pedas ya bang']
      );
      console.log('Order and related items created');

      // 8. Create Ratings
      const ratingId = uuidv4();
      await connection.execute(
        'INSERT INTO RATINGS (id, order_split_id, menu_item_id, stars, comment) VALUES (?, ?, ?, ?, ?)',
        [ratingId, splitId, menus[0].id, 5, 'Enak banget nasgornya!']
      );
      console.log('Rating created');
    }

    // 9. Create UMKM Application (Merged into APPLICATIONS)
    const [existingUmkmApp] = await connection.execute('SELECT id FROM APPLICATIONS WHERE type = "umkm" AND user_id = ?', [adminId]);
    if (existingUmkmApp.length === 0) {
      const umkmAppId = uuidv4();
      await connection.execute(
        'INSERT INTO APPLICATIONS (id, type, user_id, reviewed_by, proposed_name, description, city_region, full_address, status, admin_notes, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [umkmAppId, 'umkm', adminId, adminId, 'Bakrie Kantin', 'Kantin Universitas Bakrie', 'Jakarta Selatan', 'Jl. HR Rasuna Said, Jakarta Selatan', 'approved', 'Disetujui untuk buka']
      );
      console.log('UMKM Application created');
    }

    // 10. Create Stall Application (Merged into APPLICATIONS)
    const [existingStallApp] = await connection.execute('SELECT id FROM APPLICATIONS WHERE type = "stall" AND user_id = ?', [sellerId]);
    if (existingStallApp.length === 0) {
      const stallAppId = uuidv4();
      await connection.execute(
        'INSERT INTO APPLICATIONS (id, type, user_id, umkm_location_id, reviewed_by, proposed_name, whatsapp_number, description, status, admin_notes, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [stallAppId, 'stall', sellerId, umkmId, adminId, 'Warung Babeh', '081234567890', 'Menjual aneka masakan khas Babeh', 'approved', 'Bagus, silakan buka']
      );
      console.log('Stall Application created');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seed();
