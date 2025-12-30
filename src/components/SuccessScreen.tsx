import { SubscriptionResponse } from '../types/subscription';
import { Button } from './common/Button';
import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
  response: SubscriptionResponse;
  onReset: () => void;
}

export function SuccessScreen({ response, onReset }: SuccessScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.checkmark}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2 className={styles.title}>You're In!</h2>

      <p className={styles.message}>{response.message}</p>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Phone</span>
          <span className={styles.value}>{response.phoneNumber}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Subscribed</span>
          <span className={styles.value}>
            {new Date(response.subscribedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <p className={styles.note}>
        You'll receive daily crypto price updates via SMS.
      </p>

      <Button variant="secondary" onClick={onReset}>
        Subscribe Another
      </Button>
    </div>
  );
}
