/**
 * Validate password meets requirements:
 * - At least 6 characters long
 * - Contains at least one letter
 * - Contains at least one number
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' };
  }
  
  return { valid: true, message: 'Password is valid' };
};
