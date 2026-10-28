const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');

const getStallsByUmkm = async (req, res, next) => {
  try {
    const { umkmId } = req.params;
    const [stalls] = await db.query(
      'SELECT id, name, photo_url, description, is_open FROM STALLS WHERE umkm_location_id = ? AND status = "approved"',
      [umkmId]
    );
    apiResponse.success(res, 'Stalls retrieved', stalls);
  } catch (error) {
    next(error);
  }
};

const getStallById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [stalls] = await db.query('SELECT * FROM STALLS WHERE id = ? AND status = "approved"', [id]);
    
    if (stalls.length === 0) {
      return apiResponse.error(res, 'Stall not found', 404);
    }

    const stall = stalls[0];

    // Get menu for this stall
    const [menus] = await db.query(
      `SELECT m.*, AVG(r.stars) as average_rating, COUNT(r.id) as rating_count 
       FROM MENU_ITEMS m
       LEFT JOIN RATINGS r ON m.id = r.menu_item_id
       WHERE m.stall_id = ?
       GROUP BY m.id`, 
      [id]
    );
    stall.menu = menus;

    apiResponse.success(res, 'Stall details retrieved', stall);
  } catch (error) {
    next(error);
  }
};

const getMyStall = async (req, res, next) => {
  try {
    const [stalls] = await db.query('SELECT * FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) {
      return apiResponse.error(res, 'Stall not found for this user', 404);
    }
    apiResponse.success(res, 'Stall profile retrieved', stalls[0]);
  } catch (error) {
    next(error);
  }
};

const updateMyStall = async (req, res, next) => {
  try {
    const { name, description, whatsapp_number } = req.body;
    let photo_url = req.body.photo_url;

    if (req.file) {
      photo_url = `/uploads/stalls/${req.file.filename}`;
    }

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (whatsapp_number) { updates.push('whatsapp_number = ?'); values.push(whatsapp_number); }
    if (photo_url) { updates.push('photo_url = ?'); values.push(photo_url); }

    if (updates.length === 0) {
      return apiResponse.error(res, 'No data to update', 400);
    }

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) {
       return apiResponse.error(res, 'Stall not found', 404);
    }

    values.push(stalls[0].id);

    await db.query(`UPDATE STALLS SET ${updates.join(', ')} WHERE id = ?`, values);
    apiResponse.success(res, 'Stall updated successfully');
  } catch (error) {
    next(error);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { is_open } = req.body; // true or false

    const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [req.user.id]);
    if (stalls.length === 0) {
       return apiResponse.error(res, 'Stall not found', 404);
    }

    await db.query('UPDATE STALLS SET is_open = ? WHERE id = ?', [is_open ? 1 : 0, stalls[0].id]);
    apiResponse.success(res, 'Stall status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStallsByUmkm,
  getStallById,
  getMyStall,
  updateMyStall,
  toggleStatus
};
