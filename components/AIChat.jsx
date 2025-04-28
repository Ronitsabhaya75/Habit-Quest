import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  transform: ${props => props.isopen ? 'translateY(0)' : 'translateY(calc(100% - 60px))'};
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

const AIChat = ({ user, tasks, onTaskUpdate, onAddTask, onAddTaskWithDate }) => {
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
    
    // Check for task listing request
    if (lowerMessage.includes('what are my tasks') || lowerMessage.includes('show my tasks') || 
        lowerMessage.includes('list my tasks') || lowerMessage.includes('my tasks') || 
        lowerMessage.includes('show tasks') || lowerMessage.includes('do i have any tasks')) {
      
      if (tasks && tasks.length > 0) {
        const pendingTasks = tasks.filter(t => !t.completed);
        
        if (pendingTasks.length > 0) {
          const taskList = pendingTasks.map(t => `• ${t.title}`).join('\n');
          addAIResponse(`Here are your pending tasks:\n${taskList}`);
        } else {
          addAIResponse(`You've completed all your tasks! Great job! Would you like to add more tasks?`);
        }
      } else {
        addAIResponse(`You don't have any tasks scheduled yet. Would you like to add some?`);
      }
      return;
    }
    
    // Specific response for "how are you" to prevent repetitive answers
    if (lowerMessage === 'how are you' || lowerMessage === 'how are you?' || 
        lowerMessage === 'how are you doing' || lowerMessage === 'how are you doing?') {
      const howAreYouResponses = [
        `I'm doing great, thanks for asking! Ready to help you build those positive habits. What can I help with today?`,
        `I'm excellent! Even more importantly, how are YOU doing with your habit goals today?`,
        `I'm functioning perfectly! I'd love to hear about your progress - any habits you're proud of maintaining?`,
        `All systems optimal! I'm here and ready to help you achieve your habit goals. What's on your mind?`,
        `I'm doing well! I'm programmed to be enthusiastic about helping you with your habits and tasks!`
      ];
      
      addAIResponse(howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)]);
      return;
    }
    
    // General greeting responses (separate from how are you)
    if (lowerMessage === 'hello' || lowerMessage === 'hi' || 
        lowerMessage === 'hey' || lowerMessage === 'hi there' ||
        lowerMessage === 'greetings' || lowerMessage === 'sup') {
      
      const greetings = [
        `Hello${user?.name ? ` ${user.name}` : ''}! How can I help you with your habits today?`,
        `Hi there! Need any help tracking your tasks or habits?`,
        `Hey${user?.name ? ` ${user.name}` : ''}! I'm here to support your habit-building journey. What's on your mind?`,
        `Greetings! How's your progress with your habits going?`,
        `Hi! Let's make today productive. What would you like to focus on?`,
        `Hey there! Ready to crush some goals today?`
      ];
      
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      addAIResponse(randomGreeting);
      return;
    }
    
    // Response for discussing habits specifically
    if (lowerMessage.includes('habit') || lowerMessage.includes('habits')) {
      const habitResponses = [
        `Building good habits is all about consistency. What specific habit are you working on?`,
        `Habits are powerful - small actions repeated daily lead to big changes. Need any tips on habit formation?`,
        `The key to successful habits is making them part of your identity. What habits are you trying to establish?`,
        `Research shows it takes about 66 days to form a habit. Where are you in your habit journey?`
      ];
      
      addAIResponse(habitResponses[Math.floor(Math.random() * habitResponses.length)]);
      return;
    }
    
    // Response for discussing tasks specifically
    if (lowerMessage === 'task' || lowerMessage === 'tasks') {
      const taskResponses = [
        `I can help you manage your tasks! Would you like to add a new task, see your current tasks, or mark one as complete?`,
        `Tasks are the building blocks of productivity. Would you like me to show you your current tasks?`,
        `Let's tackle your tasks efficiently! What would you like to know about your tasks today?`,
        `Task management is key to building consistent habits. How can I help with your task list today?`
      ];
      
      addAIResponse(taskResponses[Math.floor(Math.random() * taskResponses.length)]);
      return;
    }
    
    // Check if user doesn't want to chat or is dismissive
    if (lowerMessage.includes('go away') || lowerMessage.includes('dont want') || 
        lowerMessage.includes("don't want") || lowerMessage.includes('leave me alone') ||
        lowerMessage === 'bye' || lowerMessage === 'goodbye') {
      
      const responses = [
        `I understand. I'll be here if you need help with your habits or tasks later.`,
        `No problem. Feel free to come back anytime you need assistance with your goals.`,
        `I'll step back. Just click on me if you need help with habit tracking or task management.`,
        `Goodbye for now! I'll be here when you're ready to work on your habits again.`,
        `Take care! Remember, consistency is key to habit formation.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addAIResponse(randomResponse);
      return;
    }
    
    // Response for thanks
    if (lowerMessage.includes('thank') || lowerMessage === 'thx' || lowerMessage === 'ty') {
      const thankResponses = [
        `You're welcome! I'm here to help you succeed.`,
        `Anytime! Supporting your habit journey is what I'm here for.`,
        `My pleasure! Let me know if there's anything else you need.`,
        `Happy to help! Building good habits is a team effort.`,
        `No problem at all! I'm always here to support your progress.`
      ];
      
      addAIResponse(thankResponses[Math.floor(Math.random() * thankResponses.length)]);
      return;
    } 
    
    // Response for motivation
    else if (lowerMessage.includes('motivate me') || lowerMessage.includes('motivation') ||
             lowerMessage === 'help me' || lowerMessage === 'inspire me') {
      const motivationalQuotes = [
        `Remember, small daily improvements lead to outstanding results over time. You've got this!`,
        `The difference between who you are and who you want to be is what you do daily.`,
        `Don't count the days, make the days count with consistent habits.`,
        `Every action you take is a vote for the type of person you want to become.`,
        `Success isn't always about greatness. It's about consistency. Consistent hard work leads to success.`,
        `The secret of getting ahead is getting started. Take that first small step today.`
      ];
      
      addAIResponse(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      return;
    } 
    
    // Response for checking today's date or schedule
    else if (lowerMessage.includes('today') || lowerMessage.includes('date') || 
             lowerMessage.includes('schedule') || lowerMessage.includes('calendar')) {
      
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-US', options);
      
      const todaysTasks = tasks ? tasks.filter(t => !t.completed).length : 0;
      
      addAIResponse(`Today is ${formattedDate}. You have ${todaysTasks} pending tasks to complete.`);
      return;
    }
    
    // Handle question marks - generally inquisitive users
    if (lowerMessage.endsWith('?')) {
      const questionResponses = [
        `That's a great question! I can help with tasks, habits, progress tracking, and motivation. What specifically do you need?`,
        `I'm designed to help you with habit formation and task management. Could you be more specific about what you need?`,
        `I'd be happy to answer that! I can help with tracking tasks, building habits, and providing motivation. What area are you interested in?`,
        `I'm your habit assistant, so I can help with anything related to building good habits or managing tasks. Could you clarify what you're looking for?`
      ];
      
      addAIResponse(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      return;
    }
    
    // Handle single word or very short inputs that don't match other patterns
    if (lowerMessage.split(' ').length <= 2 && lowerMessage.length < 15) {
      const shortInputResponses = [
        `I didn't quite catch that. I'm here to help with your habits and tasks. Could you provide more details?`,
        `I'm your habit coach! I can help with tasks, tracking progress, or motivation. What would you like help with?`,
        `I'm listening! I can assist with habit formation and task management. Could you tell me more?`,
        `I'm here to support your goals! For best results, try asking specific questions about your habits or tasks.`
      ];
      
      addAIResponse(shortInputResponses[Math.floor(Math.random() * shortInputResponses.length)]);
      return;
    }
    
    // Fallback responses with variety instead of always the same message
    const fallbackResponses = [
      `I'm here to help you with your habits and tasks. You can ask me to add tasks, mark them as complete, or check your progress.`,
      `I can help you track habits, manage tasks, or provide motivation. What would you like assistance with?`,
      `Need help with your habits? I can add tasks, show your progress, or help you stay motivated.`,
      `I'm your habit coach! Ask me about your tasks, progress, or for some motivation to keep going.`,
      `I specialize in habit building and task management. Let me know how I can assist you today!`,
      `I'm designed to help you build better habits. Would you like to discuss your current goals or tasks?`
    ];
    
    addAIResponse(fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]);
  };

  const addAIResponse = (text) => {
    const aiMessage = { id: Date.now(), text, sender: 'ai' };
    setChatHistory(prev => [...prev, aiMessage]);
  };

  return (
    <ChatContainer isopen={isOpen}>
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

AIChat.propTypes = {
  user: PropTypes.object,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      isHabit: PropTypes.bool,
      estimatedTime: PropTypes.number,
      isEditing: PropTypes.bool,
    })
  ),
  onTaskUpdate: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired,
  onAddTaskWithDate: PropTypes.func.isRequired
};

export default AIChat;
