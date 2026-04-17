/**
 * Password Strength Validator
 * Provides password validation and strength checking
 */

export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length === 0) {
    return { score: 0, level: 'weak', feedback: ['Password is required'], isValid: false };
  }

  if (password.length < 8) {
    feedback.push('At least 8 characters required');
  } else {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters');
  }

  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score = Math.max(0, score - 1);
  }

  if (/^[0-9]+$/.test(password)) {
    feedback.push('Use letters, not just numbers');
    score = 0;
  }

  if (/^[a-z]+$/.test(password)) {
    feedback.push('Add numbers and special characters');
    score = Math.max(1, score - 2);
  }

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 5) level = 'strong';
  else if (score >= 4) level = 'good';
  else if (score >= 2) level = 'fair';

  // Minimum requirements: at least 8 chars, uppercase, lowercase, number
  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  // Remove duplicates from feedback
  const uniqueFeedback = [...new Set(feedback)];

  return {
    score: Math.min(score, 4),
    level,
    feedback: uniqueFeedback,
    isValid,
  };
}

export function getStrengthColor(level: string): string {
  switch (level) {
    case 'strong':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'good':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'fair':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'weak':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}
