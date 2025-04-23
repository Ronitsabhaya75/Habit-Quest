import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

// Styled components for the chat
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  max-height: 500px;
  background: rgba(32, 58, 67, 0.95);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(64, 224, 208, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(calc(100% - 60px))'};
`;

const ChatHeader = styled.div`
  background: linear-gradient(90deg, #40E0D0 0%, #64B4FF 100%);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const ChatBody = styled.div`
  padding: 15px;
  overflow-y: auto;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 0.9rem;
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.sender === 'user' ? 'linear-gradient(90deg, #40E0D0 0%, #64B4FF 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.sender === 'user' ? 'white' : '#E0F7FA'};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid rgba(64, 224, 208, 0.2);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid rgba(64, 224, 208, 0.3);
  background: rgba(32, 58, 67, 0.7);
  color: #E0F7FA;
  
  &:focus {
    outline: none;
    border-color: rgba(64, 224, 208, 0.6);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(90deg, #40E0D0 0%, #64B4FF 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 15px;
  cursor: pointer;
  font-weight: 600;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AIChat = ({ user, tasks, onTaskUpdate, onAddTaskWithDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 'welcome', 
      text: `Hi${user?.name ? ` ${user.name}` : ''}! I'm Astra your Habit Coach. I can help you stay on track with your habits and goals. How can I assist you today?`, 
      sender: 'ai' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && message.trim()) {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), text: message, sender: 'user' };
    setChatHistory([...chatHistory, userMessage]);
    
    // Clear input
    setMessage('');
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Process the message
    setTimeout(() => {
      processUserMessage(message);
      setIsTyping(false);
    }, 1500);
  };

  const processUserMessage = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for task-related queries
    if (lowerMessage.includes('add task') || lowerMessage.includes('new task')) {
      const taskMatch = userMessage.match(/add task (?:called |named |titled |")?([^"]+)(?:"|)/i);
      if (taskMatch && taskMatch[1]) {
        const newTask = {
          id: Date.now(),
          title: taskMatch[1].trim(),
          completed: false
        };
        
        // Check for date in the message
        let targetDate = new Date();
        if (lowerMessage.includes('tomorrow')) {
          targetDate.setDate(targetDate.getDate() + 1);
          onAddTaskWithDate(targetDate, newTask);
          addAIResponse(`I've added "${newTask.title}" to your tasks for tomorrow.`);
        } else if (lowerMessage.includes('next week')) {
          targetDate.setDate(targetDate.getDate() + 7);
          onAddTaskWithDate(targetDate, newTask);
          addAIResponse(`I've added "${newTask.title}" to your tasks for next week.`);
        } else {
          onAddTaskWithDate(targetDate, newTask);
          addAIResponse(`I've added "${newTask.title}" to your tasks for today.`);
        }
        return;
      }
    }
    
    // Check for task completion
    if (lowerMessage.includes('complete') || lowerMessage.includes('finished') || lowerMessage.includes('done')) {
      const taskMatch = userMessage.match(/(?:complete|finished|done)(?:d)? (?:the |my |)(?:task |)(?:called |named |titled |")?([^"]+)(?:"|)/i);
      if (taskMatch && taskMatch[1]) {
        const taskTitle = taskMatch[1].trim().toLowerCase();
        const task = tasks.find(t => t.title.toLowerCase() === taskTitle);
        
        if (task) {
          onTaskUpdate(task.id, true);
          addAIResponse(`Great job! I've marked "${task.title}" as completed.`);
          return;
        } else {
          addAIResponse(`I couldn't find a task called "${taskMatch[1]}". Would you like to add it first?`);
          return;
        }
      }
    }
    
    // Check for streak info
    if (lowerMessage.includes('streak') || lowerMessage.includes('progress')) {
      const completedTasks = tasks.filter(t => t.completed).length;
      const totalTasks = tasks.length;
      
      addAIResponse(`You've completed ${completedTasks} out of ${totalTasks} tasks today. Keep up the good work!`);
      return;
    }
    
    // General responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
      addAIResponse(`Hello${user?.name ? ` ${user.name}` : ''}! How can I help you with your habits today?`);
    } else if (lowerMessage.includes('thank')) {
      addAIResponse(`You're welcome! I'm here to help you succeed.`);
    } else if (lowerMessage.includes('motivate me') || lowerMessage.includes('motivation')) {
      addAIResponse(`Remember, small daily improvements lead to outstanding results over time. You've got this!`);
    } else {
      addAIResponse(`I'm here to help you with your habits and tasks. You can ask me to add tasks, mark them as complete, or check your progress.`);
    }
  };

  const addAIResponse = (text) => {
    const aiMessage = { id: Date.now(), text, sender: 'ai' };
    setChatHistory(prev => [...prev, aiMessage]);
  };

  return (
    <ChatContainer isOpen={isOpen}>
      <ChatHeader onClick={toggleChat}>
        <span>💬 Habit Coach</span>
        <span>{isOpen ? '▼' : '▲'}</span>
      </ChatHeader>
      
      {isOpen && (
        <>
          <ChatBody>
            {chatHistory.map(msg => (
              <MessageBubble key={msg.id} sender={msg.sender}>
                {msg.text}
              </MessageBubble>
            ))}
            {isTyping && <MessageBubble sender="ai">Typing...</MessageBubble>}
            <div ref={messagesEndRef} />
          </ChatBody>
          
          <ChatInput>
            <StyledInput
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <SendButton onClick={sendMessage} disabled={!message.trim() || isTyping}>
              Send
            </SendButton>
          </ChatInput>
        </>
      )}
    </ChatContainer>
  );
};

export default AIChat; 
