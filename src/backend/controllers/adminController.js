const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM USERS');
    const [stallRows] = await db.query('SELECT COUNT(*) as count FROM STALLS WHERE status = "active"');
    const [txRows] = await db.query('SELECT SUM(subtotal) as total FROM ORDER_SPLITS WHERE status = "COMPLETED"');

    apiResponse.success(res, 'Admin stats retrieved', {
      total_users: userRows[0].count,
      active_stalls: stallRows[0].count,
      total_transactions: txRows[0].total || 0
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT id, username, full_name, email, role, created_at FROM USERS');
    apiResponse.success(res, 'Users retrieved', users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return apiResponse.error(res, 'Invalid role', 400);
    }
    
    await connection.query('UPDATE USERS SET role = ? WHERE id = ?', [role, id]);
    
    if (role === 'seller') {
      await connection.query('INSERT IGNORE INTO SELLERS (user_id) VALUES (?)', [id]);
    } else if (role === 'admin') {
      await connection.query('INSERT IGNORE INTO ADMINS (user_id) VALUES (?)', [id]);
    }
    
    await connection.commit();
    apiResponse.success(res, 'User role updated');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getUmkms = async (req, res, next) => {
  try {
    const [umkms] = await db.query('SELECT * FROM UMKM_LOCATIONS');
    apiResponse.success(res, 'UMKMs retrieved', umkms);
  } catch (error) {
    next(error);
  }
};

const editUmkm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, city_region, full_address, status } = req.body;
    let photo_url = req.body.photo_url;

    if (req.file) {
      photo_url = `/uploads/umkm/${req.file.filename}`;
    }
    
    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (city_region) { updates.push('city_region = ?'); values.push(city_region); }
    if (full_address !== undefined) { updates.push('full_address = ?'); values.push(full_address); }
    if (status) { updates.push('status = ?'); values.push(status); }
    if (photo_url) { updates.push('photo_url = ?'); values.push(photo_url); }

    if (updates.length > 0) {
      values.push(id);
      await db.query(`UPDATE UMKM_LOCATIONS SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    apiResponse.success(res, 'UMKM updated');
  } catch (error) {
    next(error);
  }
};

const deleteUmkm = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM UMKM_LOCATIONS WHERE id = ?', [id]);
    apiResponse.success(res, 'UMKM deleted');
  } catch (error) {
    next(error);
  }
};

const getStalls = async (req, res, next) => {
  try {
    const [stalls] = await db.query('SELECT * FROM STALLS');
    apiResponse.success(res, 'Stalls retrieved', stalls);
  } catch (error) {
    next(error);
  }
};

const deleteStall = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM STALLS WHERE id = ?', [id]);
    apiResponse.success(res, 'Stall deleted');
  } catch (error) {
    next(error);
  }
};

const getUmkmApps = async (req, res, next) => {
  try {
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE type = "umkm"');
    apiResponse.success(res, 'UMKM applications retrieved', apps);
  } catch (error) {
    next(error);
  }
};

const getUmkmAppById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE id = ? AND type = "umkm"', [id]);
    if (apps.length === 0) return apiResponse.error(res, 'Application not found', 404);
    apiResponse.success(res, 'Application retrieved', apps[0]);
  } catch (error) {
    next(error);
  }
};

const reviewUmkmApp = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, admin_notes } = req.body; // 'approved', 'rejected'

    const [apps] = await connection.query('SELECT * FROM APPLICATIONS WHERE id = ? AND type = "umkm"', [id]);
    if (apps.length === 0) throw new Error('Application not found');
    
    const app = apps[0];
    const newStatus = status.toLowerCase();

    await connection.query(
      'UPDATE APPLICATIONS SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [newStatus, admin_notes, req.user.id, id]
    );

    if (newStatus === 'approved') {
      const { v4: uuidv4 } = require('uuid');
      await connection.query(
        'INSERT INTO UMKM_LOCATIONS (id, name, description, city_region, full_address, status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [uuidv4(), app.proposed_name, app.description, app.city_region, app.full_address, 'approved', req.user.id]
      );
    }

    await connection.commit();
    apiResponse.success(res, 'UMKM application reviewed successfully');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getStallApps = async (req, res, next) => {
  try {
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE type = "stall"');
    apiResponse.success(res, 'Stall applications retrieved', apps);
  } catch (error) {
    next(error);
  }
};

const getStallAppById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE id = ? AND type = "stall"', [id]);
    if (apps.length === 0) return apiResponse.error(res, 'Application not found', 404);
    apiResponse.success(res, 'Application retrieved', apps[0]);
  } catch (error) {
    next(error);
  }
};

const reviewStallApp = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, admin_notes } = req.body; // 'approved', 'rejected'

    const [apps] = await connection.query('SELECT * FROM APPLICATIONS WHERE id = ? AND type = "stall"', [id]);
    if (apps.length === 0) throw new Error('Application not found');
    
    const app = apps[0];
    const newStatus = status.toLowerCase();

    await connection.query(
      'UPDATE APPLICATIONS SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [newStatus, admin_notes, req.user.id, id]
    );

    if (newStatus === 'approved') {
      const { v4: uuidv4 } = require('uuid');

      // Upgrade user role to seller
      await connection.query('UPDATE USERS SET role = "seller" WHERE id = ? AND role = "buyer"', [app.user_id]);
      await connection.query('INSERT IGNORE INTO SELLERS (user_id) VALUES (?)', [app.user_id]);

      await connection.query(
        'INSERT INTO STALLS (id, owner_id, umkm_location_id, name, whatsapp_number, description, status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [uuidv4(), app.user_id, app.umkm_location_id, app.proposed_name, app.whatsapp_number, app.description, 'approved', req.user.id]
      );
      
    }

    await connection.commit();
    apiResponse.success(res, 'Stall application reviewed successfully');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM RATINGS WHERE id = ?', [id]);
    apiResponse.success(res, 'Rating deleted');
  } catch (error) {
    next(error);
  }
};

const getMetrics = async (req, res, next) => {
  try {
    const { period } = req.query; // daily, weekly, monthly
    
    let dateFilter = '';
    if (period === 'daily') dateFilter = 'AND DATE(os.created_at) = CURDATE()';
    else if (period === 'weekly') dateFilter = 'AND os.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    else if (period === 'monthly') dateFilter = 'AND os.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';

    // Total orders + completed + cancelled
    const [totalOrders] = await db.query(`SELECT COUNT(*) as total FROM ORDER_SPLITS os WHERE 1=1 ${dateFilter}`);
    const [completedOrders] = await db.query(`SELECT COUNT(*) as total FROM ORDER_SPLITS os WHERE status = 'completed' ${dateFilter}`);
    const [cancelledOrders] = await db.query(`SELECT COUNT(*) as total FROM ORDER_SPLITS os WHERE status = 'cancelled' ${dateFilter}`);
    const [totalRevenue] = await db.query(`SELECT COALESCE(SUM(subtotal), 0) as total FROM ORDER_SPLITS os WHERE status = 'completed' ${dateFilter}`);

    // Active UMKM count
    const [activeUmkm] = await db.query('SELECT COUNT(*) as total FROM UMKM_LOCATIONS WHERE status = "approved"');
    
    // Pending applications
    const [pendingUmkmApps] = await db.query('SELECT COUNT(*) as total FROM APPLICATIONS WHERE type = "umkm" AND status = "pending"');
    const [pendingStallApps] = await db.query('SELECT COUNT(*) as total FROM APPLICATIONS WHERE type = "stall" AND status = "pending"');

    // Calculate error rate (cancelled / total)
    const total = totalOrders[0].total || 1;
    const errorRate = ((cancelledOrders[0].total / total) * 100).toFixed(1);

    // Recent orders for activity
    const [recentOrders] = await db.query(
      `SELECT os.id, os.queue_number, os.status, os.created_at, s.name as stall_name
       FROM ORDER_SPLITS os JOIN STALLS s ON os.stall_id = s.id
       ORDER BY os.created_at DESC LIMIT 10`
    );

    apiResponse.success(res, 'Metrics retrieved', {
      total_orders: totalOrders[0].total,
      completed_orders: completedOrders[0].total,
      cancelled_orders: cancelledOrders[0].total,
      total_revenue: totalRevenue[0].total,
      active_umkm: activeUmkm[0].total,
      pending_umkm_applications: pendingUmkmApps[0].total,
      pending_stall_applications: pendingStallApps[0].total,
      error_rate: parseFloat(errorRate),
      recent_orders: recentOrders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats, getUsers, updateUserRole,
  getUmkms, editUmkm, deleteUmkm,
  getStalls, deleteStall,
  getUmkmApps, getUmkmAppById, reviewUmkmApp,
  getStallApps, getStallAppById, reviewStallApp,
  deleteRating, getMetrics
};

