const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const { protect } = require('./middleware/authMiddleware');

connectDB();

const app = express();

// CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'API PSM en marche 🚀',
    version: '1.0.0',
    status: 'ok'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/orders', purchaseOrderRoutes);

// AI Service routes
app.get('/api/ai/forecast/:productId', protect, async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5001/forecast/${req.params.productId}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'AI service indisponible' });
  }
});

app.post('/api/ai/forecast/all', protect, async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5001/forecast/all');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'AI service indisponible' });
  }
});

app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5001/health');
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', message: 'AI service hors ligne' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    status: 'error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server fel port ${PORT} 🚀`));