import styles from './Logo.module.css';

export function Logo() {
  return (
    <div className={styles.logo}>
      <div className={styles.iconWrapper}>
        <span className={styles.sunIcon}>&#9728;</span>
      </div>
      <h1 className={styles.title}>SunCoin</h1>
      <p className={styles.tagline}>Crypto Price Alerts</p>
    </div>
  );
}
