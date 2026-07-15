"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore, Room } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import Avatar from "./Avatar";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onCreateRoom: () => void;
}

export default function Sidebar({ onCreateRoom }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const activeRoomId = params?.roomId as string | undefined;

  const { user, logout } = useAuthStore();
  const { rooms, isLoadingRooms } = useChatStore();
  const { unreadCount } = useNotificationStore();

  const [search, setSearch] = useState("");

  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rooms;
    const q = search.toLowerCase();
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [rooms, search]);

  const groupRooms = filteredRooms.filter((r) => r.type === "group");
  const dmRooms = filteredRooms.filter((r) => r.type === "dm");

  const handleRoomClick = (room: Room) => {
    router.push(`/rooms/${room._id}`);
  };

  const getRoomInitial = (room: Room) => {
    if (room.name) return room.name.charAt(0);
    return room.type === "dm" ? "D" : "G";
  };

  const getRoomDisplayName = (room: Room) => {
    if (room.name) return room.name;
    if (room.type === "dm") return "Direct Message";
    return "Unnamed Group";
  };

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>
            neutr<span className={styles.brandDot} />al
          </span>
          <button
            className={styles.notifBtn}
            onClick={() => router.push("/rooms")}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search rooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Room list */}
      <div className={styles.roomList}>
        {isLoadingRooms ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonCircle} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* DMs */}
            {dmRooms.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Direct Messages</div>
                {dmRooms.map((room) => (
                  <div
                    key={room._id}
                    className={styles.roomItem}
                    data-active={activeRoomId === room._id ? "true" : "false"}
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className={styles.roomIcon}>
                      {getRoomInitial(room)}
                    </div>
                    <div className={styles.roomInfo}>
                      <div className={styles.roomName}>
                        {getRoomDisplayName(room)}
                      </div>
                      <div className={styles.roomMeta}>
                        {room.members.length} member
                        {room.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Groups */}
            {groupRooms.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Groups</div>
                {groupRooms.map((room) => (
                  <div
                    key={room._id}
                    className={styles.roomItem}
                    data-active={activeRoomId === room._id ? "true" : "false"}
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className={styles.roomIcon}>
                      {getRoomInitial(room)}
                    </div>
                    <div className={styles.roomInfo}>
                      <div className={styles.roomName}>
                        {getRoomDisplayName(room)}
                      </div>
                      <div className={styles.roomMeta}>
                        {room.members.length} member
                        {room.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {filteredRooms.length === 0 && !isLoadingRooms && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--fg-muted)",
                  fontSize: "0.8125rem",
                }}
              >
                {search ? "No rooms match your search" : "No rooms yet"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create room */}
      <button className={styles.createRoomBtn} onClick={onCreateRoom}>
        + New Room
      </button>

      {/* Footer */}
      <div className={styles.footer}>
        <Avatar
          username={user?.username || "?"}
          size="md"
          variant="inverted"
        />
        <div className={styles.footerInfo}>
          <div className={styles.footerName}>{user?.username || "—"}</div>
          <div className={styles.footerEmail}>{user?.email || "—"}</div>
        </div>
        <button
          className={styles.settingsBtn}
          onClick={() => router.push("/settings")}
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
