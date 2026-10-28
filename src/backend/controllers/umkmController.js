const db = require('../config/database');
const apiResponse = require('../utils/apiResponse');

const getAllUmkm = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    let query = `
      SELECT DISTINCT u.* 
      FROM UMKM_LOCATIONS u 
      LEFT JOIN STALLS s ON u.id = s.umkm_location_id AND s.status = "approved"
      WHERE u.status = "approved"
    `;
    const values = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR s.name LIKE ?)';
      values.push(`%${search}%`, `%${search}%`);
    }

    if (city) {
      query += ' AND u.city_region = ?';
      values.push(city);
    }

    const [umkms] = await db.query(query, values);
    apiResponse.success(res, 'UMKM Locations retrieved', umkms);
  } catch (error) {
    next(error);
  }
};

const getUmkmById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [umkms] = await db.query('SELECT * FROM UMKM_LOCATIONS WHERE id = ? AND status = "approved"', [id]);
    if (umkms.length === 0) {
      return apiResponse.error(res, 'UMKM not found', 404);
    }

    const umkm = umkms[0];

    const [stalls] = await db.query(
      `SELECT s.id, s.name, s.photo_url, s.description, 
       AVG(r.stars) as average_rating, COUNT(r.id) as rating_count
       FROM STALLS s
       LEFT JOIN ORDER_SPLITS os ON s.id = os.stall_id
       LEFT JOIN RATINGS r ON os.id = r.order_split_id
       WHERE s.umkm_location_id = ? AND s.status = "approved"
       GROUP BY s.id`,
      [id]
    );

    umkm.stalls = stalls;

    apiResponse.success(res, 'UMKM details retrieved', umkm);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUmkm,
  getUmkmById
};
