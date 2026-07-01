const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  j7: { type: Number },
  j30: { type: Number },
  j90: { type: Number },
  mape: { type: Number }, // score de fiabilité
  dateCalcul: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);