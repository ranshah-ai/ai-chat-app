# 🚀 AI Chat App - Backend

A Node.js + Express backend server for the Real-Time AI Chat Application. Provides API endpoints, Socket.IO real-time communication, and Google Gemini AI integration.

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Google Generative AI** - AI-powered chat responses
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
ai-chat-backend/
├── index.js              # Main server file
├── db.js                 # Database connection configuration
├── models/               # MongoDB data models
│   ├── Message.js        # Message schema
│   └── User.js           # User schema (if applicable)
├── routes/               # API route handlers
├── middleware/           # Custom middleware functions
├── .env                  # Environment variables (create this)
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ai-chat-app
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chat-app

# Google Gemini AI
GOOGLE_API_KEY=your_google_generative_ai_api_key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Chat Messages

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/messages` | Fetch chat history | `limit`, `offset` |
| `POST` | `/api/messages` | Send new message | `message`, `userId` |
| `DELETE` | `/api/messages/:id` | Delete message | `id` |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |

### Example API Usage

**Send a message:**
```javascript
POST /api/messages
Content-Type: application/json

{
  "message": "Hello AI!",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "message_id",
    "message": "Hello AI!",
    "response": "Hello! How can I help you today?",
    "userId": "user123",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `sendMessage` | Send message to AI | `{ message: string, userId: string }` |
| `join` | Join chat room | `{ userId: string }` |
| `disconnect` | User disconnection | - |

### Server → Client Events  

| Event | Description | Payload |
|-------|-------------|---------|
| `messageReceived` | New message received | `{ message: object }` |
| `aiResponse` | AI response ready | `{ response: string, messageId: string }` |
| `userJoined` | User joined chat | `{ userId: string }` |
| `error` | Error occurred | `{ error: string }` |

## 🗄️ Database Models

### Message Schema

```javascript
{
  _id: ObjectId,
  message: String,           // User message
  response: String,          // AI response
  userId: String,            // User identifier
  timestamp: Date,           // Message timestamp
  aiModel: String,           // AI model used
  isError: Boolean          // Error flag
}
```

## 🔧 Configuration Options

### Server Configuration

```javascript
// index.js
const config = {
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mongoUri: process.env.MONGO_URI,
  googleApiKey: process.env.GOOGLE_API_KEY
};
```

### Google Gemini AI Configuration

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chat-app
GOOGLE_API_KEY=your_production_api_key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms

#### Render
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

#### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway add
railway deploy
```

#### Heroku
```bash
heroku create your-app-name
heroku config:set MONGO_URI=your_mongo_uri
heroku config:set GOOGLE_API_KEY=your_api_key
git push heroku main
```

## 🔒 Security Features

- **CORS Protection** - Configured for specific origins
- **Environment Variables** - Sensitive data stored securely
- **Input Validation** - Sanitized user inputs
- **Rate Limiting** - Prevents API abuse (implement if needed)
- **Error Handling** - Proper error responses without sensitive info

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
Error: MongoNetworkError: failed to connect to server
```
- Check if MongoDB is running locally
- Verify connection string format
- Ensure network access for MongoDB Atlas

**Google API Error:**
```bash
Error: API key not valid
```
- Verify your Google API key
- Enable Generative AI API in Google Cloud Console
- Check API quotas and billing

**Socket.IO Connection Issues:**
```bash
Error: Socket.IO connection failed
```
- Check CORS configuration
- Verify frontend is connecting to correct port
- Ensure server is running

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* npm run dev
```

## 📊 Performance Optimization

- **Database Indexing** - Add indexes for frequently queried fields
- **Connection Pooling** - MongoDB connection pooling enabled
- **Caching** - Implement Redis for session storage (optional)
- **Compression** - Enable gzip compression for responses

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "API tests"
```

## 📋 Scripts

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Backend Server for AI Chat App**  
Built with ❤️ using Node.js and Express