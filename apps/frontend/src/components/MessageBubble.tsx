import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Message } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import Avatar from "./Avatar";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  message: Message;
  onDelete?: (messageId: string) => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
  return format(d, "MMM d, HH:mm");
}

export default function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isOwn = currentUser?.id === message.sender.userId;

  const time = useMemo(() => formatTime(message.createdAt), [message.createdAt]);

  // System messages
  if (message.type === "system") {
    return <div className={styles.systemMessage}>{message.content}</div>;
  }

  return (
    <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ""}`}>
      <Avatar
        username={message.sender.username}
        size="sm"
        variant={isOwn ? "outlined" : "inverted"}
      />

      <div className={styles.content}>
        <div className={styles.senderRow}>
          <span className={styles.senderName}>
            {isOwn ? "You" : message.sender.username}
          </span>
          <span className={styles.timestamp}>{time}</span>
        </div>

        <div className={styles.messageBody}>
          {message.content}

          {isOwn && onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(message._id)}
              title="Delete message"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
