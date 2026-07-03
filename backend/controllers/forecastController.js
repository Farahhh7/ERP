const Forecast = require('../models/Forecast');
const Product = require('../models/Product');

// GET all forecasts
const getAllForecasts = async (req, res) => {
  try {
    const forecasts = await Forecast.find()
      .populate('product', 'nom sku quantite seuilCritique')
      .sort({ createdAt: -1 });
    res.status(200).json(forecasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET forecast by product
const getForecastByProduct = async (req, res) => {
  try {
    const forecast = await Forecast.findOne({ product: req.params.productId })
      .populate('product', 'nom sku quantite seuilCritique')
      .sort({ dateCalcul: -1 });
    if (!forecast) return res.status(404).json({ message: 'Aucune prévision pour ce produit' });
    res.status(200).json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create/update forecast (simulé — ki ywali Python, howa ybadel hetha)
const createForecast = async (req, res) => {
  try {
    const { product, j7, j30, j90, mape } = req.body;

    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ message: 'Produit non trouvé' });

    // Update si déjà existant, sinon créa
    const existing = await Forecast.findOne({ product });
    let forecast;
    if (existing) {
      forecast = await Forecast.findOneAndUpdate(
        { product },
        { j7, j30, j90, mape, dateCalcul: new Date() },
        { new: true }
      ).populate('product', 'nom sku');
    } else {
      forecast = await Forecast.create({ product, j7, j30, j90, mape });
      forecast = await forecast.populate('product', 'nom sku');
    }

    res.status(201).json(forecast);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE forecast
const deleteForecast = async (req, res) => {
  try {
    const forecast = await Forecast.findByIdAndDelete(req.params.id);
    if (!forecast) return res.status(404).json({ message: 'Prévision non trouvée' });
    res.status(200).json({ message: 'Prévision supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllForecasts, getForecastByProduct, createForecast, deleteForecast };