const express = require('express');
const router = express.Router();
const { getAllMovements, createMovement, deleteMovement } = require('../controllers/stockMovementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllMovements);
router.post('/', protect, createMovement);
router.delete('/:id', protect, deleteMovement);

module.exports = router;