import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  contact: { type: String, default: '' },
  telephone: { type: String, required: true },
  email: { type: String, default: '' },
  adresse: { type: String, default: '' },
  delaiLivraison: { type: Number, required: true },
  conditions: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);