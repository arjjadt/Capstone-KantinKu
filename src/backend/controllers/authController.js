const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const apiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { username, full_name, email, password, phone_number } = req.body;

    // Check if username or email exists
    const [existingUsers] = await db.query(
      'SELECT id FROM USERS WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return apiResponse.error(res, 'Username or Email already exists', 400);
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    const role = 'buyer'; // default role

    await db.query(
      'INSERT INTO USERS (id, username, full_name, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, full_name, email, password_hash, phone_number || null, role]
    );

    apiResponse.success(res, 'Registration successful', { id, username, role }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query('SELECT * FROM USERS WHERE username = ?', [username]);
    if (users.length === 0) {
      return apiResponse.error(res, 'Invalid credentials', 401);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return apiResponse.error(res, 'Invalid credentials', 401);
    }

    // Check if seller has a stall
    let stallId = null;
    if (user.role === 'seller') {
      const [stalls] = await db.query('SELECT id FROM STALLS WHERE owner_id = ?', [user.id]);
      if (stalls.length > 0) {
        stallId = stalls[0].id;
      }
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      stallId: stallId
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    apiResponse.success(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  // Client-side will delete the token
  apiResponse.success(res, 'Logout successful');
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, full_name, email, phone_number, avatar_url, role FROM USERS WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return apiResponse.error(res, 'User not found', 404);
    }

    apiResponse.success(res, 'User profile retrieved', users[0]);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { full_name, phone_number } = req.body;
    let avatar_url = req.body.avatar_url; // Might be set if not uploading file

    if (req.file) {
      avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    const updates = [];
    const values = [];

    if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); values.push(phone_number); }
    if (avatar_url) { updates.push('avatar_url = ?'); values.push(avatar_url); }

    if (updates.length === 0) {
      return apiResponse.error(res, 'No data to update', 400);
    }

    values.push(req.user.id);

    await db.query(`UPDATE USERS SET ${updates.join(', ')} WHERE id = ?`, values);

    apiResponse.success(res, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;

    const [users] = await db.query('SELECT password_hash FROM USERS WHERE id = ?', [req.user.id]);
    const user = users[0];

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
      return apiResponse.error(res, 'Incorrect old password', 400);
    }

    const new_password_hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE USERS SET password_hash = ? WHERE id = ?', [new_password_hash, req.user.id]);

    apiResponse.success(res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  updatePassword
};
