const express = require('express');
const router = express.Router();
const {
  getAllForecasts,
  getForecastByProduct,
  createForecast,
  deleteForecast
} = require('../controllers/forecastController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllForecasts);
router.get('/product/:productId', protect, getForecastByProduct);
router.post('/', protect, createForecast);
router.delete('/:id', protect, deleteForecast);

module.exports = router;