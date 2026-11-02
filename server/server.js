require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const carDetailsRoutes = require('./routes/carDetailsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cars', carDetailsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<user>')) {
  console.warn('⚠️ Warning: MONGODB_URI is not configured yet in server/.env');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

app.listen(PORT, () => {
  console.log(`🚀 Car Details Express Server running on http://localhost:${PORT}`);
});
