"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Trash2, Undo2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CodeHistoryEntry {
  code: string;
  timestamp: Date;
  message: string;
}

interface AgentChatProps {
  currentCode: string;
  onCodeUpdate: (newCode: string) => void;
  onProcessing?: (processing: boolean) => void;
}

export default function AgentChat({ currentCode, onCodeUpdate, onProcessing }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load saved messages from sessionStorage
    const saved = sessionStorage.getItem("agentChatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
    // Default welcome message
    return [{
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you modify your app by changing colors, adding new features, creating tabs, or making any other improvements. What would you like to do?",
      timestamp: new Date(),
    }];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeHistory, setCodeHistory] = useState<CodeHistoryEntry[]>(() => {
    // Load saved code history from sessionStorage
    const saved = sessionStorage.getItem("agentCodeHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      } catch (error) {
        console.error("Error loading code history:", error);
      }
    }
    return [];
  });
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(() => {
    // Load current history index from sessionStorage
    const saved = sessionStorage.getItem("agentCurrentHistoryIndex");
    return saved ? parseInt(saved) : -1;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("agentChatHistory", JSON.stringify(messages));
  }, [messages]);

  // Save code history to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("agentCodeHistory", JSON.stringify(codeHistory));
    sessionStorage.setItem("agentCurrentHistoryIndex", currentHistoryIndex.toString());
  }, [codeHistory, currentHistoryIndex]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    onProcessing?.(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          currentCode,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update the code with the new version
      if (data.code) {
        onCodeUpdate(data.code);
        addToHistory(data.code, inputMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      onProcessing?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you modify your app by changing colors, adding new features, creating tabs, or making any other improvements. What would you like to do?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    // Also clear code history
    setCodeHistory([]);
    setCurrentHistoryIndex(-1);
  };

  const addToHistory = (code: string, message: string) => {
    const newEntry: CodeHistoryEntry = {
      code,
      timestamp: new Date(),
      message
    };
    
    // Remove any entries after current index (if we're not at the end)
    const updatedHistory = codeHistory.slice(0, currentHistoryIndex + 1);
    const newHistory = [...updatedHistory, newEntry];
    
    setCodeHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousIndex = currentHistoryIndex - 1;
      const previousCode = codeHistory[previousIndex].code;
      
      setCurrentHistoryIndex(previousIndex);
      onCodeUpdate(previousCode);
      
      // Add a message about the undo action
      const undoMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Reverted to previous version: "${codeHistory[previousIndex].message}"`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, undoMessage]);
    }
  };

  const canUndo = currentHistoryIndex > 0;

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 !p-4 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Assistant</h3>
          <p className="text-xs text-white/60">Ask me to modify your app</p>
        </div>
        <div className="!ml-auto flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="!p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed relative"
            title={canUndo ? `Undo last change (${currentHistoryIndex} changes available)` : "No changes to undo"}
          >
            <Undo2 className="w-4 h-4" />
            {canUndo && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                {currentHistoryIndex}
              </span>
            )}
          </button>
          <button
            onClick={handleClearChat}
            className="!p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto !p-4 !space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`!max-w-[80%] rounded-xl !p-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className= "text-xs opacity-60 !mt-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 text-white border border-white/20 rounded-xl !p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="!p-4 border-t border-white/10">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to change colors, add features, create tabs, or modify your app..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg !px-3 !py-2 text-white placeholder-white/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg !px-4 !py-2 text-white transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-white/50 !mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 