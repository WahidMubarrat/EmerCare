import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 with salt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password with salt
 */
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password (salt:hash format)
 * @returns {boolean} True if passwords match
 */
export const comparePassword = (password, hashedPassword) => {
  const [salt, hash] = hashedPassword.split(':');
  const hashToCompare = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashToCompare;
};

/**
 * Validate password meets requirements
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' };
  }
  
  return { valid: true, message: 'Password is valid' };
};
