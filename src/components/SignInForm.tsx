import { useState, FormEvent } from 'react';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { signIn, ApiError } from '../services/api';
import { validatePhoneNumber, validatePassword, hasErrors, ValidationErrors } from '../utils/validation';
import { AuthResponse } from '../types/subscription';
import styles from './SubscriptionForm.module.css';

interface SignInFormProps {
  onSuccess: (response: AuthResponse) => void;
  onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors: ValidationErrors = {};

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) validationErrors.phoneNumber = phoneError;

    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signIn({ phoneNumber, password });
      if (response.success) {
        onSuccess(response);
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.stepHeader}>
        <h3>Welcome Back</h3>
        <p>Sign in to manage your crypto notifications</p>
      </div>

      <div className={styles.fields}>
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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          <span className={styles.errorIcon}>!</span>
          <span>{apiError}</span>
        </div>
      )}

      <Button type="submit" isLoading={isLoading}>
        Sign In
      </Button>

      {onSwitchToSignUp && (
        <p className={styles.switchLink}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignUp} className={styles.linkButton}>
            Sign Up
          </button>
        </p>
      )}
    </form>
  );
}
