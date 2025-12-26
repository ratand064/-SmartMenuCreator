const express = require('express');
const router = express.Router();
const { extractFromText } = require('../controllers/aiController');

// Extract menu details
router.post('/extract', extractFromText);

// Generate AI image
// router.post('/generate-image', async (req, res) => {
//   try {
//     const { dishName } = req.body;
    
//     if (!dishName) {
//       return res.status(400).json({
//         success: false,
//         error: 'Dish name required'
//       });
//     }
//     const imageUrl = await generateFoodImage(dishName);
    
//     res.json({
//       success: true,
//       imageUrl
//     });
    
//   } catch (error) {
//     console.error('Image generation error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to generate image'
//     });
//   }
// });

module.exports = router;