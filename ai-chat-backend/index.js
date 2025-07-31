require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require('./db');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

connectDB();

// ✅ Enhanced Multi-API Manager with better error handling
class MultiAPIManager {
  constructor() {
    this.providers = [];
    this.currentIndex = 0;
    this.quotaTracker = new Map();
    
    this.initializeProviders();
  }
  
  initializeProviders() {
    // Gemini API Keys (you can add multiple)
    const geminiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);
    
    if (geminiKeys.length === 0) {
      console.error('❌ No Gemini API keys found in environment variables!');
      console.error('   Please add GEMINI_API_KEY to your .env file');
      return;
    }
    
    geminiKeys.forEach((key, index) => {
      try {
        this.providers.push({
          id: `gemini-${index}`,
          type: 'gemini',
          client: new GoogleGenerativeAI(key),
          dailyLimit: 50,
          currentCount: 0,
          lastReset: new Date().toDateString(),
          isActive: true,
          key: key.substring(0, 10) + '...' // For logging purposes
        });
      } catch (error) {
        console.error(`❌ Failed to initialize Gemini client ${index}:`, error.message);
      }
    });
    
    console.log(`✅ Initialized ${this.providers.length} API providers`);
    if (this.providers.length === 0) {
      console.error('❌ No providers initialized! AI responses will not work.');
    }
  }
  
  resetDailyQuotas() {
    const today = new Date().toDateString();
    this.providers.forEach(provider => {
      if (provider.lastReset !== today) {
        provider.currentCount = 0;
        provider.lastReset = today;
        provider.isActive = true;
        console.log(`🔄 Reset quota for ${provider.id}`);
      }
    });
  }
  
  getAvailableProvider() {
    this.resetDailyQuotas();
    
    if (this.providers.length === 0) {
      console.error('❌ No providers available');
      return null;
    }
    
    // Find a provider with available quota
    let attempts = 0;
    while (attempts < this.providers.length) {
      const provider = this.providers[this.currentIndex];
      
      if (provider.isActive && provider.currentCount < provider.dailyLimit) {
        console.log(`✅ Using provider ${provider.id} (${provider.currentCount}/${provider.dailyLimit})`);
        return provider;
      }
      
      // Move to next provider
      this.currentIndex = (this.currentIndex + 1) % this.providers.length;
      attempts++;
    }
    
    console.log('❌ All providers exhausted');
    return null;
  }
  
  async generateWithProvider(provider, text) {
    try {
      if (provider.type === 'gemini') {
        console.log(`🤖 Generating response with ${provider.id}...`);
        
        const model = provider.client.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
        
        // Enhanced prompt for better responses
        const enhancedPrompt = `You are a helpful AI assistant. Please provide a clear, informative, and well-structured response to the following message. Use proper formatting with bullet points and sections where appropriate:\n\n${text}`;
        
        const result = await model.generateContent(enhancedPrompt);
        
        if (!result || !result.response) {
          throw new Error('Empty response from Gemini API');
        }
        
        const response = await result.response;
        const responseText = response.text();
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty text response from Gemini API');
        }
        
        // Success! Increment counter
        provider.currentCount++;
        console.log(`✅ ${provider.id}: Response generated successfully (${provider.currentCount}/${provider.dailyLimit} used)`);
        
        return responseText;
      }
      
      // Add other provider types here
      throw new Error(`Unknown provider type: ${provider.type}`);
      
    } catch (error) {
      console.error(`❌ Error with ${provider.id}:`, error.message);
      
      // Handle specific error types
      if (error.status === 429 || error.message.includes('quota') || error.message.includes('limit')) {
        // Mark provider as exhausted
        provider.isActive = false;
        provider.currentCount = provider.dailyLimit;
        console.log(`❌ ${provider.id} quota exhausted - marking inactive`);
      } else if (error.status === 503 || error.message.includes('overloaded')) {
        console.log(`⚠️ ${provider.id} temporarily overloaded`);
      } else if (error.message.includes('API key')) {
        provider.isActive = false;
        console.log(`❌ ${provider.id} API key issue - marking inactive`);
      }
      
      throw error;
    }
  }
  
  async generateResponse(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty input text');
    }
    
    if (this.providers.length === 0) {
      throw new Error('NO_PROVIDERS_CONFIGURED');
    }
    
    const maxAttempts = this.providers.length;
    const errors = [];
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const provider = this.getAvailableProvider();
      
      if (!provider) {
        console.log('❌ No available providers');
        throw new Error('ALL_QUOTAS_EXHAUSTED');
      }
      
      try {
        console.log(`🔄 Attempt ${attempt + 1}/${maxAttempts} with ${provider.id}`);
        const response = await this.generateWithProvider(provider, text);
        
        console.log(`✅ Success with ${provider.id}`);
        return response;
        
      } catch (error) {
        errors.push(`${provider.id}: ${error.message}`);
        console.log(`❌ ${provider.id} failed: ${error.message}`);
        
        // Continue to next provider
        continue;
      }
    }
    
    console.error('❌ All providers failed:', errors);
    throw new Error(`ALL_PROVIDERS_FAILED: ${errors.join('; ')}`);
  }
  
  getStatus() {
    this.resetDailyQuotas();
    return {
      totalProviders: this.providers.length,
      activeProviders: this.providers.filter(p => p.isActive).length,
      totalQuota: this.providers.reduce((sum, p) => sum + p.dailyLimit, 0),
      usedQuota: this.providers.reduce((sum, p) => sum + p.currentCount, 0),
      providers: this.providers.map(p => ({
        id: p.id,
        type: p.type,
        active: p.isActive,
        quota: `${p.currentCount}/${p.dailyLimit}`,
        key: p.key
      }))
    };
  }
}

const apiManager = new MultiAPIManager();

// ✅ Enhanced fallback response system
const fallbackResponses = {
  'hi': 'Hello! How can I help you today?',
  'hello': 'Hi there! What would you like to know?',
  'hey': 'Hey! I\'m here to assist you.',
  'how are you': 'I\'m doing well, thank you for asking! How can I assist you?',
  'what can you do': 'I can help you with questions, provide information, assist with problem-solving, and have conversations on various topics. What would you like to explore?',
  'help': 'I\'m here to help! You can ask me questions about any topic, request explanations, get assistance with problems, or just have a friendly conversation.',
  'thank you': 'You\'re welcome! Is there anything else I can help you with?',
  'thanks': 'You\'re welcome! Feel free to ask me anything else.',
  'bye': 'Goodbye! Have a great day!',
  'goodbye': 'Take care! Feel free to come back anytime.',
};

function getFallbackResponse(input) {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for exact matches first
  if (fallbackResponses[normalizedInput]) {
    return fallbackResponses[normalizedInput];
  }
  
  // Check for partial matches
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (normalizedInput.includes(key)) {
      return response;
    }
  }
  
  // Generate contextual fallback based on input
  if (normalizedInput.includes('code') || normalizedInput.includes('programming')) {
    return "I can help with coding questions! While I'm currently running in basic mode, I can still provide guidance on programming concepts, help debug issues, and explain code. What specific coding topic can I assist you with?";
  }
  
  if (normalizedInput.includes('?')) {
    return `That's an interesting question! While I'm currently operating with limited AI capabilities, I'm still here to help. Could you provide more context about "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"? I'll do my best to assist you.`;
  }
  
  return `I understand you're asking about "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}". While I'm currently operating with limited AI capabilities, I'm still here to help! Could you tell me more about what you'd like to know?`;
}

// ✅ Enhanced Socket.IO handler
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);
  
  // Send current API status
  const status = apiManager.getStatus();
  socket.emit('apiStatus', status);
  console.log(`📊 Sent API status: ${status.activeProviders}/${status.totalProviders} providers active`);

  socket.on("userMessage", async (msg) => {
    console.log(`📨 Message from ${socket.id}:`, msg?.text?.substring(0, 100) + (msg?.text?.length > 100 ? '...' : ''));
    
    // Validate message
    if (!msg || !msg.text || typeof msg.text !== 'string' || msg.text.trim().length === 0) {
      console.log('❌ Invalid message format');
      socket.emit("aiMessage", {
        text: "I didn't receive your message properly. Could you please try again?",
        sender: "ai",
        timestamp: new Date(),
        source: "error"
      });
      return;
    }
    
    try {
      // Save user message
      const savedUserMsg = await Message.create(msg);
      console.log(`💾 User message saved: ${savedUserMsg._id}`);

      let aiText;
      let responseSource = 'unknown';
      
      try {
        console.log('🤖 Attempting AI response...');
        // Try all available API providers
        aiText = await apiManager.generateResponse(msg.text);
        responseSource = 'api';
        console.log('✅ AI response generated successfully');
        
      } catch (error) {
        console.log(`⚠️ AI generation failed (${error.message}), using fallback`);
        
        // Use enhanced fallback response
        aiText = getFallbackResponse(msg.text);
        responseSource = 'fallback';
      }

      const aiReply = {
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
        source: responseSource
      };

      // Save AI message
      try {
        const savedAiMsg = await Message.create(aiReply);
        console.log(`💾 AI message saved: ${savedAiMsg._id}`);
      } catch (dbError) {
        console.error('⚠️ Failed to save AI message to DB:', dbError.message);
        // Continue anyway - user still gets the response
      }

      // Send response to client
      socket.emit("aiMessage", aiReply);
      
      // Send updated API status
      socket.emit('apiStatus', apiManager.getStatus());
      
      console.log(`📤 Response sent (${responseSource}): ${aiText.substring(0, 50)}...`);
      
    } catch (error) {
      console.error("💥 Critical error in userMessage handler:", error);
      
      // Emergency fallback
      const errorReply = {
        text: "I apologize, but I'm experiencing some technical difficulties right now. I'm still here to help though! Could you please try asking your question again?",
        sender: "ai",
        timestamp: new Date(),
        source: "emergency"
      };

      socket.emit("aiMessage", errorReply);
      console.log(`📤 Emergency fallback sent`);
    }
  });

  socket.on("disconnect", () => {
    console.log("👤 User disconnected:", socket.id);
  });
});

// ✅ Enhanced admin endpoints
app.use(cors());
app.use(express.json());

app.get('/api-status', (req, res) => {
  const status = apiManager.getStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString(),
    healthy: status.activeProviders > 0
  });
});

app.get('/health', (req, res) => {
  const status = apiManager.getStatus();
  res.json({
    status: status.activeProviders > 0 ? 'healthy' : 'degraded',
    ...status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

// Test endpoint for debugging
app.post('/test-ai', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await apiManager.generateResponse(message);
    res.json({ 
      success: true,
      response,
      source: 'api',
      status: apiManager.getStatus()
    });
  } catch (error) {
    const fallback = getFallbackResponse(req.body.message || 'test');
    res.json({
      success: false,
      error: error.message,
      response: fallback,
      source: 'fallback',
      status: apiManager.getStatus()
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
  
  const status = apiManager.getStatus();
  console.log(`📊 API Status:`);
  console.log(`   Total Providers: ${status.totalProviders}`);
  console.log(`   Active Providers: ${status.activeProviders}`);
  console.log(`   Total Quota: ${status.usedQuota}/${status.totalQuota}`);
  
  if (status.totalProviders === 0) {
    console.error('❌ WARNING: No API providers configured!');
    console.error('   Add GEMINI_API_KEY to your .env file');
    console.error('   Example: GEMINI_API_KEY=your_api_key_here');
  } else if (status.activeProviders === 0) {
    console.error('❌ WARNING: No active API providers!');
    console.error('   Check your API keys and quotas');
  } else {
    console.log(`✅ Ready! Users will have ${status.totalQuota} requests per day`);
  }
});

// Export for testing
module.exports = { apiManager };