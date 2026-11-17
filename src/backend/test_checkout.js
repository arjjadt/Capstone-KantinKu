require('dotenv').config();
const db = require('./config/database');
const jwt = require('jsonwebtoken');

async function testCheckout() {
  try {
    const [users] = await db.query('SELECT id, role, full_name FROM users WHERE role = "buyer" LIMIT 1');
    if (users.length === 0) return console.log("No buyer");
    const user = users[0];
    
    // We need a dummy menu item
    const [menus] = await db.query('SELECT id, stall_id FROM menu_items WHERE availability = "available" LIMIT 1');
    if (menus.length === 0) return console.log("No menu item");
    const menu = menus[0];

    const reqBody = {
      items: [
        { stall_id: menu.stall_id, menu_item_id: menu.id, quantity: 1, notes: "test notes" }
      ],
      dining_option: 'dine_in'
    };

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret_kantinku_jwt_key', { expiresIn: '1d' });

    // Mock Express Req/Res
    const req = {
      body: reqBody,
      user: { id: user.id }
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log("Response", this.statusCode, data);
        return this;
      }
    };

    const next = function(err) {
      console.error("Next called with Error:", err);
    };

    const orderController = require('./controllers/orderController');
    await orderController.checkout(req, res, next);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
testCheckout();
