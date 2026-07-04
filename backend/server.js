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
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API PSM en marche 🚀');
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/orders', purchaseOrderRoutes);

// ── AI Service routes ──────────────────────────────
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
// ──────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server fel port ${PORT}`));