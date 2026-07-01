const express = require('express');
const router = express.Router();
const {
  getAllSuppliers, getSupplierById,
  createSupplier, updateSupplier, deleteSupplier
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, createSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

module.exports = router;