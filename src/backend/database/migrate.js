const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'kantinku';
    
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    // Execute schema ignoring errors if indexes already exist
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore duplicate index errors
        if (err.code !== 'ER_DUP_KEYNAME') {
          throw err;
        }
      }
    }

    console.log('Seeding Admin account...');
    // Check if admin exists
    const [rows] = await connection.query('SELECT id FROM USERS WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const adminId = uuidv4();
      const passwordHash = await bcrypt.hash('password123', 10);
      await connection.query(
        `INSERT INTO USERS (id, username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, 'admin', 'Administrator', 'admin@kantinku.com', passwordHash, 'admin']
      );
      await connection.query(
        `INSERT INTO ADMINS (user_id) VALUES (?)`,
        [adminId]
      );
      console.log('Admin account created! Username: admin, Password: password123');
    } else {
      console.log('Admin account already exists.');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
