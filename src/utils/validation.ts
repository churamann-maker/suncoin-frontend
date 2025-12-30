// E.164 format: +[country code][number], 1-15 digits total
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function validatePhoneNumber(phone: string): string | null {
  if (!phone) {
    return 'Phone number is required';
  }
  if (!phone.startsWith('+')) {
    return 'Phone number must start with + (e.g., +1234567890)';
  }
  if (!E164_REGEX.test(phone)) {
    return 'Invalid phone format. Use E.164 format (e.g., +1234567890)';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return null;
}

export interface ValidationErrors {
  phoneNumber?: string;
  name?: string;
}

export function validateForm(phoneNumber: string, name: string): ValidationErrors {
  const errors: ValidationErrors = {};

  const phoneError = validatePhoneNumber(phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
