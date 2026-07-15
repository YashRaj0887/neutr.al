"use client";

import {
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
  useEffect,
} from "react";
import { useChatStore } from "@/stores/chatStore";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  roomId: string;
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendMessage, emitTyping, emitStopTyping, typingUsers } =
    useChatStore();

  const roomTyping = typingUsers[roomId] || [];

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Emit typing
    emitTyping(roomId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(roomId);
    }, 2000);
  };

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage(roomId, trimmed);
    setText("");
    emitStopTyping(roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Refocus
    textareaRef.current?.focus();
  }, [text, roomId, sendMessage, emitStopTyping]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format typing indicator text
  const typingText = (() => {
    if (roomTyping.length === 0) return "";
    if (roomTyping.length === 1) return `${roomTyping[0].username} is typing…`;
    if (roomTyping.length === 2)
      return `${roomTyping[0].username} and ${roomTyping[1].username} are typing…`;
    return `${roomTyping[0].username} and ${roomTyping.length - 1} others are typing…`;
  })();

  return (
    <div className={styles.inputArea}>
      {typingText && (
        <div className={styles.typingIndicator}>{typingText}</div>
      )}

      <div className={styles.inputRow}>
        <div className={styles.textareaWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Type a message…"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>

        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!text.trim()}
          title="Send message"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
