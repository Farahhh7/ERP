const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nom: {
    type: String,
    required: true,
    trim: true,
  },
  categorie: {
    type: String,
    required: true,
  },
  quantite: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  seuilCritique: {
    type: Number,
    required: true,
    default: 10,
  },
  prix: {
    type: Number,
    required: true,
    min: 0,
  },
  historiquePrix: [
    {
      prix: Number,
      date: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true, // zid createdAt w updatedAt automatiquement
});

module.exports = mongoose.model('Product', productSchema);