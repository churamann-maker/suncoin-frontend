import { useState, useEffect, FormEvent } from 'react';
import { Button } from './common/Button';
import { getPopularCoins, updateCoins, ApiError } from '../services/api';
import { Subscriber, CoinInfo } from '../types/subscription';
import styles from './SubscriptionForm.module.css';

interface DashboardProps {
  subscriber: Subscriber;
  accessToken: string;
  onLogout: () => void;
  onUpdate: (subscriber: Subscriber) => void;
}

export function Dashboard({ subscriber, accessToken, onLogout, onUpdate }: DashboardProps) {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(subscriber.selectedCoins || ['BTC']);
  const [availableCoins, setAvailableCoins] = useState<CoinInfo[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);

  // Sync selectedCoins when subscriber data changes (e.g., after sign-in or update)
  useEffect(() => {
    if (subscriber.selectedCoins && subscriber.selectedCoins.length > 0) {
      setSelectedCoins(subscriber.selectedCoins);
    }
  }, [subscriber.selectedCoins]);

  useEffect(() => {
    loadCoins();
  }, []);

  const loadCoins = async () => {
    try {
      const coins = await getPopularCoins(100);
      setAvailableCoins(coins);
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const toggleCoin = (symbol: string) => {
    if (symbol === 'BTC') return;

    setSelectedCoins(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(c => c !== symbol);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, symbol];
    });
    setSuccessMessage(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (selectedCoins.length === 0) {
      setApiError('Please select at least one coin');
      return;
    }

    if (selectedCoins.length > 10) {
      setApiError('You can select up to 10 coins');
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateCoins(subscriber.phoneNumber, selectedCoins, accessToken);
      if (response.success && response.subscriber) {
        onUpdate(response.subscriber);
        setSuccessMessage('Your coin selections have been updated!');
      } else {
        setApiError(response.message);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.stepHeader}>
        <h3>Welcome, {subscriber.name}!</h3>
        <p>Manage your cryptocurrency notifications</p>
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.stepHeader}>
          <p>Select up to 10 cryptocurrencies ({selectedCoins.length}/10 selected)</p>
        </div>

        {isLoadingCoins ? (
          <p style={{ textAlign: 'center' }}>Loading coins...</p>
        ) : (
          <div className={styles.coinGrid}>
            {availableCoins.map(coin => (
              <button
                key={coin.symbol}
                type="button"
                className={`${styles.coinChip} ${selectedCoins.includes(coin.symbol) ? styles.selected : ''} ${coin.symbol === 'BTC' ? styles.locked : ''}`}
                onClick={() => toggleCoin(coin.symbol)}
                disabled={coin.symbol === 'BTC'}
              >
                {coin.symbol}
                {coin.symbol === 'BTC' && <span className={styles.lockIcon}>*</span>}
              </button>
            ))}
          </div>
        )}

        {apiError && (
          <div className={styles.apiError} role="alert">
            <span className={styles.errorIcon}>!</span>
            <span>{apiError}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 'var(--spacing-md)',
            background: 'var(--color-success-bg, #d4edda)',
            border: '1px solid var(--color-success, #28a745)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success, #28a745)',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>

        <p className={styles.hint}>
          * BTC is required and cannot be deselected
        </p>
      </form>

      <button
        type="button"
        onClick={onLogout}
        className={styles.linkButton}
        style={{ marginTop: 'var(--spacing-lg)', display: 'block', width: '100%', textAlign: 'center' }}
      >
        Sign Out
      </button>
    </div>
  );
}
