const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  lignesCommande: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantite: Number,
      prixUnitaire: Number,
    },
  ],
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'livree', 'annulee'],
    default: 'en_attente',
  },
  genereAutomatiquement: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);