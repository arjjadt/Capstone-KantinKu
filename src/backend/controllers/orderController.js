const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');
const generateCode = require('../utils/generateCode');
const generateQueueNumber = require('../utils/generateQueueNumber');
const socketConfig = require('../config/socket');

const checkout = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { items, dining_option } = req.body; // items: [{ stall_id, menu_item_id, quantity, notes }]
    
    if (!items || items.length === 0) {
      return apiResponse.error(res, 'Cart is empty', 400);
    }

    if (!['dine_in', 'takeaway'].includes(dining_option)) {
      return apiResponse.error(res, 'Invalid dining option', 400);
    }

    const orderId = uuidv4();
    let grandTotal = 0;

    // Group items by stall
    const stallGroups = {};
    for (const item of items) {
      if (!stallGroups[item.stall_id]) stallGroups[item.stall_id] = [];
      stallGroups[item.stall_id].push(item);
    }

    // Prepare arrays for insertion
    const splits = [];
    const orderItems = [];

    for (const [stallId, stallItems] of Object.entries(stallGroups)) {
      const splitId = uuidv4();
      const queueNumber = await generateQueueNumber(stallId, connection);
      const verificationCode = generateCode();
      let subtotal = 0;

      for (const item of stallItems) {
        const [menus] = await connection.query('SELECT name, price FROM MENU_ITEMS WHERE id = ?', [item.menu_item_id]);
        if (menus.length === 0) throw new Error(`Menu item \${item.menu_item_id} not found`);
        
        const menu = menus[0];
        const itemTotal = parseFloat(menu.price) * item.quantity;
        subtotal += itemTotal;

        orderItems.push([
          uuidv4(), splitId, item.menu_item_id, menu.name, menu.price, item.quantity, item.notes || null
        ]);
      }

      grandTotal += subtotal;

      splits.push([
        splitId, orderId, stallId, queueNumber, verificationCode, dining_option, 'pending', subtotal
      ]);
    }

    // Insert Order
    await connection.query(
      'INSERT INTO ORDERS (id, buyer_user_id, total_price, status) VALUES (?, ?, ?, ?)',
      [orderId, req.user.id, grandTotal, 'pending']
    );

    // Insert Splits
    await connection.query(
      'INSERT INTO ORDER_SPLITS (id, order_id, stall_id, queue_number, verification_code, dining_option, status, subtotal) VALUES ?',
      [splits]
    );

    // Insert Items
    await connection.query(
      'INSERT INTO ORDER_ITEMS (id, order_split_id, menu_item_id, menu_name_snapshot, price_snapshot, quantity, notes) VALUES ?',
      [orderItems]
    );

    await connection.commit();

    // Emit socket events for sellers
    try {
      const io = socketConfig.getIo();
      for (const split of splits) {
        const stallId = split[2];
        const splitId = split[0];
        const queueNumber = split[3];
        const diningOption = split[5];
        
        const splitItems = orderItems.filter(i => i[1] === splitId).map(i => ({
           name: i[3], qty: i[5], notes: i[6]
        }));

        io.to(`stall_\${stallId}`).emit('seller:new_order', {
          splitId, queueNumber, diningOption, items: splitItems
        });
      }
    } catch (socketErr) {
      console.error('Socket error during checkout:', socketErr);
    }

    apiResponse.success(res, 'Order placed successfully', { orderId }, 201);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM ORDERS WHERE buyer_user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    apiResponse.success(res, 'Orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT * FROM ORDERS WHERE id = ? AND buyer_user_id = ?', [id, req.user.id]);
    
    if (orders.length === 0) return apiResponse.error(res, 'Order not found', 404);
    const order = orders[0];

    const [splits] = await db.query(
      `SELECT os.*, s.name as stall_name, s.photo_url as stall_photo,
       (SELECT COUNT(id) FROM RATINGS r WHERE r.order_split_id = os.id) as is_rated
       FROM ORDER_SPLITS os 
       JOIN STALLS s ON os.stall_id = s.id 
       WHERE os.order_id = ?`, 
      [id]
    );

    for (const split of splits) {
      const [items] = await db.query('SELECT * FROM ORDER_ITEMS WHERE order_split_id = ?', [split.id]);
      split.items = items;
    }

    order.splits = splits;
    apiResponse.success(res, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

const getOrderSplitById = async (req, res, next) => {
  try {
    const { splitId } = req.params;

    const [splits] = await db.query(
      `SELECT os.*, s.name as stall_name, s.photo_url as stall_photo, s.whatsapp_number as stall_whatsapp,
       (SELECT COUNT(id) FROM RATINGS r WHERE r.order_split_id = os.id) as is_rated
       FROM ORDER_SPLITS os 
       JOIN STALLS s ON os.stall_id = s.id 
       JOIN ORDERS o ON os.order_id = o.id
       WHERE os.id = ? AND o.buyer_user_id = ?`, 
      [splitId, req.user.id]
    );

    if (splits.length === 0) return apiResponse.error(res, 'Order split not found', 404);
    const split = splits[0];

    const [items] = await db.query('SELECT * FROM ORDER_ITEMS WHERE order_split_id = ?', [split.id]);
    split.items = items;

    apiResponse.success(res, 'Order split details retrieved', split);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  getOrderSplitById
};
