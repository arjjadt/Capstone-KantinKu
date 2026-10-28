const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');

const getReport = async (req, res, next) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);
    const stallId = stalls[0].id;

    let dateCondition = 'DATE(updated_at) = CURDATE()'; // Default daily
    if (period === 'weekly') {
      dateCondition = 'YEARWEEK(updated_at, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (period === 'monthly') {
      dateCondition = 'YEAR(updated_at) = YEAR(CURDATE()) AND MONTH(updated_at) = MONTH(CURDATE())';
    }

    const [revenueRows] = await db.query(
      `SELECT SUM(subtotal) as total_revenue, COUNT(id) as total_orders 
       FROM ORDER_SPLITS 
       WHERE stall_id = ? AND status = 'completed' AND ${dateCondition}`,
      [stallId]
    );

    const [itemRows] = await db.query(
      `SELECT SUM(oi.quantity) as items_sold 
       FROM ORDER_ITEMS oi 
       JOIN ORDER_SPLITS os ON oi.order_split_id = os.id 
       WHERE os.stall_id = ? AND os.status = 'completed' AND ${dateCondition}`,
      [stallId]
    );

    apiResponse.success(res, 'Seller report retrieved', {
      total_revenue: revenueRows[0].total_revenue || 0,
      total_orders: revenueRows[0].total_orders || 0,
      items_sold: itemRows[0].items_sold || 0,
      period: period || 'daily'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReport
};
