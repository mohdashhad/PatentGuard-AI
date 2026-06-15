// ============================================================
// VALIDATION UTILITIES
// ============================================================

// RFC-5322-ish simplified email regex (good enough for client-side checks)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Username: 3-20 chars, letters/numbers/underscore/dot, must start with a letter
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

/**
 * Validates the "identifier" field which can be either
 * a username or an email address.
 */
export function validateIdentifier(value) {
  const trimmed = (value || "").trim();

  if (!trimmed) {
    return "Username or email is required.";
  }

  if (trimmed.length > 100) {
    return "This field is too long.";
  }

  // If it contains an "@", validate as email
  if (trimmed.includes("@")) {
    if (!EMAIL_REGEX.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    return null;
  }

  // Otherwise validate as username
  if (!USERNAME_REGEX.test(trimmed)) {
    return "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, dots, or underscores.";
  }

  return null;
}

/**
 * Validates password strength.
 * Requires: min 8 chars, at least one uppercase, one lowercase,
 * one digit, and one special character.
 */
export function validatePassword(value, { isLogin = false } = {}) {
  if (!value) {
    return "Password is required.";
  }

  if (isLogin) {
    // For login we only enforce a minimum length to avoid leaking
    // policy details to attackers; full strength rules apply on signup.
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  }

  if (value.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (value.length > 128) {
    return "Password is too long (max 128 characters).";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(value)) {
    return "Password must contain at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

/**
 * Calculates a 0-4 strength score for the password meter.
 */
export function getPasswordStrength(value) {
  if (!value) return 0;

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;

  return Math.min(score, 4);
}

export const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
export const STRENGTH_COLORS = [
  "#E24B4A", // very weak - red
  "#E2924B", // weak - orange
  "#BA7517", // fair - amber
  "#7A69E6", // good - purple
  "#639922", // strong - green
];

/**
 * Basic sanitization: strips angle brackets to mitigate
 * trivial HTML/script injection from form fields.
 */
export function sanitizeInput(value) {
  return (value || "").replace(/[<>]/g, "").trim();
}
