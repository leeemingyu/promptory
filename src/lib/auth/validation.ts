export const isValidEmail = (email: string) => {
  const trimmed = email.trim();
  return trimmed.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export const isValidPassword = (password: string) => password.length >= 6;
