const { extractMenuDetails } = require('../utils/aiService');

exports.extractFromText = async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide text input'
      });
    }

    const result = await extractMenuDetails(userInput);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};