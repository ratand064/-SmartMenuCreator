require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

//Route imports
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menuRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

//Connect Database
connectDB();

//Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API Routes
app.use('/api/auth', authRoutes); 
app.use('/api/menu', menuRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);

//Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'YumBlock API is running'
  });
});

//Handler (VERY USEFUL FOR DEBUG)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`
  });
});

// Export for Vercel serverless
module.exports = app;

// Start server for traditional hosting 
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}