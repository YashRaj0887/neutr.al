import styles from "./Avatar.module.css";

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "inverted" | "outlined";
  isOnline?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({
  username,
  avatarUrl,
  size = "md",
  variant = "inverted",
  isOnline,
}: AvatarProps) {
  const initials = getInitials(username);

  const avatar = (
    <div className={`${styles.avatar} ${styles[size]} ${styles[variant]}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className={styles.avatarImage} />
      ) : (
        initials
      )}
    </div>
  );

  if (isOnline !== undefined) {
    return (
      <div className={styles.wrapper}>
        {avatar}
        <span
          className={styles.onlineDot}
          data-online={isOnline ? "true" : "false"}
        />
      </div>
    );
  }

  return avatar;
}
