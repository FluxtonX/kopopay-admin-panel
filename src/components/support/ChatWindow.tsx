"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  MoreVertical, 
  Smile, 
  Paperclip,
  CheckCircle2
} from "lucide-react";
import { socketService } from "@/lib/socket";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { clsx } from "clsx";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  senderName?: string;
  isSupport: boolean;
}

export function ChatWindow({ userId }: { userId: string }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([
    "How can I assist you with your deposit today?",
    "Your transaction is currently being processed. Please wait 10 minutes.",
    "Could you please provide a screenshot of the error message?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const resp = await api.get(`/support/history/${userId}`);
      return resp.data.data;
    },
    enabled: !!userId,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      const conversationId = [userId, 'SUPPORT_ADMIN'].sort().join('_');
      socket.emit('join_support', { conversationId });

      const handleNewMessage = (msg: Message) => {
        if (msg.senderId === userId || msg.receiverId === userId) {
          queryClient.setQueryData(['messages', userId], (old: Message[] | undefined) => {
            const list = old || [];
            // Only add if not already in list (for optimistic updates)
            if (list.some(m => m.id === msg.id)) return list;
            return [...list, msg];
          });
        }
      };

      socket.on("new_support_message", handleNewMessage);
      return () => { socket.off("new_support_message", handleNewMessage); };
    }
  }, [userId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msgText = text || inputValue;
    if (!msgText.trim()) return;

    const msgId = Math.random().toString(36).substring(7);
    const newMessage: Message = {
      id: msgId,
      senderId: 'SUPPORT_ADMIN',
      receiverId: userId,
      message: msgText,
      timestamp: new Date().toISOString(),
      isSupport: true,
    };

    // For the admin panel, we pass the generated ID to the backend
    // so we can deduplicate when it echoes back via socket
    socketService.getSocket()?.emit("support_message", newMessage);
    
    // Update local query data for immediate UI feedback
    queryClient.setQueryData(['messages', userId], (old: Message[] | undefined) => [...(old || []), newMessage]);
    
    // Invalidate conversations list to update 'last message' in inbox
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between glass z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {userId.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-sm">John Musa</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-foreground/50 font-medium">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[10px] font-bold text-green-500 px-3 py-1.5 rounded-full border border-green-500/20 hover:bg-green-500/10 transition-all">
            <CheckCircle2 size={14} /> MARK AS RESOLVED
          </button>
          <button className="text-foreground/40 hover:text-foreground transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-center bg-fixed">
        {messages.map((msg) => {
          const isMe = msg.isSupport;
          return (
            <div key={msg.id} className={clsx(
              "flex flex-col max-w-[85%]", // slightly wider
              isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={clsx(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg transition-all",
                isMe 
                  ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                  : "bg-dark-surface border border-dark-border text-foreground rounded-tl-none shadow-black/20"
              )}>
                {msg.message}
              </div>
              <span className="text-[10px] text-foreground/20 mt-1.5 px-2 font-medium">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-dark-border bg-sidebar/50 backdrop-blur-md">
        {/* AI Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 border border-primary/20">
            <Sparkles size={12} /> AI SUGGESTIONS
          </div>
          {suggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 bg-dark-surface/50 border border-dark-border rounded-full text-[11px] text-foreground/70 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shrink-0 font-medium"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-2 flex flex-col gap-2 focus-within:border-primary/50 transition-all shadow-xl shadow-black/20">
          <textarea 
            className="w-full bg-transparent p-2 text-[14px] text-foreground focus:outline-none resize-none min-h-[60px] placeholder:text-foreground/20"
            placeholder="Type your response..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-3 text-foreground/40">
              <button className="hover:text-primary transition-all"><Smile size={20} /></button>
              <button className="hover:text-primary transition-all"><Paperclip size={20} /></button>
            </div>
            <button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="bg-primary text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
