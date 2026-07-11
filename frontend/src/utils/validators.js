export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => {
  const strength = [];
  if (password.length >= 8) strength.push('length');
  if (/[A-Z]/.test(password)) strength.push('upper');
  if (/[0-9]/.test(password)) strength.push('number');
  if (/[^A-Za-z0-9]/.test(password)) strength.push('special');
  return { score: strength.length, checks: strength };
};

export const passwordStrengthLabel = (score) => {
  if (score <= 1) return { label: 'Weak', color: '#ba1a1a' };
  if (score === 2) return { label: 'Fair', color: '#e67e22' };
  if (score === 3) return { label: 'Good', color: '#f39c12' };
  return { label: 'Strong', color: '#27ae60' };
};
