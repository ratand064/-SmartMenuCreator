const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:menuItemId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;