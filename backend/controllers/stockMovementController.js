const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// GET all movements
const getAllMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate('product', 'nom sku')
      .populate('operateur', 'nom')
      .sort({ createdAt: -1 });
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create movement + update product quantity
const createMovement = async (req, res) => {
  try {
    const { product, type, quantite, referenceDocument } = req.body;
    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ message: 'Produit non trouvé' });

    if (type === 'sortie' && prod.quantite < quantite) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    if (type === 'entree') {
      prod.quantite += Number(quantite);
    } else {
      prod.quantite -= Number(quantite);
    }
    await prod.save();

    const movement = await StockMovement.create({
      product, type,
      quantite: Number(quantite),
      operateur: req.user._id,
      referenceDocument
    });

    const populated = await movement.populate('product', 'nom sku');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE movement
const deleteMovement = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Mouvement non trouvé' });
    await StockMovement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Mouvement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllMovements, createMovement, deleteMovement };