const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const socketConfig = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const umkmRoutes = require('./routes/umkmRoutes');
const stallRoutes = require('./routes/stallRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerQueueRoutes = require('./routes/sellerQueueRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const sellerReportRoutes = require('./routes/sellerReportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketConfig.init(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directories if they don't exist
const uploadDirs = ['avatars', 'menus', 'umkm', 'stalls'].map(dir => path.join(__dirname, 'uploads', dir));
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/stalls', stallRoutes); // Public stall routes
app.use('/api/seller/stall', stallRoutes); // Seller stall routes inside stallRoutes
app.use('/api/seller/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller/queue', sellerQueueRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/seller/report', sellerReportRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'KantinKu API is running' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
