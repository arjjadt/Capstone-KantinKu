const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

const addRating = async (req, res, next) => {
  try {
    const { order_split_id, is_anonymous, items } = req.body;
    // items: [{ menu_item_id, stars, comment }]

    if (!items || items.length === 0) {
      return apiResponse.error(res, 'No items to rate', 400);
    }

    // Verify if order belongs to user and is COMPLETED
    const [splits] = await db.query(
      `SELECT os.status FROM ORDER_SPLITS os 
       JOIN ORDERS o ON os.order_id = o.id 
       WHERE os.id = ? AND o.buyer_user_id = ?`,
      [order_split_id, req.user.id]
    );

    if (splits.length === 0) return apiResponse.error(res, 'Order split not found for this user', 404);
    if (splits[0].status !== 'completed') return apiResponse.error(res, 'You can only rate completed orders', 400);

    const insertValues = items.map(item => [
      uuidv4(), order_split_id, item.menu_item_id, item.stars, item.comment || null, is_anonymous || false
    ]);

    await db.query(
      'INSERT INTO RATINGS (id, order_split_id, menu_item_id, stars, comment, is_anonymous) VALUES ?',
      [insertValues]
    );

    apiResponse.success(res, 'Ratings submitted successfully', null, 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return apiResponse.error(res, 'You have already rated some of these items', 400);
    }
    next(error);
  }
};

const getStallRatings = async (req, res, next) => {
  try {
    const { stallId } = req.params;

    const [ratings] = await db.query(
      `SELECT r.*, 
       IF(r.is_anonymous, CONCAT(LEFT(u.full_name, 1), '***', RIGHT(u.full_name, 1)), u.full_name) as user_name, 
       IF(r.is_anonymous, NULL, u.avatar_url) as user_avatar,
       m.name as menu_name
       FROM RATINGS r 
       JOIN ORDER_SPLITS os ON r.order_split_id = os.id
       JOIN ORDERS o ON os.order_id = o.id
       JOIN USERS u ON o.buyer_user_id = u.id 
       JOIN MENU_ITEMS m ON r.menu_item_id = m.id
       WHERE os.stall_id = ? 
       ORDER BY r.created_at DESC`,
      [stallId]
    );

    const [avgResult] = await db.query(
      'SELECT AVG(r.stars) as average, COUNT(r.id) as count FROM RATINGS r JOIN ORDER_SPLITS os ON r.order_split_id = os.id WHERE os.stall_id = ?',
      [stallId]
    );

    apiResponse.success(res, 'Ratings retrieved', {
      average: avgResult[0].average || 0,
      count: avgResult[0].count,
      ratings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRating,
  getStallRatings
};
