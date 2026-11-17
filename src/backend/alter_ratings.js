const mysql = require('mysql2/promise');

(async () => {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'kantinku'
    });
    
    console.log('Dropping old RATINGS table...');
    await db.query('DROP TABLE IF EXISTS RATINGS');
    
    console.log('Creating new RATINGS table...');
    await db.query(`
      CREATE TABLE RATINGS (
          id CHAR(36) PRIMARY KEY,
          user_id CHAR(36) NOT NULL,
          stall_id CHAR(36) NOT NULL,
          order_split_id CHAR(36) NOT NULL,
          menu_item_id CHAR(36) NOT NULL,
          stars INT NOT NULL,
          comment TEXT NULL,
          is_anonymous BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_rating_per_order_item UNIQUE (user_id, order_split_id, menu_item_id),
          FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
          FOREIGN KEY (stall_id) REFERENCES STALLS(id) ON DELETE CASCADE,
          FOREIGN KEY (order_split_id) REFERENCES ORDER_SPLITS(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_item_id) REFERENCES MENU_ITEMS(id) ON DELETE CASCADE
      )
    `);
    
    console.log('RATINGS table updated successfully.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
