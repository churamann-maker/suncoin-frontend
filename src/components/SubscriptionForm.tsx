import { useState, FormEvent, useEffect } from 'react';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { signUp, verifyPhone, completeSignup, getPopularCoins, ApiError } from '../services/api';
import { validateSignupForm, validateVerificationCode, hasErrors, ValidationErrors } from '../utils/validation';
import { SubscriptionResponse, CoinInfo } from '../types/subscription';
import styles from './SubscriptionForm.module.css';

type Step = 'signup' | 'verify' | 'coins';

interface SubscriptionFormProps {
  onSuccess: (response: SubscriptionResponse) => void;
  onSwitchToSignIn?: () => void;
}

export function SubscriptionForm({ onSuccess, onSwitchToSignIn }: SubscriptionFormProps) {
  const [step, setStep] = useState<Step>('signup');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['BTC']);
  const [availableCoins, setAvailableCoins] = useState<CoinInfo[]>([]);
  const [cognitoUserId, setCognitoUserId] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === 'coins') {
      loadCoins();
    }
  }, [step]);

  const loadCoins = async () => {
    try {
      const coins = await getPopularCoins(100);
      setAvailableCoins(coins);
    } catch (error) {
      console.error('Failed to load coins:', error);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateSignupForm(phoneNumber, name, password);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp({ phoneNumber, password, name });
      if (response.success) {
        setCognitoUserId(response.cognitoUserId || '');
        // Skip verification step - users are auto-confirmed
        setStep('coins');
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

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setErrors({ verificationCode: codeError });
      return;
    }
    setErrors({});

    setIsLoading(true);

    try {
      const response = await verifyPhone({ phoneNumber, verificationCode });
      if (response.success) {
        setStep('coins');
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

  const handleCoinSelection = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

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
      const response = await completeSignup({
        phoneNumber,
        name,
        verificationCode: cognitoUserId,
        selectedCoins,
      });
      onSuccess(response);
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

  const toggleCoin = (symbol: string) => {
    if (symbol === 'BTC') return; // BTC is always selected

    setSelectedCoins(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(c => c !== symbol);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, symbol];
    });
  };

  if (step === 'verify') {
    return (
      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.stepHeader}>
          <h3>Verify Your Phone</h3>
          <p>Enter the 6-digit code sent to {phoneNumber}</p>
        </div>

        <div className={styles.fields}>
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={errors.verificationCode}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </div>

        {apiError && (
          <div className={styles.apiError} role="alert">
            <span className={styles.errorIcon}>!</span>
            <span>{apiError}</span>
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          Verify
        </Button>
      </form>
    );
  }

  if (step === 'coins') {
    return (
      <form onSubmit={handleCoinSelection} className={styles.form}>
        <div className={styles.stepHeader}>
          <h3>Select Your Coins</h3>
          <p>Choose up to 10 cryptocurrencies to track ({selectedCoins.length}/10 selected)</p>
        </div>

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

        {apiError && (
          <div className={styles.apiError} role="alert">
            <span className={styles.errorIcon}>!</span>
            <span>{apiError}</span>
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          Complete Signup
        </Button>

        <p className={styles.hint}>
          * BTC is required and cannot be deselected
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignup} className={styles.form}>
      <div className={styles.fields}>
        <Input
          label="Name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isLoading}
          autoComplete="name"
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={errors.phoneNumber}
          disabled={isLoading}
          autoComplete="tel"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          <span className={styles.errorIcon}>!</span>
          <span>{apiError}</span>
        </div>
      )}

      <Button type="submit" isLoading={isLoading}>
        Sign Up
      </Button>

      <p className={styles.hint}>
        Enter your phone in E.164 format (e.g., +1234567890)
      </p>

      {onSwitchToSignIn && (
        <p className={styles.switchLink}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToSignIn} className={styles.linkButton}>
            Sign In
          </button>
        </p>
      )}
    </form>
  );
}
