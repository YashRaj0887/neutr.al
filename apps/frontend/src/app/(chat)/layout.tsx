"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import CreateRoomModal from "@/components/CreateRoomModal";
import styles from "./layout.module.css";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const { fetchRooms, initSocket, cleanupSocket } = useChatStore();
  const { fetchUnreadCount } = useNotificationStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchUnreadCount();
      initSocket();

      return () => {
        cleanupSocket();
      };
    }
  }, [isAuthenticated, fetchRooms, fetchUnreadCount, initSocket, cleanupSocket]);

  return (
    <ProtectedRoute>
      <div className={styles.shell}>
        {/* Mobile sidebar toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Sidebar */}
        <div
          className={styles.sidebarArea}
          data-open={sidebarOpen ? "true" : "false"}
        >
          <Sidebar
            onCreateRoom={() => {
              setShowCreateModal(true);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* Content */}
        <div className={styles.contentArea}>{children}</div>
      </div>

      {/* Create room modal */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </ProtectedRoute>
  );
}
