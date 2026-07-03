const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

const getAllOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier', 'nom email')
      .populate('lignesCommande.product', 'nom sku prix')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'nom email telephone')
      .populate('lignesCommande.product', 'nom sku prix');
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.create(req.body);
    const populated = await order.populate([
      { path: 'supplier', select: 'nom email' },
      { path: 'lignesCommande.product', select: 'nom sku prix' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).populate('supplier', 'nom email');
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.status(200).json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders, getOrderById,
  createOrder, updateOrderStatus, deleteOrder
};