"use client";

import { useChatStore } from "@/stores/chatStore";
import styles from "./rooms.module.css";

export default function RoomsPage() {
  const { rooms } = useChatStore();

  const groupCount = rooms.filter((r) => r.type === "group").length;
  const dmCount = rooms.filter((r) => r.type === "dm").length;

  return (
    <div className={styles.container}>
      <div className={styles.heroBlock}>
        <div className={styles.heroCircle}>
          <span className={styles.heroIcon}>◈</span>
          <div className={styles.orbitDot} />
          <div className={styles.orbitDot} />
          <div className={styles.orbitDot} />
        </div>
      </div>

      <h1 className={styles.title}>Welcome to neutr.al</h1>
      <p className={styles.subtitle}>
        Select a conversation from the sidebar or create a new room to get
        started.
      </p>

      {rooms.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{groupCount}</div>
            <div className={styles.statLabel}>Groups</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{dmCount}</div>
            <div className={styles.statLabel}>Direct</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{rooms.length}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>
      )}

      <p className={styles.hint}>
        Press <span className={styles.hintKey}>+ New Room</span> in the sidebar
        to create a room
      </p>
    </div>
  );
}
