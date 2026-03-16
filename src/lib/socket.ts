import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;

  connect(adminId: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { userid: adminId },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Admin Socket connected");
      // Admins should join a special room or we can use join_support for now
      this.socket?.emit("join_support", { conversationId: "SUPPORT_ADMIN" });
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Admin Socket disconnected");
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
