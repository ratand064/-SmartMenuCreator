const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');

const { protect, merchantOnly } = require('../middleware/auth');

// PUBLIC ROUTES
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);

// MERCHANT ONLY ROUTES
router.post('/', protect, merchantOnly, createMenuItem);
router.put('/:id', protect, merchantOnly, updateMenuItem); 
router.delete('/:id', protect, merchantOnly, deleteMenuItem);

module.exports = router;