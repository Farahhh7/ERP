const express = require('express');
const router = express.Router();
const {
  getAllOrders, getOrderById,
  createOrder, updateOrderStatus, deleteOrder
} = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id/statut', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;