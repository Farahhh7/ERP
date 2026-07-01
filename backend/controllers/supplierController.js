import Supplier from '../models/Supplier.js';

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { nom, telephone, delaiLivraison } = req.body;
    if (!nom || !telephone || delaiLivraison === undefined) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Fournisseur introuvable' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Fournisseur introuvable' });
    res.json({ message: 'Fournisseur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};