import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Settings, Wifi, WifiOff, AlertTriangle, X, Bot, User, Sparkles, Menu,
  Plus, MessageSquare, History, FolderOpen, Star, Trash2, Edit3, Search, Archive,
  ChevronLeft, ChevronRight, MoreVertical, Calendar, Tag, Download, Upload
} from 'lucide-react';

// Enhanced MessageBubble Component
const MessageBubble = ({ text, sender, timestamp, source }) => {
  const isUser = sender === 'user';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const formatText = (text) => {
    if (text.includes('```')) {
      return text.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-800 text-green-400 p-3 rounded-lg mt-2 mb-2 text-sm overflow-x-auto border border-gray-600">
              <code className="whitespace-pre-wrap">{part.trim()}</code>
            </pre>
          );
        }
        return formatStructuredText(part);
      });
    }
    return formatStructuredText(text);
  };

  const formatStructuredText = (text) => {
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;
      
      const listItems = paragraph.split('\n').filter(line => line.trim());
      const isList = listItems.some(item => 
        /^[\s]*[-•*]\s/.test(item) || 
        /^[\s]*\d+\.\s/.test(item) ||
        /^\*\*[^*]+\*\*/.test(item.trim())
      );
      
      if (isList && listItems.length > 1) {
        return (
          <div key={pIndex} className="mb-3">
            {listItems.map((item, iIndex) => {
              const trimmedItem = item.trim();
              
              if (/^\d+\.\s/.test(trimmedItem)) {
                const content = trimmedItem.replace(/^\d+\.\s/, '');
                return (
                  <div key={iIndex} className="flex items-start mb-2">
                    <span className="text-blue-400 font-semibold mr-2 mt-0.5 text-sm">
                      {trimmedItem.match(/^\d+/)[0]}.
                    </span>
                    <span className="flex-1">{formatInlineText(content)}</span>
                  </div>
                );
              }
              
              if (/^[-•*]\s/.test(trimmedItem)) {
                const content = trimmedItem.replace(/^[-•*]\s/, '');
                return (
                  <div key={iIndex} className="flex items-start mb-2">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span className="flex-1">{formatInlineText(content)}</span>
                  </div>
                );
              }
              
              if (/^\*\*[^*]+\*\*/.test(trimmedItem)) {
                return (
                  <div key={iIndex} className="font-semibold text-blue-300 mb-2 mt-3">
                    {formatInlineText(trimmedItem)}
                  </div>
                );
              }
              
              return (
                <div key={iIndex} className="mb-2">
                  {formatInlineText(trimmedItem)}
                </div>
              );
            })}
          </div>
        );
      }
      
      return (
        <div key={pIndex} className="mb-3 last:mb-0">
          {formatInlineText(paragraph.trim())}
        </div>
      );
    }).filter(Boolean);
  };

  const formatInlineText = (text) => {
    let parts = [text];
    
    // Inline code with backticks
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split('`').map((segment, index) => {
        if (index % 2 === 1) {
          return (
            <code key={`code-${index}`} className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono border border-gray-600">
              {segment}
            </code>
          );
        }
        return segment;
      });
    });
    
    // Handle bold text **text**
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split(/(\*\*[^*]+\*\*)/).map((segment, index) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return (
            <strong key={`bold-${index}`} className="font-semibold text-blue-300">
              {segment.slice(2, -2)}
            </strong>
          );
        }
        return segment;
      });
    });
    
    // Handle italic text *text*
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split(/(\*[^*]+\*)/).map((segment, index) => {
        if (segment.startsWith('*') && segment.endsWith('*') && !segment.includes('**')) {
          return (
            <em key={`italic-${index}`} className="italic text-gray-300">
              {segment.slice(1, -1)}
            </em>
          );
        }
        return segment;
      });
    });
    
    return parts;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group px-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 mr-3 mt-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg ${
            source === 'fallback' 
              ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
              : source === 'error' || source === 'system'
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            <Bot size={20} />
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%] xl:max-w-[60%]">
        <div
          className={`rounded-2xl px-4 py-4 text-sm break-words shadow-lg transition-all duration-200 hover:shadow-xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md ml-auto'
              : source === 'fallback'
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-bl-md'
              : source === 'error' || source === 'system'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-bl-md'
              : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-bl-md'
          }`}
        >
          <div className="leading-relaxed">
            {formatText(text)}
          </div>
        </div>
        
        <div 
          className={`text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2 ${
            isUser ? 'justify-end mr-2' : 'justify-start ml-2'
          }`}
        >
          <span>{formatTime(timestamp)}</span>
          {!isUser && source && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              source === 'api' ? 'bg-purple-500/20 text-purple-400' : 
              source === 'error' || source === 'system' ? 'bg-red-500/20 text-red-400' :
              'bg-orange-500/20 text-orange-400'
            }`}>
              {source === 'api' ? '🤖 AI' : 
               source === 'error' || source === 'system' ? '⚠️ System' :
               '📝 Basic'}
            </span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 ml-3 mt-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg">
            <User size={20} />
          </div>
        </div>
      )}
    </div>
  );
};

// VoiceInput Component
const VoiceInput = ({ onTranscript, lang, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!isSupported || disabled) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 bg-gray-600 text-gray-400 rounded-xl cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <MicOff size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      className={`p-3 rounded-xl transition-all duration-200 ${
        disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : isListening
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/25'
          : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:shadow-lg'
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, chats, onNewChat, onSelectChat, currentChatId, onDeleteChat, onRenameChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('chats');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [newChatName, setNewChatName] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projects = [
    { id: 1, name: 'Website Redesign', type: 'Design', lastModified: '2 hours ago', color: 'bg-blue-500' },
    { id: 2, name: 'API Documentation', type: 'Development', lastModified: '1 day ago', color: 'bg-green-500' },
    { id: 3, name: 'Marketing Campaign', type: 'Content', lastModified: '3 days ago', color: 'bg-purple-500' },
  ];

  const handleRename = (chatId, newName) => {
    if (newName.trim()) {
      onRenameChat(chatId, newName.trim());
    }
    setEditingChat(null);
    setNewChatName('');
  };

  const handleDeleteConfirm = (chatId) => {
    onDeleteChat(chatId);
    setShowDeleteConfirm(null);
  };

  const formatChatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 lg:w-72 xl:w-80`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">AI Assistant</h2>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Plus size={18} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-1 bg-gray-700 rounded-lg p-1">
            {[
              { id: 'chats', label: 'Chats', icon: MessageSquare },
              { id: 'history', label: 'History', icon: History },
              { id: 'projects', label: 'Projects', icon: FolderOpen }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedSection(id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                  selectedSection === id 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={`Search ${selectedSection}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedSection === 'chats' && (
            <div className="p-2">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto text-gray-500 mb-3" size={32} />
                  <p className="text-gray-400 text-sm">
                    {searchTerm ? 'No chats found' : 'No chats yet'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {searchTerm ? 'Try a different search term' : 'Start a new conversation'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700 ${
                        currentChatId === chat.id ? 'bg-purple-600/20 border border-purple-500/50' : ''
                      }`}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {editingChat === chat.id ? (
                            <input
                              type="text"
                              value={newChatName}
                              onChange={(e) => setNewChatName(e.target.value)}
                              onBlur={() => handleRename(chat.id, newChatName)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(chat.id, newChatName);
                                if (e.key === 'Escape') {
                                  setEditingChat(null);
                                  setNewChatName('');
                                }
                              }}
                              className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h3 className="text-white font-medium text-sm truncate">{chat.title}</h3>
                          )}
                          <p className="text-gray-400 text-xs mt-1 truncate">{chat.preview}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-500 text-xs">{formatChatDate(chat.timestamp)}</span>
                            {chat.messageCount && (
                              <span className="text-gray-500 text-xs">{chat.messageCount} messages</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChat(chat.id);
                              setNewChatName(chat.title);
                            }}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                            title="Rename chat"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(chat.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                            title="Delete chat"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      
                      {chat.starred && (
                        <div className="absolute top-2 right-2">
                          <Star className="text-yellow-400" size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedSection === 'history' && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium text-sm mb-2 flex items-center">
                    <Calendar size={14} className="mr-2" />
                    Today
                  </h3>
                  <div className="space-y-2">
                    {filteredChats.slice(0, 3).map((chat) => (
                      <div key={chat.id} className="p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-white text-sm truncate">{chat.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{formatChatDate(chat.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-medium text-sm mb-2">Yesterday</h3>
                  <div className="space-y-2">
                    {filteredChats.slice(3, 6).map((chat) => (
                      <div key={chat.id} className="p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-white text-sm truncate">{chat.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{formatChatDate(chat.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'projects' && (
            <div className="p-2">
              {projects.length === 0 ? (
                <div className="p-8 text-center">
                  <FolderOpen className="mx-auto text-gray-500 mb-3" size={32} />
                  <p className="text-gray-400 text-sm">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${project.color} rounded-lg flex items-center justify-center`}>
                            <FolderOpen size={16} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-sm">{project.name}</h3>
                            <p className="text-gray-400 text-xs">{project.type}</p>
                            <p className="text-gray-500 text-xs mt-1">{project.lastModified}</p>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white rounded">
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Storage</span>
            <span>2.3GB / 5GB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '46%' }}></div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Import">
              <Upload size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Export">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Archive">
              <Archive size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-700">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Chat</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// HTTP-based API communication
const useBackendAPI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState({ remaining: 0, total: 0, activeProviders: 0, healthy: false });
  const [connectionError, setConnectionError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setConnectionError(null);
        setApiStatus({
          remaining: data.totalQuota - (data.usedQuota || 0),
          total: data.totalQuota || 0,
          activeProviders: data.activeProviders || 0,
          healthy: data.status === 'healthy'
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      setIsConnected(false);
      setConnectionError(`Cannot connect to backend: ${error.message}`);
      setApiStatus({ remaining: 0, total: 0, activeProviders: 0, healthy: false });
    }
  };

  const sendMessage = async (message) => {
    try {
      console.log('📤 Sending message to backend...');
      const response = await fetch(`${API_BASE_URL}/test-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ message: message.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response received:', data);
      
      if (data.status) {
        setApiStatus({
          remaining: data.status.totalQuota - (data.status.usedQuota || 0),
          total: data.status.totalQuota || 0,
          activeProviders: data.status.activeProviders || 0,
          healthy: data.status.activeProviders > 0
        });
      }

      return {
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        source: data.source || 'api'
      };

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      return {
        text: `❌ Failed to get AI response: ${error.message}. The backend server might be down or unreachable.`,
        sender: 'ai',
        timestamp: new Date(),
        source: 'error'
      };
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    apiStatus,
    connectionError,
    sendMessage,
    checkConnection
  };
};

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en-IN');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Chat management
  const [chats, setChats] = useState([
    {
      id: 1,
      title: 'Web Development Help',
      preview: 'How do I create a responsive navbar...',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 15,
      starred: true
    },
    {
      id: 2,
      title: 'Python Data Analysis',
      preview: 'Can you help me with pandas...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 8,
      starred: false
    },
    {
      id: 3,
      title: 'React Component Design',
      preview: 'Best practices for component...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 22,
      starred: false
    },
    {
      id: 4,
      title: 'Database Optimization',
      preview: 'How to improve query performance...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      messageCount: 12,
      starred: true
    },
    {
      id: 5,
      title: 'API Integration',
      preview: 'RESTful API best practices...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      messageCount: 6,
      starred: false
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isConnected, apiStatus, connectionError, sendMessage: sendToBackend } = useBackendAPI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isConnected]);

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      preview: 'Start a conversation...',
      timestamp: new Date(),
      messageCount: 0,
      starred: false
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    // In a real app, you'd load the messages for this chat
    setMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const handleDeleteChat = (chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleRenameChat = (chatId, newName) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newName } : chat
    ));
  };

  const updateCurrentChatPreview = (lastMessage) => {
    if (currentChatId) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              preview: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : ''),
              messageCount: (chat.messageCount || 0) + 1,
              timestamp: new Date()
            } 
          : chat
      ));
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!isConnected) {
      const errorMsg = {
        text: "❌ Not connected to backend server. Please ensure the backend is running on http://localhost:5000 and try again.",
        sender: 'ai',
        timestamp: new Date(),
        source: 'system'
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    if (apiStatus.total > 0 && apiStatus.remaining <= 0) {
      const errorMsg = {
        text: "⚠️ Daily quota exhausted. Please try again tomorrow or contact support for more quota.",
        sender: 'ai',
        timestamp: new Date(),
        source: 'system'
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const message = {
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // If no chat is selected, create a new one
    if (!currentChatId) {
      handleNewChat();
    }

    setMessages((prev) => [...prev, message]);
    updateCurrentChatPreview(message.text);
    setInput('');
    setIsTyping(true);
    
    try {
      const aiResponse = await sendToBackend(message);
      setMessages((prev) => [...prev, aiResponse]);
      updateCurrentChatPreview(aiResponse.text);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        text: "❌ Sorry, I encountered an error while processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        source: 'error'
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }

    inputRef.current?.focus();
  };

  const handleVoiceInput = (transcript) => {
    setInput((prev) => {
      const newValue = prev ? prev + ' ' + transcript : transcript;
      setTimeout(() => inputRef.current?.focus(), 100);
      return newValue;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quotaPercentage = apiStatus.total > 0 ? (apiStatus.remaining / apiStatus.total) * 100 : 100;
  const getQuotaColor = () => {
    if (quotaPercentage > 50) return 'bg-green-500';
    if (quotaPercentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConnectionStatus = () => {
    if (connectionError) {
      return { icon: WifiOff, color: 'text-red-400', text: 'Connection Error', bg: 'bg-red-500' };
    }
    if (!isConnected) {
      return { icon: WifiOff, color: 'text-yellow-400', text: 'Connecting...', bg: 'bg-yellow-500' };
    }
    if (!apiStatus.healthy && apiStatus.total > 0) {
      return { icon: AlertTriangle, color: 'text-orange-400', text: 'Limited Service', bg: 'bg-orange-500' };
    }
    return { icon: Wifi, color: 'text-green-400', text: 'Connected', bg: 'bg-green-500' };
  };

  const connectionStatus = getConnectionStatus();
  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-72 xl:ml-80' : ''
      }`}>
        
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-700 to-gray-600 px-4 lg:px-6 py-4 flex items-center justify-between border-b border-gray-600 shadow-lg">
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl lg:text-2xl">
                {currentChat ? currentChat.title : 'AI Chat Assistant'}
              </h1>
              <div className="text-sm text-gray-300 hidden sm:block">
                {currentChat 
                  ? `${currentChat.messageCount || 0} messages` 
                  : 'Connected to backend via HTTP API'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Quota indicator - Desktop */}
            {apiStatus.total > 0 && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-sm text-gray-300">
                  {apiStatus.remaining}/{apiStatus.total}
                </div>
                <div className="w-20 lg:w-24 h-2 bg-gray-600 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${getQuotaColor()}`}
                    style={{ width: `${quotaPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Connection status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${connectionStatus.bg}`}>
                  {isConnected && <div className={`absolute inset-0 ${connectionStatus.bg} rounded-full animate-ping opacity-75`}></div>}
                </div>
              </div>
              <connectionStatus.icon size={18} className={connectionStatus.color} />
              <span className="text-sm text-gray-300 hidden lg:inline">{connectionStatus.text}</span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>

            {/* Settings button - Desktop */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hidden md:block p-3 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="flex-shrink-0 bg-red-900/50 border-b border-red-500/50 px-4 py-3 text-red-200 text-sm flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>❌ {connectionError}</span>
            <span className="ml-auto text-xs">Make sure the backend server is running on http://localhost:5000</span>
          </div>
        )}

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-gray-750 border-b border-gray-600 p-4 flex-shrink-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {apiStatus.total > 0 && (
                <div>
                  <div className="text-sm text-gray-300 mb-1">Quota: {apiStatus.remaining}/{apiStatus.total}</div>
                  <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getQuotaColor()}`}
                      style={{ width: `${quotaPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus.bg}`}></div>
                <span className="text-sm text-gray-300">{connectionStatus.text}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowMobileMenu(false);
              }}
              className="w-full p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              <Settings size={18} className="inline mr-2" />
              Settings
            </button>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="flex-shrink-0 bg-gray-750 border-b border-gray-600 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium text-lg">Settings</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Voice Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-gray-500 transition border-none outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="en-IN">🇮🇳 English (India)</option>
                  <option value="hi-IN">🇮🇳 हिंदी (Hindi)</option>
                  <option value="ml-IN">🇮🇳 മലയാളം (Malayalam)</option>
                  <option value="ta-IN">🇮🇳 தமிழ் (Tamil)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Connection Status</label>
                <div className={`px-4 py-3 rounded-lg text-sm text-white flex items-center ${
                  isConnected 
                    ? apiStatus.healthy 
                      ? 'bg-green-600' 
                      : 'bg-orange-600'
                    : 'bg-red-600'
                }`}>
                  <connectionStatus.icon size={16} className="mr-2" />
                  {isConnected 
                    ? apiStatus.healthy 
                      ? '✅ Connected & Healthy' 
                      : '⚠️ Connected (Limited)' 
                    : '❌ Disconnected'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">API Status</label>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Providers:</span>
                    <span>{apiStatus.activeProviders || 0} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-semibold">{apiStatus.remaining || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Sparkles className="text-white" size={32} />
              </div>
              <h2 className="text-white text-2xl lg:text-3xl font-bold mb-3">
                {currentChat ? `Continue ${currentChat.title}` : 'Welcome to AI Chat'}
              </h2>
              <p className="text-gray-400 text-base lg:text-lg mb-6 max-w-md">
                {isConnected 
                  ? currentChat 
                    ? "Continue your conversation or start a new topic."
                    : "Connected to AI backend! Start a conversation with your intelligent assistant."
                  : "Connecting to AI backend... Please wait."}
              </p>
              <div className="bg-gray-700/50 backdrop-blur rounded-xl p-6 text-sm text-gray-300 max-w-sm border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Connection:</span>
                  <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                {apiStatus.total > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">API Quota:</span>
                    <span className="font-bold text-blue-400">{apiStatus.remaining}/{apiStatus.total}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`font-bold ${apiStatus.healthy ? 'text-green-400' : 'text-orange-400'}`}>
                    {apiStatus.healthy ? 'Ready' : 'Limited'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              text={message.text} 
              sender={message.sender} 
              timestamp={message.timestamp}
              source={message.source}
            />
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4 px-4">
              <div className="flex-shrink-0 w-10 h-10 mr-3 mt-1">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Bot size={20} />
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-700 to-gray-600 px-4 lg:px-6 py-4 border-t border-gray-600">
          <div className="flex items-end space-x-3 max-w-6xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConnected 
                    ? "Type your message here... (Press Enter to send, Shift+Enter for new line)" 
                    : "Connecting to backend server..."
                }
                disabled={!isConnected || isTyping}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
                rows={Math.min(Math.max(1, input.split('\n').length), 4)}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              
              {input.length > 0 && (
                <div className="absolute bottom-1 right-12 text-xs text-gray-500">
                  {input.length}
                </div>
              )}
            </div>

            <button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected || isTyping}
              className={`p-3 rounded-xl transition-all duration-200 ${
                !input.trim() || !isConnected || isTyping
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
              title={
                !isConnected 
                  ? 'Not connected to backend' 
                  : !input.trim() 
                  ? 'Type a message first' 
                  : isTyping 
                  ? 'AI is responding...' 
                  : 'Send message'
              }
            >
              <Send size={20} />
            </button>

            <VoiceInput 
              onTranscript={handleVoiceInput} 
              lang={lang}
              disabled={!isConnected || isTyping}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400 max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
              
              {apiStatus.total > 0 && (
                <span className="text-gray-400">
                  Quota: {apiStatus.remaining}/{apiStatus.total} remaining
                </span>
              )}
              
              {apiStatus.activeProviders > 0 && (
                <span className="text-blue-400">
                  {apiStatus.activeProviders} AI provider{apiStatus.activeProviders !== 1 ? 's' : ''} active
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span>Press Enter to send • Shift+Enter for new line</span>
              {messages.length > 0 && (
                <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;