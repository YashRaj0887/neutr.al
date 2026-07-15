"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import styles from "./room.module.css";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const {
    rooms,
    messages,
    setActiveRoom,
    deleteMessage,
    isLoadingMessages,
  } = useChatStore();

  const room = rooms.find((r) => r._id === roomId);
  const roomMessages = messages[roomId] || [];

  const messageListRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isInitialLoad = useRef(true);

  // Set active room on mount
  useEffect(() => {
    if (roomId) {
      setActiveRoom(roomId);
      isInitialLoad.current = true;
    }
  }, [roomId, setActiveRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (roomMessages.length > 0 && messageListRef.current) {
      const el = messageListRef.current;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;

      if (isInitialLoad.current || isNearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: isInitialLoad.current ? "auto" : "smooth" });
        isInitialLoad.current = false;
      }
    }
  }, [roomMessages.length]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = messageListRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }, []);

  const scrollToBottom = () => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(roomId, messageId);
  };

  const getRoomDisplayName = () => {
    if (room?.name) return room.name;
    if (room?.type === "dm") return "Direct Message";
    return "Unnamed Room";
  };

  const getRoomInitial = () => {
    if (room?.name) return room.name.charAt(0);
    return room?.type === "dm" ? "D" : "G";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.headerBack}
          onClick={() => router.push("/rooms")}
        >
          ←
        </button>

        <div className={styles.roomIcon}>{getRoomInitial()}</div>

        <div className={styles.headerInfo}>
          <div className={styles.roomName}>{getRoomDisplayName()}</div>
          {room?.description && (
            <div className={styles.roomDescription}>{room.description}</div>
          )}
        </div>

        <span className={styles.memberCount}>
          {room?.members.length || 0} member
          {(room?.members.length || 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      {isLoadingMessages ? (
        <div className={styles.loadingState}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <span className={styles.loadingText}>Loading messages…</span>
        </div>
      ) : roomMessages.length === 0 ? (
        <div className={styles.emptyMessages}>
          <div className={styles.emptyIcon}>💬</div>
          <span className={styles.emptyTitle}>No messages yet</span>
          <span className={styles.emptySubtitle}>
            Be the first to say something
          </span>
        </div>
      ) : (
        <div
          className={styles.messageList}
          ref={messageListRef}
          onScroll={handleScroll}
        >
          {roomMessages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button className={styles.scrollBottom} onClick={scrollToBottom}>
          ↓
        </button>
      )}

      {/* Input */}
      <MessageInput roomId={roomId} />
    </div>
  );
}
