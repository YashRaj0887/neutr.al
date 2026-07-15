"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { disconnectSocket } from "@/lib/socket";
import Avatar from "@/components/Avatar";
import api from "@/lib/api";
import toast from "react-hot-toast";
import styles from "./settings.module.css";

interface Profile {
  bio: string;
  avatarUrl: string;
  statusMessage: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [bio, setBio] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (user?.id) {
      api
        .get(`/profiles/${user.id}`)
        .then(({ data }: { data: Profile }) => {
          setBio(data.bio || "");
          setStatusMessage(data.statusMessage || "");
          setProfileLoaded(true);
        })
        .catch(() => {
          setProfileLoaded(true);
        });
    }
  }, [user?.id]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/profiles/me", { bio, statusMessage });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    router.push("/auth/login");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Settings</h1>
      <p className={styles.pageSubtitle}>Manage your account and preferences</p>

      {/* ── Profile Section ──────────────────────────────────────────── */}
      <form className={styles.section} onSubmit={handleSaveProfile}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>◉</div>
          <span className={styles.sectionTitle}>Profile</span>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.avatarRow}>
            <Avatar
              username={user?.username || "?"}
              size="xl"
              variant="inverted"
            />
            <div className={styles.avatarActions}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                {user?.username}
              </span>
              <span className={styles.avatarHint}>
                Avatar changes coming soon
              </span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className="label" htmlFor="settings-bio">
              Bio
            </label>
            <textarea
              id="settings-bio"
              className="input-field"
              placeholder="Tell people about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className="label" htmlFor="settings-status">
              Status Message
            </label>
            <input
              id="settings-status"
              className="input-field"
              type="text"
              placeholder="What are you up to?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              maxLength={80}
            />
          </div>

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSaving || !profileLoaded}
          >
            {isSaving ? "Saving…" : "Save Changes →"}
          </button>
        </div>
      </form>

      {/* ── Account Section ──────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>◆</div>
          <span className={styles.sectionTitle}>Account</span>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <label className="label">Email</label>
            <div className={styles.fieldValue}>{user?.email || "—"}</div>
          </div>
          <div className={styles.fieldGroup}>
            <label className="label">Role</label>
            <div className={styles.fieldValue}>{user?.role || "user"}</div>
          </div>
          <div className={styles.fieldGroup}>
            <label className="label">User ID</label>
            <div className={styles.fieldValue}>{user?.id || "—"}</div>
          </div>
        </div>
      </div>

      {/* ── Appearance Section ────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>◐</div>
          <span className={styles.sectionTitle}>Appearance</span>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <label className="label">Theme</label>
            <div className={styles.fieldValue}>
              Black &amp; White — the only option
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────── */}
      <div className={`${styles.section} ${styles.dangerSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>⚠</div>
          <span className={styles.sectionTitle}>Session</span>
        </div>
        <div className={styles.sectionBody}>
          <p style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)" }}>
            This will end your current session and redirect you to the login
            page.
          </p>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Sign Out →
          </button>
        </div>
      </div>

      <p className={styles.versionTag}>neutr.al v0.1.0 · built different</p>
    </div>
  );
}
