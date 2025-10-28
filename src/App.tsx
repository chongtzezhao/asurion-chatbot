import React from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';

function App() {
  const handleSendMessage = (message: string) => {
    console.log('User sent:', message);
    // You can add additional logging or analytics here
  };

  return (
    <div className="App">
      <ChatWindow
        title="Asurion Chatbot"
        onSendMessage={handleSendMessage}
        apiKey={process.env.REACT_APP_HUGGINGFACE_API_KEY}
      />
    </div>
  );
}

export default App;
