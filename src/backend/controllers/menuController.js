const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

const getMenuByStall = async (req, res, next) => {
  try {
    const { stallId } = req.params;
    const [menus] = await db.query(
      `SELECT m.*, AVG(r.stars) as average_rating, COUNT(r.id) as rating_count 
       FROM MENU_ITEMS m
       LEFT JOIN RATINGS r ON m.id = r.menu_item_id
       WHERE m.stall_id = ?
       GROUP BY m.id`, 
      [stallId]
    );
    apiResponse.success(res, 'Menus retrieved', menus);
  } catch (error) {
    next(error);
  }
};

const getMyMenu = async (req, res, next) => {
  try {
    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);
    
    const [menus] = await db.query(
      `SELECT m.*, AVG(r.stars) as average_rating, COUNT(r.id) as rating_count 
       FROM MENU_ITEMS m
       LEFT JOIN RATINGS r ON m.id = r.menu_item_id
       WHERE m.stall_id = ?
       GROUP BY m.id`, 
      [stalls[0].id]
    );
    apiResponse.success(res, 'Menus retrieved', menus);
  } catch (error) {
    next(error);
  }
};

const addMenu = async (req, res, next) => {
  try {
    const { name, price, availability, category } = req.body;
    let photo_url = null;

    if (req.file) {
      photo_url = `/uploads/menus/${req.file.filename}`;
    }

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const validAvailability = availability === 'unavailable' ? 'unavailable' : 'available';

    const id = uuidv4();
    await db.query(
      'INSERT INTO MENU_ITEMS (id, stall_id, name, photo_url, price, availability, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, stalls[0].id, name, photo_url, price, validAvailability, category || 'Food']
    );

    apiResponse.success(res, 'Menu added successfully', { id }, 201);
  } catch (error) {
    next(error);
  }
};

const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, availability, category } = req.body;
    let photo_url = req.body.photo_url;

    if (req.file) {
      photo_url = `/uploads/menus/${req.file.filename}`;
    }

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    // Verify ownership
    const [menus] = await db.query('SELECT id FROM MENU_ITEMS WHERE id = ? AND stall_id = ?', [id, stalls[0].id]);
    if (menus.length === 0) return apiResponse.error(res, 'Menu not found or not owned by you', 404);

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (price) { updates.push('price = ?'); values.push(price); }
    if (availability && ['available', 'unavailable'].includes(availability)) { updates.push('availability = ?'); values.push(availability); }
    if (category) { updates.push('category = ?'); values.push(category); }
    if (photo_url) { updates.push('photo_url = ?'); values.push(photo_url); }

    if (updates.length > 0) {
      values.push(id);
      await db.query(`UPDATE MENU_ITEMS SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    apiResponse.success(res, 'Menu updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [menus] = await db.query('SELECT id FROM MENU_ITEMS WHERE id = ? AND stall_id = ?', [id, stalls[0].id]);
    if (menus.length === 0) return apiResponse.error(res, 'Menu not found', 404);

    await db.query('DELETE FROM MENU_ITEMS WHERE id = ?', [id]);
    apiResponse.success(res, 'Menu deleted successfully');
  } catch (error) {
    next(error);
  }
};

const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body; // 'available' or 'unavailable'

    if (!['available', 'unavailable'].includes(availability)) {
      return apiResponse.error(res, 'Invalid availability status', 400);
    }

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) return apiResponse.error(res, 'Stall not found', 404);

    const [result] = await db.query(
      'UPDATE MENU_ITEMS SET availability = ? WHERE id = ? AND stall_id = ?',
      [availability, id, stalls[0].id]
    );

    if (result.affectedRows === 0) {
      return apiResponse.error(res, 'Menu not found or not owned by you', 404);
    }

    apiResponse.success(res, 'Menu availability updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuByStall,
  getMyMenu,
  addMenu,
  updateMenu,
  deleteMenu,
  toggleAvailability
};
