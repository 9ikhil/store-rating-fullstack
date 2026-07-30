const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least one uppercase letter and one special character, length checked separately
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/;

function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required';
  if (name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Email is not valid';
  return null;
}

function validateAddress(address) {
  if (address == null) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!PASSWORD_UPPERCASE.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!PASSWORD_SPECIAL.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
};
