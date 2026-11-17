const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kantinku'
    });
    
    try {
      await db.query("ALTER TABLE STALLS ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT TRUE;");
      console.log('Column is_open added to STALLS.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Column is_open already exists.');
      } else {
        throw err;
      }
    }
    
    await db.query("UPDATE ORDER_SPLITS SET queue_number = 'STL-001' WHERE queue_number LIKE 'STL-$%'");
    console.log('Database queue numbers fixed.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
