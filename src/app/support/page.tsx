"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/support/ConversationList";
import { ChatWindow } from "@/components/support/ChatWindow";
import { UserPanel } from "@/components/support/UserPanel";
import { socketService } from "@/lib/socket";

export default function SupportPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we'd get the actual admin ID from session
    socketService.connect("ADMIN_MUSA");
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="h-full flex overflow-hidden">
      {/* List of Conversations (Left) */}
      <div className="w-80 border-r border-dark-border flex flex-col bg-sidebar/50">
        <ConversationList 
          selectedUserId={selectedUserId} 
          onSelect={setSelectedUserId} 
        />
      </div>

      {/* Main Chat (Center) */}
      <div className="flex-1 flex flex-col bg-background relative">
        {selectedUserId ? (
          <ChatWindow userId={selectedUserId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground/30 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/10">
              <span className="text-primary text-4xl">👋</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Select a conversation</h3>
            <p className="max-w-[200px] text-center mt-2 text-sm">
              Choose a user from the list to start providing support.
            </p>
          </div>
        )}
      </div>

      {/* User Info (Right) */}
      {selectedUserId && (
        <div className="w-80 border-l border-dark-border bg-sidebar/50 hidden xl:block">
          <UserPanel userId={selectedUserId} />
        </div>
      )}
    </div>
  );
}
