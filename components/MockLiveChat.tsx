
import React, { useRef, useEffect, useState } from 'react';
import { Chat, Settings, Message } from '../types';

interface Props {
  chat: Chat;
  settings: Settings;
  currentTime: number;
  onSendMessage: (chatId: string, text: string, sender: 'customer' | 'agent') => void;
}

const MockLiveChat: React.FC<Props> = ({ chat, settings, currentTime, onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  // Real Extension Logic Simulation: MutationObserver
  // In a real extension, we would attach this to the page's body
  useEffect(() => {
    if (!settings.monitoringEnabled || !containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Detect new message node
          // console.log("New message detected in DOM via MutationObserver for chat", chat.id);
        }
      });
    });

    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [settings.monitoringEnabled, chat.id]);

  const lastMessage = chat.messages[chat.messages.length - 1];
  const isPendingReply = lastMessage?.sender === 'customer';
  const delaySeconds = isPendingReply && chat.lastCustomerMessageTime 
    ? Math.floor((currentTime - chat.lastCustomerMessageTime) / 1000) 
    : 0;
  
  const isDelayed = delaySeconds > settings.timerDuration;

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col h-96 w-full rounded-xl shadow-2xl border transition-all duration-500 overflow-hidden ${
        isDelayed ? 'bg-red-50 border-red-500 scale-105 z-10' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`p-4 flex justify-between items-center ${isDelayed ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${chat.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
          <span className="font-bold">{chat.customerName}</span>
        </div>
        <div className="flex items-center gap-3">
          {isPendingReply && (
            <span className={`text-xs px-2 py-1 rounded font-mono ${isDelayed ? 'bg-white text-red-600 font-bold' : 'bg-slate-800 text-white'}`}>
              <i className="fas fa-clock mr-1"></i>
              {Math.floor(delaySeconds / 60)}:{(delaySeconds % 60).toString().padStart(2, '0')}
            </span>
          )}
          <button className="hover:opacity-70"><i className="fas fa-ellipsis-v"></i></button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-opacity-50"
      >
        {chat.messages.map(m => {
          const hasKeyword = m.sender === 'customer' && settings.keywords.some(k => m.text.toLowerCase().includes(k.toLowerCase()));
          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === 'agent' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm transition-all ${
                  m.sender === 'agent' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : m.sender === 'system'
                    ? 'bg-slate-200 text-slate-500 text-[10px] uppercase tracking-widest mx-auto'
                    : hasKeyword
                    ? 'bg-red-100 text-red-900 border-l-4 border-red-600 rounded-bl-none font-medium'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="p-3 border-t bg-slate-50 flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type message..."
            className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && (onSendMessage(chat.id, inputValue, 'agent'), setInputValue(""))}
          />
          <button 
            onClick={() => { onSendMessage(chat.id, inputValue, 'agent'); setInputValue(""); }}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => onSendMessage(chat.id, "I need a refund for my last order!", "customer")}
            className="flex-1 text-[10px] bg-red-100 text-red-700 font-bold py-1 rounded hover:bg-red-200"
          >
            Simulate Crisis
          </button>
          <button 
            onClick={() => onSendMessage(chat.id, "Can you help me with a question?", "customer")}
            className="flex-1 text-[10px] bg-slate-200 text-slate-700 py-1 rounded hover:bg-slate-300"
          >
            Simulate Normal
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockLiveChat;
