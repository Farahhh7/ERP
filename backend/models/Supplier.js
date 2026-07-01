const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, default: '' },
  adresse: { type: String, default: '' },
  delaiLivraison: { type: Number, default: 7 },
  conditionsContractuelles: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);