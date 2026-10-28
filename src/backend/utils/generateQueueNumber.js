const db = require('../config/database');

const generateQueueNumber = async (stallId, connection) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Use the provided connection (which is in a transaction) and lock the rows
  // Or simply get the max queue number for today
  const query = connection || db;
  const [rows] = await query.query(
    `SELECT COUNT(*) as count FROM ORDER_SPLITS 
     WHERE stall_id = ? AND DATE(created_at) = ? FOR UPDATE`,
    [stallId, today]
  );
  
  const count = rows[0].count + 1;
  // Make the queue number unique per day by appending date if necessary, or just rely on sequence.
  // Actually, wait, to fix the UNIQUE constraint without altering DB, we can prepend the date.
  // e.g., STL-260725-001
  const dateStr = today.replace(/-/g, '').slice(2); // e.g. 260725
  return `STL-${dateStr}-${count.toString().padStart(3, '0')}`;
};

module.exports = generateQueueNumber;
