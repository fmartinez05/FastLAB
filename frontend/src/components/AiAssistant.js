import React, { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../api'; // Asegúrate de que la ruta sea correcta

const AiAssistant = ({ practiceContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Mensaje de bienvenida inicial
      setMessages([
        {
          sender: 'ai',
          text: '¡HOLA! ¿CÓMO PUEDO AYUDARTE?\n\n¿Tienes alguna duda sobre la práctica? ¿Necesitas resolver alguna duda planteada por tu profesor? Tenemos tanto que hablar.'
        }
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await askAssistant(userInput, practiceContext);
      setMessages([...newMessages, { sender: 'ai', text: response.data.solution }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: 'Lo siento, ha ocurrido un error al contactar con el asistente.' }]);
      console.error("Error asking assistant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Asistente IA Experto</h3>
            <button onClick={toggleChat} className="close-btn">&times;</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <p className="typing-indicator">...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !userInput.trim()}>
              &rarr;
            </button>
          </form>
        </div>
      )}
      <button onClick={toggleChat} className="chat-fab">
        💬
      </button>
    </div>
  );
};

export default AiAssistant;