const MenuItem = require('../models/MenuItem');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single menu item
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category } = req.body;

    // Validation
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, description, and price'
      });
    }

    const menuItem = await MenuItem.create({
      title,
      description,
      price,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      category: category || 'Main Course',
      merchantId: req.user.userId // From auth middleware
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// UPDATE MENU ITEM
exports.updateMenuItem = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category } = req.body;

    let item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (price) item.price = price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (category) item.category = category;

    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};