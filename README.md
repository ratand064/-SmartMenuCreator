# 🍽️ YumBlock - AI-Powered Smart Menu Creator

> **Submission for YumBlock Full Stack Developer Challenge**
> 
> *Transforming the way restaurants create and share their menus using cutting-edge AI technology*

---

## 🎯 Challenge Overview

YumBlock challenged developers to build a revolutionary menu management system where merchants can "talk items into existence" using AI. This project delivers a complete full-stack solution with intelligent text processing, real-time cart management, and seamless WhatsApp integration.

---

## ✨ Key Features Implemented

### 🤖 **AI-Powered Menu Creation**
- **Smart Text Extraction**: Type natural language like *"Spicy chicken curry with steamed rice for 12"* and watch AI generate professional menu items
- **Groq AI Integration**: Lightning-fast LLM processing with intelligent spell correction and price inference
- **Dual AI Models**: Primary Groq API with smart fallback system for 100% uptime
- **Auto-categorization**: AI automatically assigns appropriate categories (Appetizer, Main Course, Dessert, etc.)
- **Voice Input**: Tap the microphone and speak your menu item naturally - *"Butter chicken with naan, price fifteen dollars"* - AI handles the rest with real-time speech-to-text conversion

### 🎨 **Advanced Image Handling**
- **AI Image Generation**: Pollinations.ai generates unique, appetizing food images for every dish
- **Random Seed Technology**: Ensures each generated image is unique
- **Device Camera Integration**: Capture real photos using Capacitor Camera API
- **Gallery Upload**: Choose existing photos from device storage
- **Flexible Options**: Switch between AI-generated and real photos seamlessly

### 🛒 **Complete E-Commerce System**
- **Real-time Cart Management**: Add, update, and remove items with instant feedback
- **MongoDB Backend**: Robust data persistence with Mongoose ODM
- **Cart Synchronization**: Cart state maintained across sessions
- **Price Calculations**: Automatic subtotal, tax, and delivery fee computation

### 📱 **WhatsApp Business Integration**
- **One-Click Sharing**: Share individual items or entire cart via WhatsApp
- **Rich Message Format**: Professional product descriptions with images and pricing
- **Deep Linking**: Direct links to product pages for easy ordering

### 🔐 **Dual-Mode Authentication System**
- **Merchant Portal**: Protected dashboard for menu management
- **Public View**: Open access for customers to browse and order
- **JWT Authentication**: Secure token-based auth with role-based access control
- **Session Management**: Persistent login with secure token storage

### 📱 **Mobile-First Design**
- **Ionic Framework**: Native-like experience on iOS, Android, and web
- **Responsive UI**: Adapts perfectly to all screen sizes
- **Premium Dark Theme**: Modern, eye-friendly dark mode interface
- **Smooth Animations**: Fluid transitions and micro-interactions

---

## 🏗️ Technical Architecture

### **Frontend (Ionic + Angular)**
```
src/
├── app/
│   ├── home/                    # Landing page with dual portals
│   ├── pages/
│   │   ├── menu/                # Public menu browsing
│   │   ├── cart/                # Shopping cart management
│   │   ├── creator/             # AI-powered item creation
│   │   └── item-detail/         # Product detail view
│   ├── login/                   # Merchant authentication
│   └── services/
│       ├── api.service.ts       # HTTP client + API wrapper
│       ├── cart.service.ts      # Cart state management
│       ├── share.service.ts     # WhatsApp integration
│       └── auth.interceptor.ts  # JWT token handling
```

### **Backend (Node.js + Express + MongoDB)**
```
backend/
├── config/
│   └── database.js              # MongoDB connection
├── controllers/
│   ├── authController.js        # Login + JWT generation
│   ├── menuController.js        # CRUD operations
│   ├── cartController.js        # Cart logic
│   └── aiController.js          # AI extraction endpoint
├── middleware/
│   └── auth.js                  # JWT verification + role check
├── models/
│   ├── MenuItem.js              # Menu item schema
│   ├── Cart.js                  # Cart schema
│   └── User.js                  # User schema
├── routes/
│   ├── auth.routes.js
│   ├── menuRoutes.js
│   ├── cartRoutes.js
│   └── aiRoutes.js
├── utils/
│   └── aiService.js             # Groq AI + fallback logic
└── server.js                    # Express app entry
```

---

## 🚀 Setup & Installation

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
MongoDB (local or Atlas)
Groq API Key (free tier available)
```

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ratand064/-SmartMenuCreator.git
cd -SmartMenuCreator
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_super_secret_key_here
EOF

# Start backend server
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install

# Update API URL in environment.ts
# src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

# Start Ionic dev server
ionic serve
```

### 4️⃣ Access Application
- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

---

## 🎮 How to Use

### **For Merchants (Create Mode)**

1. **Login**
   - Navigate to Merchant Portal
   - Demo credentials: `merchant@yumblock.com` / `merchant123`

2. **Create Items with AI**
   ```
   Example inputs:
   - "Paneer tikka 180"
   - "Chicken biryani with raita for 250"
   - "Gulab jamun dessert Rs. 80"
   ```
   - AI extracts: Title, Description, Price, Category
   - Generate AI image or capture photo
   - Save to database

3. **Manage Menu**
   - View all created items
   - Edit existing items
   - Delete items
   - Share via WhatsApp

### **For Customers (Public View)**

1. **Browse Menu**
   - View all available dishes
   - Search by name/category
   - Filter and sort options

2. **Add to Cart**
   - Click "Add" button
   - Adjust quantities
   - View cart summary

3. **Checkout**
   - Review order
   - Share cart via WhatsApp
   - Complete purchase

---

## 🎨 Design Highlights

### **Premium Dark Theme**
- Modern, eye-friendly color scheme
- Smooth gradients and shadows
- High contrast for accessibility

### **Micro-Interactions**
- Loading skeletons
- Bounce animations
- Toast notifications
- Smooth page transitions

### **Responsive Grid**
- Adapts to mobile, tablet, desktop
- Touch-optimized controls
- Native-like scrolling

---

## 🧠 AI Implementation Details

### **Primary System: Groq AI**
```javascript
// Groq Llama-3.3-70B model
// - 90-day free tier
// - Ultra-fast responses
// - Advanced spell correction
// - Context-aware extraction
```

### **Fallback System**
```javascript
// Smart regex-based extraction
// - Price detection with multiple formats
// - Dish name normalization
// - Category inference
// - Default descriptions
```

### **Image Generation**
```javascript
// Pollinations.ai
// - Unique random seeds
// - High-quality 4K images
// - No rate limits
// - Instant generation
```

---

## 🏆 Why This Solution Stands Out

### ✅ **Complete Feature Implementation**
- ✓ AI text processing with Groq
- ✓ MongoDB integration
- ✓ Full cart system
- ✓ WhatsApp sharing
- ✓ Camera + AI image options
- ✓ JWT authentication
- ✓ Ionic mobile app

### ✅ **Production-Ready Code**
- Clean architecture with separation of concerns
- Error handling and validation at every layer
- Secure authentication with JWT
- Optimized API calls with caching
- Mobile-responsive design

### ✅ **Extra Features**
- Dual-mode interface (Merchant + Public)
- Real-time cart synchronization
- Search and filter functionality
- Loading states and skeletons
- Toast notifications
- Smart fallback systems

### ✅ **Best Practices**
- TypeScript for type safety
- Modular component design
- RESTful API architecture
- MongoDB indexing
- Environment variables
- Git best practices

---

## 📊 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Ionic 7, Angular 17, TypeScript, SCSS |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **AI Services** | Groq AI (Llama 3.3), Pollinations.ai |
| **Authentication** | JWT, bcryptjs |
| **Mobile** | Capacitor, Camera API |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Live Demo

- **Frontend**: [aimenucreator.vercel.app](https://aimenucreator.vercel.app)
- **Backend**: [yumblock-backend.onrender.com](https://yumblock-backend.onrender.com)
- **GitHub**: [github.com/ratand064/-SmartMenuCreator](https://github.com/ratand064/-SmartMenuCreator.git)

---

## 📝 Demo Credentials

### Merchant Account
```
Email: merchant@yumblock.com
Password: merchant123
```

### Customer Account
```
Email: customer@test.com
Password: customer123
```

---

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Groq API has 90-day free tier limit (fallback system active)
- Cart persistence uses single global cart (multi-user support planned)
- WhatsApp sharing opens web.whatsapp.com (native app integration planned)

### Planned Features
- 📊 Analytics dashboard
- 🔔 Push notifications
- 💳 Payment gateway integration
- 🌐 Multi-language support
- 📱 Native mobile apps (iOS/Android)

---

## 📄 License

MIT License

Copyright (c) 2025 Ratan.d


---

## 🙏 Acknowledgments

- **Groq** for providing free AI API access
- **Pollinations.ai** for image generation services
- **MongoDB Atlas** for cloud database hosting
- **Ionic Framework** for the amazing mobile UI toolkit

---

<div align="center">

### ⭐ If you find this project impressive, please star the repository!

**Crafted with ❤️ by Ratan.D for YumBlock Coding Challenge**

*"Talk it into existence, share it instantly"*

</div>

---

## 📋 Submission Checklist

- [x] AI text processing implemented
- [x] MongoDB integration complete
- [x] Cart system functional
- [x] WhatsApp sharing working
- [x] AI image generation
- [x] Camera photo capture
- [x] JWT authentication
- [x] Mobile responsive UI
- [x] Clean code & documentation
- [x] Live demo deployed
- [x] GitHub repository public
- [x] README comprehensive

**Status**: ✅ **READY FOR SUBMISSION**