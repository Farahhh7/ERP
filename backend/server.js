const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server fel port ${PORT}`));