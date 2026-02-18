
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat, Message, Settings, SupervisorStatus } from './types';
import MockLiveChat from './components/MockLiveChat';
import SupervisorPanel from './components/SupervisorPanel';
import SettingsModal from './components/SettingsModal';
import { playAlertSound } from './utils/audio';

const DEFAULT_SETTINGS: Settings = {
  timerDuration: 120,
  keywords: ["refund", "komplain", "marah", "lama", "kecewa"],
  enableSound: true,
  monitoringEnabled: true
};

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('supervisor_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Save settings
  useEffect(() => {
    localStorage.setItem('supervisor_settings', JSON.stringify(settings));
  }, [settings]);

  // Tick for timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Supervisor Logic: Detect delays and status
  const getStatus = useCallback((): SupervisorStatus => {
    const active = chats.filter(c => c.isActive);
    const delayed = active.filter(c => {
      if (!c.lastCustomerMessageTime) return false;
      // If agent hasn't replied yet, or last message is from customer
      const lastMsg = c.messages[c.messages.length - 1];
      if (lastMsg?.sender === 'customer') {
        return (currentTime - c.lastCustomerMessageTime) / 1000 > settings.timerDuration;
      }
      return false;
    });

    return {
      activeChatsCount: active.length,
      delayedChatsCount: delayed.length,
      criticalChatsCount: active.filter(c => c.messages.some(m => 
        m.sender === 'customer' && settings.keywords.some(k => m.text.toLowerCase().includes(k.toLowerCase()))
      )).length
    };
  }, [chats, currentTime, settings]);

  const handleAddChat = () => {
    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: `Customer ${chats.length + 1}`,
      messages: [{
        id: 'init',
        sender: 'system',
        text: 'Chat started',
        timestamp: Date.now()
      }],
      startTime: Date.now(),
      lastCustomerMessageTime: null,
      lastAgentMessageTime: null,
      isActive: true
    };
    setChats(prev => [...prev, newChat]);
  };

  const handleSendMessage = (chatId: string, text: string, sender: 'customer' | 'agent') => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          sender,
          text,
          timestamp: Date.now()
        };
        
        const isCustomer = sender === 'customer';
        const isKeyword = isCustomer && settings.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()));

        if (isCustomer && settings.monitoringEnabled && settings.enableSound && isKeyword) {
          playAlertSound();
        }

        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastCustomerMessageTime: isCustomer ? Date.now() : chat.lastCustomerMessageTime,
          lastAgentMessageTime: !isCustomer ? Date.now() : chat.lastAgentMessageTime,
        };
      }
      return chat;
    }));
  };

  const status = getStatus();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 flex">
      {/* Sidebar Instructions */}
      <div className="w-80 bg-slate-800 p-6 border-r border-slate-700 text-slate-300 overflow-y-auto hidden lg:block">
        <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-shield-halved text-blue-400"></i>
          Supervisor Core
        </h1>
        <section className="space-y-4 text-sm">
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-blue-300 mb-1">DOM Logic Engine</h3>
            <p>Uses <code>MutationObserver</code> to detect <code>.message-item</code> changes in the DOM without polling.</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-orange-300 mb-1">Response Timer</h3>
            <p>Automatically starts 120s countdown upon <code>customer</code> message. Turns red if limit exceeded.</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-red-300 mb-1">Keyword Triggers</h3>
            <p>Instantly flags messages containing: {settings.keywords.join(", ")}.</p>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-700">
            <button 
              onClick={handleAddChat}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> New Mock Chat
            </button>
          </div>
        </section>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-8 overflow-y-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chats.map(chat => (
            <MockLiveChat 
              key={chat.id} 
              chat={chat} 
              settings={settings}
              currentTime={currentTime}
              onSendMessage={handleSendMessage}
            />
          ))}
          {chats.length === 0 && (
            <div className="col-span-full h-96 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500">
              <i className="fas fa-comments text-5xl mb-4"></i>
              <p className="text-xl">No active chats in the monitoring zone.</p>
              <p className="text-sm mt-2 italic">Click "New Mock Chat" to start simulation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Supervisor Overlay Panel */}
      <SupervisorPanel 
        status={status}
        monitoringEnabled={settings.monitoringEnabled}
        onToggleMonitoring={() => setSettings(s => ({ ...s, monitoringEnabled: !s.monitoringEnabled }))}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Chat Count Global Warnings */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        {status.activeChatsCount > 8 ? (
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3 border-2 border-white">
            <i className="fas fa-triangle-exclamation text-xl"></i>
            <span className="font-black text-lg">CRITICAL LOAD: {status.activeChatsCount} CHATS ACTIVE</span>
          </div>
        ) : status.activeChatsCount > 5 ? (
          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full shadow-xl animate-pulse flex items-center gap-3 border-2 border-black/20">
            <i className="fas fa-circle-exclamation text-xl"></i>
            <span className="font-bold">HIGH LOAD: {status.activeChatsCount} CHATS ACTIVE</span>
          </div>
        ) : null}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          settings={settings} 
          onSave={setSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};

export default App;
