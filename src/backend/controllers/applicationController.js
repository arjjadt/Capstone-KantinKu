const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

const applyUmkm = async (req, res, next) => {
  try {
    const { proposed_name, description, city_region, full_address } = req.body;
    let document_url = null;

    if (req.file) {
      document_url = `/uploads/umkm/${req.file.filename}`;
    }

    const id = uuidv4();
    await db.query(
      'INSERT INTO APPLICATIONS (id, type, user_id, proposed_name, description, city_region, full_address, document_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, 'umkm', req.user.id, proposed_name, description, city_region, full_address, document_url, 'pending']
    );

    apiResponse.success(res, 'UMKM application submitted successfully', { id }, 201);
  } catch (error) {
    next(error);
  }
};

const getMyUmkmApplications = async (req, res, next) => {
  try {
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE type = "umkm" AND user_id = ? ORDER BY created_at DESC', [req.user.id]);
    apiResponse.success(res, 'UMKM applications retrieved', apps);
  } catch (error) {
    next(error);
  }
};

const applyStall = async (req, res, next) => {
  try {
    const { umkm_location_id, proposed_name, whatsapp_number, description } = req.body;

    const id = uuidv4();
    await db.query(
      'INSERT INTO APPLICATIONS (id, type, user_id, umkm_location_id, proposed_name, whatsapp_number, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, 'stall', req.user.id, umkm_location_id, proposed_name, whatsapp_number, description, 'pending']
    );

    apiResponse.success(res, 'Stall application submitted successfully', { id }, 201);
  } catch (error) {
    next(error);
  }
};

const getMyStallApplications = async (req, res, next) => {
  try {
    const [apps] = await db.query('SELECT * FROM APPLICATIONS WHERE type = "stall" AND user_id = ? ORDER BY created_at DESC', [req.user.id]);
    apiResponse.success(res, 'Stall applications retrieved', apps);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyUmkm,
  getMyUmkmApplications,
  applyStall,
  getMyStallApplications
};
