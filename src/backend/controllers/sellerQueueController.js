const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const socketConfig = require('../config/socket');

const getActiveQueue = async (req, res, next) => {
  try {
    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [splits] = await db.query(
      `SELECT os.*, u.full_name as buyer_name 
       FROM ORDER_SPLITS os 
       JOIN ORDERS o ON os.order_id = o.id 
       JOIN USERS u ON o.buyer_user_id = u.id 
       WHERE os.stall_id = ? AND os.status IN ('pending', 'preparing', 'ready') 
       ORDER BY os.created_at ASC`,
      [stalls[0].id]
    );

    for (const split of splits) {
      const [items] = await db.query('SELECT * FROM ORDER_ITEMS WHERE order_split_id = ?', [split.id]);
      split.items = items;
    }

    apiResponse.success(res, 'Active queue retrieved', splits);
  } catch (error) {
    next(error);
  }
};

const getHistoryQueue = async (req, res, next) => {
  try {
    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [splits] = await db.query(
      `SELECT os.*, u.full_name as buyer_name 
       FROM ORDER_SPLITS os 
       JOIN ORDERS o ON os.order_id = o.id 
       JOIN USERS u ON o.buyer_user_id = u.id 
       WHERE os.stall_id = ? AND os.status IN ('completed', 'cancelled') 
       ORDER BY os.updated_at DESC`,
      [stalls[0].id]
    );

    for (const split of splits) {
      const [items] = await db.query('SELECT * FROM ORDER_ITEMS WHERE order_split_id = ?', [split.id]);
      split.items = items;
    }

    apiResponse.success(res, 'History queue retrieved', splits);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { splitId } = req.params;
    const { status } = req.body;

    if (!['preparing', 'ready', 'cancelled'].includes(status)) {
      return apiResponse.error(res, 'Invalid status', 400);
    }

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [splits] = await db.query('SELECT status FROM ORDER_SPLITS WHERE id = ? AND stall_id = ?', [splitId, stalls[0].id]);
    if (splits.length === 0) return apiResponse.error(res, 'Order split not found', 404);
    
    const currentStatus = splits[0].status;
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return apiResponse.error(res, 'Cannot update a completed or cancelled order', 400);
    }

    await db.query(
      'UPDATE ORDER_SPLITS SET status = ? WHERE id = ?',
      [status, splitId]
    );

    // Emit socket event to buyer
    try {
      const io = socketConfig.getIo();
      io.to(`order_\${splitId}`).emit('order:status_updated', {
        splitId, status, updatedAt: new Date()
      });
    } catch (err) {
      console.error('Socket error:', err);
    }

    apiResponse.success(res, 'Status updated successfully');
  } catch (error) {
    next(error);
  }
};

const verifyCode = async (req, res, next) => {
  try {
    const { splitId } = req.params;
    const { code } = req.body;

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [splits] = await db.query('SELECT verification_code, status FROM ORDER_SPLITS WHERE id = ? AND stall_id = ?', [splitId, stalls[0].id]);
    if (splits.length === 0) return apiResponse.error(res, 'Order split not found', 404);

    if (splits[0].status !== 'ready') {
      return apiResponse.error(res, 'Order is not ready for pickup', 400);
    }

    if (splits[0].verification_code !== code) {
      return apiResponse.error(res, 'Invalid verification code', 400);
    }

    await db.query(
      'UPDATE ORDER_SPLITS SET status = "completed" WHERE id = ?',
      [splitId]
    );

    // Emit socket
    try {
      const io = socketConfig.getIo();
      io.to(`order_\${splitId}`).emit('order:status_updated', {
        splitId, status: 'completed', updatedAt: new Date()
      });
    } catch (err) {
      console.error('Socket error:', err);
    }

    apiResponse.success(res, 'Code verified, order completed');
  } catch (error) {
    next(error);
  }
};

const getQueueDetail = async (req, res, next) => {
  try {
    const { splitId } = req.params;
    const [stalls] = await db.query('SELECT id, name FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [splits] = await db.query(
      `SELECT os.*, o.created_at as order_created_at 
       FROM ORDER_SPLITS os 
       JOIN ORDERS o ON os.order_id = o.id 
       WHERE os.id = ? AND os.stall_id = ?`,
      [splitId, stalls[0].id]
    );

    if (splits.length === 0) return apiResponse.error(res, 'Queue not found', 404);

    const split = splits[0];
    split.stall_name = stalls[0].name;

    const [items] = await db.query('SELECT * FROM ORDER_ITEMS WHERE order_split_id = ?', [split.id]);
    split.items = items;

    apiResponse.success(res, 'Queue detail retrieved', split);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveQueue,
  getHistoryQueue,
  updateStatus,
  verifyCode,
  getQueueDetail
};
