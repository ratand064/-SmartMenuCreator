const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

// GET cart - Fetch current cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne().populate('items.menuItem');
    
    if (!cart) {
      cart = new Cart({ items: [], totalPrice: 0 });
      await cart.save();
    }

    // Filter out items with deleted menuItems
    cart.items = cart.items.filter(item => item.menuItem !== null);

    console.log('Cart fetched:', cart._id);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get Cart Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// POST add to cart - Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    console.log('📦 Received request:', { menuItemId, quantity });

    // Validation
    if (!menuItemId) {
      console.log('Missing menuItemId');
      return res.status(400).json({
        success: false,
        message: 'Menu item ID is required'
      });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      console.log('MenuItem not found:', menuItemId);
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    console.log('MenuItem found:', menuItem.title);

    // Get or create cart
    let cart = await Cart.findOne();
    if (!cart) {
      console.log('Creating new cart...');
      cart = new Cart({ items: [], totalPrice: 0 });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      console.log('Updated quantity for existing item');
    } else {
      cart.items.push({
        menuItem: menuItemId,
        quantity: quantity
      });
      console.log('Added new item to cart');
    }

    // Populate menu items
    await cart.populate('items.menuItem');
    
    // Filter out items with deleted menuItems (null references)
    cart.items = cart.items.filter(item => item.menuItem !== null);
    
    // Calculate total price safely
    cart.totalPrice = cart.items.reduce((total, item) => {
      if (item.menuItem && item.menuItem.price) {
        return total + (item.menuItem.price * item.quantity);
      }
      return total;
    }, 0);

    await cart.save();

    console.log('Cart saved. Items:', cart.items.length, 'Total:', cart.totalPrice);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });

  } catch (error) {
    console.error('Add to Cart Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// DELETE remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    console.log('🗑️ Removing item:', menuItemId);

    let cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.menuItem.toString() !== menuItemId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Populate and calculate
    await cart.populate('items.menuItem');
    cart.items = cart.items.filter(item => item.menuItem !== null);
    
    cart.totalPrice = cart.items.reduce((total, item) => {
      if (item.menuItem && item.menuItem.price) {
        return total + (item.menuItem.price * item.quantity);
      }
      return total;
    }, 0);

    await cart.save();

    console.log('Item removed. Remaining items:', cart.items.length);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });

  } catch (error) {
    console.error('Remove Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};

// DELETE clear cart
exports.clearCart = async (req, res) => {
  try {
    console.log('🧹 Clearing cart...');

    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [], totalPrice: 0 });
    } else {
      cart.items = [];
      cart.totalPrice = 0;
    }

    await cart.save();

    console.log('Cart cleared');

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });

  } catch (error) {
    console.error('Clear Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};