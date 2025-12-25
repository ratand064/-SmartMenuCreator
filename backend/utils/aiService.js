require('dotenv').config();
const Groq = require('groq-sdk');

/* ---------- HELPER FUNCTIONS ---------- */

function extractPriceFromText(text) {
  const patterns = [
    /(?:rs\.?|₹|inr)?\s*(\d{2,4})/i,
    /(\d{2,4})\s*(?:rs|rupees?|inr)?/i,
    /(?:for|price|cost)\s+(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseInt(match[1]);
      if (price >= 10 && price <= 9999) {
        return price;
      }
    }
  }
  return null;
}

function inferCategory(dish) {
  const d = dish.toLowerCase();
  
  if (/tikka|kebab|fry|manchurian|samosa|pakora|wings|cutlet/.test(d)) {
    return 'Appetizer';
  }
  if (/tea|coffee|lassi|juice|shake|smoothie|mojito/.test(d)) {
    return 'Beverage';
  }
  if (/gulab|kulfi|dessert|sweet|jalebi|kheer|rasmalai/.test(d)) {
    return 'Dessert';
  }
  if (/naan|roti|paratha|kulcha|bhatura/.test(d)) {
    return 'Breads';
  }
  if (/dosa|idli|upma|uttapam|vada/.test(d)) {
    return 'Breakfast';
  }
  
  return 'Main Course';
}

function cleanDescription(desc, title) {
  if (!desc || desc.length < 10) {
    return `Delicious ${title.toLowerCase()} prepared with authentic Indian spices and premium ingredients. A perfect blend of flavors that will tantalize your taste buds.`;
  }
  
  const cleaned = desc
    .replace(/\b\d+\b/g, '')
    .replace(/[₹$€£¥]/g, '')
    .replace(/\b(rs\.?|rupees?|price|cost|inr)\b/gi, '')
    .replace(/\bfor\s+\d+/gi, '')
    .trim();
  
  return cleaned.length >= 20 ? cleaned : `Delicious ${title.toLowerCase()} prepared with authentic Indian spices and premium ingredients.`;
}

function normalizeDishName(text) {
  return text
    .replace(/\d+/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'Special Dish';
}

/* ---------- FALLBACK SYSTEM (NO AI) ---------- */

function fallbackResponse(text) {
  try {
    const cleanText = text.trim();
    const price = extractPriceFromText(cleanText);
    
    if (!price) {
      return {
        success: false,
        error: 'Please include a price. Example: "Chicken Curry 200" or "Paneer Tikka Rs. 180"'
      };
    }

    const title = normalizeDishName(cleanText);
    const description = cleanDescription('', title);
    const category = inferCategory(title);

    console.log('Smart fallback extraction successful!');

    return {
      success: true,
      data: {
        title,
        description,
        price,
        category,
      },
      aiPowered: false,
      fallback: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Unable to process. Please use format: "Dish Name Price". Example: "Chicken Curry 200"'
    };
  }
}

/* ---------- GROQ AI EXTRACTION ---------- */

/**
 * Extract menu details using Groq AI
 * 
 * @param {string} userInput 
 * @returns {Promise<Object>}
 * 
 * NOTE: Groq API free tier valid for 90 days from account creation
 * After 90 days, fallback system will automatically activate
 */
async function extractMenuDetails(userInput) {
  try {
    if (!userInput || !userInput.trim()) {
      throw new Error('Please enter dish details');
    }

    const cleanInput = userInput.trim();

    // Check if Groq API key exists
    if (!process.env.GROQ_API_KEY) {
      console.log('⚠️ No Groq API key found, using smart fallback system');
      return fallbackResponse(cleanInput);
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `You are an expert Indian restaurant menu creator.

INPUT: "${cleanInput}"

Extract and enhance the dish details. Return ONLY valid JSON (no explanation, no markdown, no code blocks):

{
  "title": "Properly Capitalized Dish Name",
  "description": "Professional 2-3 sentence description without any price or numbers",
  "price": 200,
  "category": "Main Course"
}

RULES:
1. Fix ALL spelling mistakes aggressively
2. Generate engaging, appetizing description
3. NEVER include price, cost, or numbers in description
4. Infer realistic price if not mentioned (₹50-500)
5. Choose appropriate category

VALID CATEGORIES:
- Appetizer
- Main Course
- Dessert
- Beverage
- Breakfast
- Breads

EXAMPLES:
"chik cuy 150" → {"title":"Chicken Curry","description":"A rich and flavorful chicken curry made with aromatic spices and tender chicken pieces in a creamy tomato-based gravy.","price":150,"category":"Main Course"}

"paner tikka for 180" → {"title":"Paneer Tikka","description":"Marinated cottage cheese cubes grilled to perfection with bell peppers and onions, served with mint chutney.","price":180,"category":"Appetizer"}`;

    // Call Groq API (Free for 90 days from signup)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Latest free model
      temperature: 0.3,
      max_tokens: 512,
    });

    // Extract response
    const text = completion.choices[0]?.message?.content || '';
    
    if (!text) {
      console.warn('⚠️ No AI response, using fallback');
      return fallbackResponse(cleanInput);
    }

    // Clean and parse JSON
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.warn('⚠️ Invalid JSON from AI, using fallback');
      return fallbackResponse(cleanInput);
    }

    const extracted = JSON.parse(jsonMatch[0]);

    // Validate and enhance
    let title = extracted.title || normalizeDishName(cleanInput);
    let price = extractPriceFromText(cleanInput) || extracted.price;
    
    if (typeof price === 'string') {
      price = parseInt(price.replace(/[^\d]/g, ''));
    }
    
    if (!price || price < 10 || price > 9999) {
      price = 150;
    }

    const description = cleanDescription(extracted.description, title);
    const category = inferCategory(title);

    console.log('Groq AI extraction successful!');

    return {
      success: true,
      data: {
        title,
        description,
        price,
        category,
      },
      aiPowered: true,
    };

  } catch (error) {
    console.error('Groq AI failed:', error.message);
    console.log('⚠️ Using smart fallback system (AI error or 90-day limit reached)');
    return fallbackResponse(userInput);
  }
}

/* ---------- AI IMAGE GENERATION (FIXED) ---------- */

/**
 * @param {string} dishName - Name of the dish
 * @returns {string} Image URL
 */
// async function generateFoodImage(dishName) {
//   try {
//     // Clean dish name
//     const clean = dishName
//       .toLowerCase()
//       .replace(/\d+/g, '')
//       .replace(/[^\w\s]/g, ' ')
//       .trim();
    
//     // ADD RANDOM SEED for unique images every time
//     const randomSeed = Math.floor(Math.random() * 1000000);
//     const timestamp = Date.now();
    
//     // Create AI prompt for exact dish with variations
//     const styleVariations = [
//       'professional food photography',
//       'gourmet plating style',
//       'rustic presentation',
//       'modern fine dining',
//       'traditional indian style',
//       'instagram worthy presentation'
//     ];
    
//     const randomStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];
    
//     const prompt = `${randomStyle} of ${clean}, indian restaurant dish, appetizing presentation, high quality 4k, studio lighting, seed ${randomSeed}`;
//     const encoded = encodeURIComponent(prompt);
    
//     // Pollinations.ai with seed parameter for UNIQUE images
//     const aiImageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true&enhance=true&seed=${randomSeed}&timestamp=${timestamp}`;
    
//     console.log(`✨ AI Image Generated (Seed: ${randomSeed}):`, aiImageUrl);
//     return aiImageUrl;
    
//   } catch (error) {
//     console.error('Image generation error:', error);
//     // Fallback to default food image with random query
//     const random = Math.random().toString(36).substring(7);
//     return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=${random}`;
//   }
// }

/* ---------- WHATSAPP SHARE MESSAGE ---------- */

/**
 * Generate WhatsApp share message with menu item details
 * 
 * @param {Object} menuItem - Menu item object
 * @param {string} publicUrl - Public URL to order
 * @returns {string} WhatsApp share URL
 */
function generateWhatsAppMessage(menuItem, publicUrl) {
  const { title, description, price, category } = menuItem;
  
  const message = `*${title}*

${description}

Price: ₹${price}
Category: ${category}

🛒 Order Now: ${publicUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/* ---------- EXPORTS ---------- */

module.exports = {
  extractMenuDetails,
  generateFoodImage,
  generateWhatsAppMessage,
};