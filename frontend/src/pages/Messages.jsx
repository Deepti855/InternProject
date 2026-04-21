import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSend, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function Messages() {
  const { user } = useAuth();
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch actual users from DB
    const fetchUsers = async () => {
       try {
           const response = await api.get('/users');
           // Exclude self
           const otherUsers = response.data.filter(u => u.id !== user?.id);
           // Only use the explicitly requested test users (testuser1...4) if they exist, 
           // otherwise show everyone. Or just show everyone.
           setUsers(otherUsers);
       } catch (err) {
           console.error('Failed to load users', err);
       }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (activeChat) {
        // Fetch chat history
        api.get(`/messages/${activeChat.id}`)
           .then(res => setMessages(res.data))
           .catch(err => console.error(err));
    }
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;
    
    const receiveMsgHandler = (msg) => {
        // Only append if it belongs to the current open chat
        if (activeChat && (msg.sender_id === activeChat.id || msg.receiver_id === activeChat.id)) {
           setMessages(prev => [...prev, msg]);
        }
    };

    const typingHandler = (data) => {
        if (activeChat && data.sender_id === activeChat.id) {
            setIsTyping(data.isTyping);
        }
    };

    socket.on('receive_message', receiveMsgHandler);
    socket.on('user_typing', typingHandler);
    
    return () => {
       socket.off('receive_message', receiveMsgHandler);
       socket.off('user_typing', typingHandler);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const msgPayload = {
        sender_id: user.id,
        receiver_id: activeChat.id,
        content: newMessage
    };
    
    // Emit via socket
    socket.emit('send_message', msgPayload);
    
    setNewMessage('');
    setIsTyping(false);
    socket.emit('typing', { sender_id: user.id, receiver_id: activeChat.id, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { sender_id: user.id, receiver_id: activeChat.id, isTyping: e.target.value.length > 0 });
  };

  return (
    <div className="max-w-7xl mx-auto w-full h-[calc(100vh-8rem)] flex shadow-2xl rounded-3xl overflow-hidden bg-[#FDF5E6]/10 backdrop-blur-xl border border-white/20">
      
      {/* Left Sidebar - Conversations List */}
      <div className="w-full md:w-80 border-r border-white/10 bg-black/20 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.filter(c => c.username.toLowerCase().includes(searchTerm.toLowerCase())).map((chatUser) => (
            <motion.div 
              key={chatUser.id} 
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => { setActiveChat(chatUser); setIsTyping(false); }}
              className={`p-4 cursor-pointer border-b border-white/5 transition-colors ${activeChat?.id === chatUser.id ? 'bg-white/10' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                    {chatUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-white font-extrabold truncate text-base">{chatUser.username}</h3>
                  </div>
                  <p className="text-sm text-gray-400 truncate">Tap to chat</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Main Panel - Live Chat Window */}
      <div className="hidden md:flex flex-1 flex-col bg-white/5">
        {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-extrabold">
                      {activeChat.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <h3 className="text-white font-extrabold text-lg leading-tight">{activeChat.username}</h3>
                      <p className="text-xs text-green-400 font-semibold">Online</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
                    <FiInfo className="w-6 h-6" />
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  <AnimatePresence>
                      {messages.map((msg) => {
                          const isMe = msg.sender_id === user?.id;
                          return (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id || Math.random()} 
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm backdrop-blur-md ${isMe ? 'bg-[#FDF5E6] text-[#4A5D4E] rounded-br-none border border-white' : 'bg-[#A7C98F]/40 text-[#2D3E33] border border-white/20 rounded-bl-none'}`}>
                                      <p className="font-semibold leading-relaxed">{msg.content}</p>
                                  </div>
                                  <span className="text-[10px] text-[#4A5D4E]/60 font-bold mt-1.5 mx-2 uppercase tracking-widest">
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                              </motion.div>
                          );
                      })}
                  </AnimatePresence>
                  
                  {/* Real-time Typing Indicator */}
                  {isTyping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                           <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-none p-4 shadow-lg flex space-x-2 items-center">
                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                           </div>
                      </motion.div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-5 bg-white/5 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-1 flex items-center shadow-inner">
                          <textarea 
                              value={newMessage}
                              onChange={handleTyping}
                              placeholder="Type your message..."
                              className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none py-3 px-5 max-h-32 custom-scrollbar font-medium"
                              rows="1"
                              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                          />
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                          <button type="submit" className="bg-blue-600 p-4 rounded-full text-white shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={!newMessage.trim()}>
                              <FiSend className="w-5 h-5 ml-1" />
                          </button>
                      </motion.div>
                  </form>
              </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                     <span className="text-4xl text-blue-500">💬</span>
                 </div>
                 <h2 className="text-2xl font-extrabold text-white mb-2">Your Messages</h2>
                 <p className="text-gray-400 max-w-sm font-medium">Select a user from the sidebar to start a real-time conversation.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
