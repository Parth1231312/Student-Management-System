const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Restrict CORS to same origin in production; open for local dev
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limit login endpoint — max 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/students/auth/login', loginLimiter);

app.use('/api/students', studentRoutes);
app.use('/api/announcements', announcementRoutes);

// Auth shortcut route
app.post('/api/auth/login', loginLimiter, (req, res, next) => {
  req.url = '/auth/login';
  studentRoutes(req, res, next);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://StudentDB:<db_password>@ac-3jsvewe-shard-00-00.wdbrqgq.mongodb.net:27017,ac-3jsvewe-shard-00-01.wdbrqgq.mongodb.net:27017,ac-3jsvewe-shard-00-02.wdbrqgq.mongodb.net:27017/?ssl=true&replicaSet=atlas-e4geaq-shard-0&authSource=admin&appName=Cluster0';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (no DB)`));
  });

module.exports = app;
