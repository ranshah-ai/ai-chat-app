import React from 'react'; // ✅ required for JSX to work in some setups
import ChatBox from './components/ChatBox';


function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <ChatBox />
    </div>
  );
}

export default App;
