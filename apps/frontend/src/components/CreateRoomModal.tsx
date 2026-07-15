"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import styles from "./CreateRoomModal.module.css";

interface CreateRoomModalProps {
  onClose: () => void;
}

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { createRoom } = useChatStore();

  const [type, setType] = useState<"group" | "dm">("group");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIdsRaw, setMemberIdsRaw] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const memberIds = memberIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (memberIds.length === 0) {
      setError("Add at least one member ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom(type, memberIds, name, description);
      onClose();
      router.push(`/rooms/${room._id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>New Room</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Type selector */}
            <div className={styles.fieldGroup}>
              <label className="label">Type</label>
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={styles.typeOption}
                  data-selected={type === "group" ? "true" : "false"}
                  onClick={() => setType("group")}
                >
                  ◻ Group
                </button>
                <button
                  type="button"
                  className={styles.typeOption}
                  data-selected={type === "dm" ? "true" : "false"}
                  onClick={() => setType("dm")}
                >
                  ◆ Direct
                </button>
              </div>
            </div>

            {/* Name (group only) */}
            {type === "group" && (
              <div className={styles.fieldGroup}>
                <label className="label" htmlFor="room-name">
                  Room Name
                </label>
                <input
                  id="room-name"
                  className="input-field"
                  type="text"
                  placeholder="engineering-team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                />
              </div>
            )}

            {/* Description (group only) */}
            {type === "group" && (
              <div className={styles.fieldGroup}>
                <label className="label" htmlFor="room-desc">
                  Description
                </label>
                <input
                  id="room-desc"
                  className="input-field"
                  type="text"
                  placeholder="What's this room about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>
            )}

            {/* Member IDs */}
            <div className={styles.fieldGroup}>
              <label className="label" htmlFor="room-members">
                Member IDs
              </label>
              <input
                id="room-members"
                className="input-field"
                type="text"
                placeholder="user_id_1, user_id_2"
                value={memberIdsRaw}
                onChange={(e) => setMemberIdsRaw(e.target.value)}
              />
              <span className={styles.memberHint}>
                Comma-separated MongoDB ObjectIds
              </span>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
