const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['entree', 'sortie'], required: true },
  quantite: { type: Number, required: true },
  operateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referenceDocument: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);