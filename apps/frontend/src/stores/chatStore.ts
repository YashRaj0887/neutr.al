import { create } from "zustand";
import api from "@/lib/api";
import { getSocket, connectSocket } from "@/lib/socket";

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface Message {
  _id: string;
  roomId: string;
  sender: {
    userId: string;
    username: string;
  };
  content: string;
  type: "text" | "image" | "file" | "system";
  isEdited: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  type: "group" | "dm";
  name: string;
  description: string;
  createdBy: string | null;
  members: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

/* ── Store ─────────────────────────────────────────────────────────────── */

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>; // keyed by roomId
  typingUsers: Record<string, TypingUser[]>; // keyed by roomId
  onlineUsers: Set<string>;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;

  // Actions
  fetchRooms: () => Promise<void>;
  setActiveRoom: (roomId: string) => void;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  emitTyping: (roomId: string) => void;
  emitStopTyping: (roomId: string) => void;
  createRoom: (
    type: "group" | "dm",
    memberIds: string[],
    name?: string,
    description?: string
  ) => Promise<Room>;
  initSocket: () => void;
  cleanupSocket: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  isLoadingRooms: false,
  isLoadingMessages: false,

  fetchRooms: async () => {
    set({ isLoadingRooms: true });
    try {
      const { data } = await api.get("/rooms");
      set({ rooms: data, isLoadingRooms: false });
    } catch {
      set({ isLoadingRooms: false });
    }
  },

  setActiveRoom: (roomId) => {
    const prev = get().activeRoomId;
    if (prev && prev !== roomId) {
      get().leaveRoom(prev);
    }
    set({ activeRoomId: roomId });
    get().joinRoom(roomId);
    get().fetchMessages(roomId);
  },

  fetchMessages: async (roomId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/rooms/${roomId}/messages`);
      // The backend returns newest first — reverse for chronological display
      const reversed = [...data].reverse();
      set((state) => ({
        messages: { ...state.messages, [roomId]: reversed },
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: (roomId, content) => {
    const socket = getSocket();
    socket.emit("message:send", { roomId, content });
  },

  deleteMessage: (roomId, messageId) => {
    const socket = getSocket();
    socket.emit("message:delete", { roomId, messageId });
  },

  joinRoom: (roomId) => {
    const socket = getSocket();
    socket.emit("room:join", { roomId });
  },

  leaveRoom: (roomId) => {
    const socket = getSocket();
    socket.emit("room:leave", { roomId });
  },

  emitTyping: (roomId) => {
    const socket = getSocket();
    socket.emit("user:typing", { roomId });
  },

  emitStopTyping: (roomId) => {
    const socket = getSocket();
    socket.emit("user:stop-typing", { roomId });
  },

  createRoom: async (type, memberIds, name, description) => {
    const { data } = await api.post("/rooms", {
      type,
      memberIds,
      name,
      description,
    });
    // Refresh rooms list
    get().fetchRooms();
    return data;
  },

  initSocket: () => {
    connectSocket();
    const socket = getSocket();

    // New message arrives
    socket.on("message:new", (message: Message) => {
      set((state) => {
        const roomMessages = state.messages[message.roomId] || [];
        return {
          messages: {
            ...state.messages,
            [message.roomId]: [...roomMessages, message],
          },
        };
      });
    });

    // Message deleted
    socket.on("message:deleted", ({ messageId }: { messageId: string }) => {
      set((state) => {
        const newMessages: Record<string, Message[]> = {};
        for (const [roomId, msgs] of Object.entries(state.messages)) {
          newMessages[roomId] = msgs.filter((m) => m._id !== messageId);
        }
        return { messages: newMessages };
      });
    });

    // Online / offline
    socket.on("user:online", ({ userId }: { userId: string }) => {
      set((state) => {
        const next = new Set(state.onlineUsers);
        next.add(userId);
        return { onlineUsers: next };
      });
    });

    socket.on("user:offline", ({ userId }: { userId: string }) => {
      set((state) => {
        const next = new Set(state.onlineUsers);
        next.delete(userId);
        return { onlineUsers: next };
      });
    });

    // Typing
    socket.on(
      "user:typing",
      ({ userId, username }: { userId: string; username: string }) => {
        const activeRoomId = get().activeRoomId;
        if (!activeRoomId) return;
        set((state) => {
          const current = state.typingUsers[activeRoomId] || [];
          if (current.some((u) => u.userId === userId)) return state;
          return {
            typingUsers: {
              ...state.typingUsers,
              [activeRoomId]: [...current, { userId, username }],
            },
          };
        });
      }
    );

    socket.on(
      "user:stop-typing",
      ({ userId }: { userId: string }) => {
        const activeRoomId = get().activeRoomId;
        if (!activeRoomId) return;
        set((state) => {
          const current = state.typingUsers[activeRoomId] || [];
          return {
            typingUsers: {
              ...state.typingUsers,
              [activeRoomId]: current.filter((u) => u.userId !== userId),
            },
          };
        });
      }
    );
  },

  cleanupSocket: () => {
    const socket = getSocket();
    socket.off("message:new");
    socket.off("message:deleted");
    socket.off("user:online");
    socket.off("user:offline");
    socket.off("user:typing");
    socket.off("user:stop-typing");
  },
}));
