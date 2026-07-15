import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authWrapper}>
      {/* Geometric decorations */}
      <div className={styles.geoTopLeft} />
      <div className={styles.geoTopRight} />
      <div className={styles.geoBottomLeft} />
      <div className={styles.geoBottomRight} />
      <div className={styles.geoCross} />
      <div className={styles.geoLineH} />
      <div className={styles.geoLineV} />
      <div className={`${styles.geoDot} ${styles.geoDot1}`} />
      <div className={`${styles.geoDot} ${styles.geoDot2}`} />
      <div className={`${styles.geoDot} ${styles.geoDot3}`} />

      <div className={styles.authCard}>
        <div className={styles.authCardInner}>
          {/* Brand */}
          <div className={styles.brand}>
            <h1 className={styles.brandName}>
              neutr<span className={styles.brandDot} />al
            </h1>
            <p className={styles.brandTagline}>real-time · encrypted · yours</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
