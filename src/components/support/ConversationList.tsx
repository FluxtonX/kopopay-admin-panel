"use client";

import { useEffect, useState } from "react";
import { Search, Filter, MessageSquare } from "lucide-react";
import { socketService } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  status: 'OPEN' | 'RESOLVED' | 'WAITING';
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function ConversationList({ 
  selectedUserId, 
  onSelect 
}: { 
  selectedUserId: string | null;
  onSelect: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const resp = await api.get('/support/conversations');
      return resp.data.data.map((c: any) => ({
        userId: String(c.partnerId),
        userName: c.partnerName,
        lastMessage: c.lastMessage,
        timestamp: c.timestamp,
        status: 'OPEN', // Could be added to backend later
      }));
    }
  });

  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      // Join admin room to get global support message updates
      socket.emit('join_support', { conversationId: 'SUPPORT_ADMIN' });

      const handleNewMessage = (msg: any) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // If it's for the currently selected user, the ChatWindow will handle its own update
        // but we might want to refresh messages here too just in case
        if (selectedUserId && (msg.senderId === selectedUserId || msg.receiverId === selectedUserId)) {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
        }
      };

      socket.on("new_support_message", handleNewMessage);
      return () => { socket.off("new_support_message", handleNewMessage); };
    }
  }, [selectedUserId, queryClient]);

  const filtered = conversations.filter(c => 
    c.userName.toLowerCase().includes(filter.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-dark-border space-y-4 bg-sidebar/30">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Inbox
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-primary/20">Live</span>
        </h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-dark-surface/50 border border-dark-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-dark-surface transition-all placeholder:text-foreground/20 shadow-inner"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-dark-border/30">
        {filtered.length > 0 ? (
          filtered.map((conv) => (
            <div 
              key={conv.userId}
              onClick={() => onSelect(conv.userId)}
              className={clsx(
                "p-4 cursor-pointer transition-all border-l-4",
                selectedUserId === conv.userId 
                  ? "bg-primary/10 border-primary shadow-lg z-10" 
                  : "border-transparent hover:bg-dark-surface/50 text-foreground/60 hover:text-foreground"
              )}
            >
              <div className="flex justify-between items-start mb-1.5">
                <h3 className={clsx(
                  "font-bold text-sm truncate max-w-[150px]",
                  selectedUserId === conv.userId ? "text-primary" : "text-foreground"
                )}>{conv.userName}</h3>
                <span className="text-[10px] text-foreground/20 font-bold uppercase tracking-tighter">
                  {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: false })}
                </span>
              </div>
              <p className={clsx(
                "text-[13px] truncate mb-2.5",
                conv.unreadCount ? "text-foreground font-semibold" : "text-foreground/40"
              )}>
                {conv.lastMessage}
              </p>
              <div className="flex items-center justify-between">
                <span className={clsx(
                  "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                  conv.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : 'bg-green-500/10 text-green-500 border border-green-500/10'
                )}>
                  {conv.status}
                </span>
                {conv.unreadCount ? (
                  <span className="w-4 h-4 bg-primary rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-foreground/10 animate-pulse">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">No conversations active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
