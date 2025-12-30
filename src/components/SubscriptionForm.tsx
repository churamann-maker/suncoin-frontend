import { useState, FormEvent } from 'react';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { subscribeUser, ApiError } from '../services/api';
import { validateForm, hasErrors, ValidationErrors } from '../utils/validation';
import { SubscriptionResponse } from '../types/subscription';
import styles from './SubscriptionForm.module.css';

interface SubscriptionFormProps {
  onSuccess: (response: SubscriptionResponse) => void;
}

export function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    const validationErrors = validateForm(phoneNumber, name);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    // Submit to API
    setIsLoading(true);

    try {
      const response = await subscribeUser({ phoneNumber, name });
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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          <span className={styles.errorIcon}>!</span>
          <span>{apiError}</span>
        </div>
      )}

      <Button type="submit" isLoading={isLoading}>
        Subscribe
      </Button>

      <p className={styles.hint}>
        Enter your phone in E.164 format (e.g., +1234567890)
      </p>
    </form>
  );
}
