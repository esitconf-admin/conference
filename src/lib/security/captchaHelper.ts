/**
 * Security & CAPTCHA Utilities
 * Provides password complexity checks, input sanitization, and CAPTCHA challenge validation.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push('Must be at least 8 characters long');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Must include at least one uppercase letter (A-Z)');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Must include at least one lowercase letter (a-z)');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Must include at least one number (0-9)');
  } else {
    score++;
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push('Must include at least one special character (!@#$%^&*)');
  } else {
    score++;
  }

  return {
    isValid: feedback.length === 0,
    score: Math.min(score, 4),
    feedback
  };
}

export interface MathCaptchaChallenge {
  question: string;
  expectedAnswer: number;
}

export function generateMathCaptcha(): MathCaptchaChallenge {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  if (op === '+') {
    return {
      question: `What is ${num1} + ${num2}?`,
      expectedAnswer: num1 + num2
    };
  } else {
    const max = Math.max(num1, num2);
    const min = Math.min(num1, num2);
    return {
      question: `What is ${max} - ${min}?`,
      expectedAnswer: max - min
    };
  }
}

/**
 * Server-side reCAPTCHA v3 / Turnstile token verifier
 */
export async function verifyRemoteCaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey || secretKey.startsWith('your_')) {
    // If not configured in dev, accept token
    return true;
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
    });
    const data = await res.json();
    return Boolean(data.success && (data.score === undefined || data.score >= 0.5));
  } catch (err) {
    console.error('Remote captcha check error:', err);
    return false;
  }
}
