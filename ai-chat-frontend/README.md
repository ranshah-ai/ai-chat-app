# 💬 AI Chat App - Frontend

A modern React frontend for the Real-Time AI Chat Application. Built with Vite, Tailwind CSS, and Socket.IO for a fast, responsive, and beautiful chat experience.

## 🛠️ Technology Stack

- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time bidirectional communication
- **Web Speech API** - Voice input functionality
- **React Icons** - Beautiful icon components
- **Framer Motion** - Smooth animations (if used)

## 📁 Project Structure

```
ai-chat-frontend/
├── public/                   # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── ChatBox.jsx       # Main chat interface
│   │   ├── MessageList.jsx   # Message display component
│   │   ├── MessageInput.jsx  # Input component
│   │   └── VoiceInput.jsx    # Voice recording component
│   ├── hooks/                # Custom React hooks
│   │   ├── useSocket.js      # Socket.IO connection hook
│   │   └── useVoice.js       # Voice input hook
│   ├── utils/                # Utility functions
│   │   ├── api.js            # API calls
│   │   └── constants.js      # App constants
│   ├── styles/               # CSS files
│   │   └── index.css         # Global styles with Tailwind
│   ├── App.jsx               # Main App component
│   └── main.jsx              # React entry point
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Running backend server (see backend README)

### 1. Install Dependencies

```bash
npm install
```

Or with yarn:
```bash
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_TITLE=AI Chat App
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎨 Component Architecture

### Main Components

#### `App.jsx`
Main application component that manages global state and routing.

```jsx
import ChatBox from './components/ChatBox';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <ChatBox />
    </div>
  );
}
```

#### `ChatBox.jsx`
Core chat interface component handling messages and socket connections.

```jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  
  // Component logic...
};
```

#### `MessageInput.jsx`
Input component with text and voice input capabilities.

```jsx
const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const { isListening, startListening, stopListening } = useVoice();
  
  // Input handling logic...
};
```

### Custom Hooks

#### `useSocket.js`
Manages Socket.IO connection and events.

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);
  
  return socket;
};
```

#### `useVoice.js`
Handles Web Speech API for voice input.

```javascript
import { useState, useEffect } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Voice recognition logic...
};
```

## 🎨 Styling with Tailwind CSS

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
```

### Common Classes Used

```css
/* Message bubbles */
.message-user {
  @apply bg-blue-500 text-white rounded-lg px-4 py-2 ml-auto max-w-xs;
}

.message-ai {
  @apply bg-gray-100 text-gray-800 rounded-lg px-4 py-2 mr-auto max-w-xs;
}

/* Input styling */
.chat-input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

/* Buttons */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors;
}
```

## 🔌 Socket.IO Integration

### Connection Setup

```javascript
// src/utils/socket.js
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

export default socket;
```

### Event Handling

```javascript
// In ChatBox component
useEffect(() => {
  if (socket) {
    socket.on('messageReceived', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('aiResponse', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, response: data.response }
            : msg
        )
      );
    });

    return () => {
      socket.off('messageReceived');
      socket.off('aiResponse');
    };
  }
}, [socket]);
```

## 🎤 Voice Input Feature

### Implementation

```javascript
// src/hooks/useVoice.js
export const useVoice = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, [onResult]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};
```

## 📱 Responsive Design

### Mobile-First Approach

```jsx
<div className="
  container mx-auto px-4 
  sm:px-6 lg:px-8 
  max-w-sm sm:max-w-md lg:max-w-4xl
">
  <div className="
    grid grid-cols-1 
    lg:grid-cols-3 
    gap-4 lg:gap-8
  ">
    {/* Chat interface */}
  </div>
</div>
```

### Breakpoint Usage

- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

## 🚀 Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npm run deploy
```

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_APP_TITLE=AI Chat App
```

## ⚡ Performance Optimization

### Code Splitting

```javascript
// Lazy loading components
import { lazy, Suspense } from 'react';

const ChatBox = lazy(() => import('./components/ChatBox'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatBox />
    </Suspense>
  );
}
```

### Image Optimization

```jsx
// Optimized image loading
<img 
  src="/image.jpg" 
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Bundle Analysis

```bash
npm run build -- --analyze
```

## 🧪 Testing

### Component Testing

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### Example Test

```javascript
// src/components/__tests__/MessageInput.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '../MessageInput';

test('renders message input', () => {
  render(<MessageInput onSendMessage={() => {}} />);
  const input = screen.getByPlaceholderText(/type your message/i);
  expect(input).toBeInTheDocument();
});
```

## 🔧 Configuration Files

### `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

## 🐛 Troubleshooting

### Common Issues

**Socket Connection Failed:**
- Check if backend server is running
- Verify VITE_SOCKET_URL in .env file
- Check browser console for CORS errors

**Voice Input Not Working:**
- Ensure HTTPS in production (required for Web Speech API)
- Check browser compatibility
- Verify microphone permissions

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 📋 Scripts Reference

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
  "lint:fix": "eslint src --ext js,jsx --fix",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

## 🎯 Features Checklist

- ✅ Real-time messaging with Socket.IO
- ✅ AI chat integration
- ✅ Voice input with Web Speech API
- ✅ Responsive design with Tailwind CSS
- ✅ Message history display
- ✅ Typing indicators
- ✅ Error handling and loading states
- ✅ Smooth animations and transitions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Follow the existing code style
4. Add tests for new features
5. Commit changes (`git commit -am 'Add new feature'`)
6. Push to branch (`git push origin feature/new-feature`)
7. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Frontend for AI Chat App**  
Built with ⚡ using React and Vite