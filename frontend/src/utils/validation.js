export const isNonEmpty = (value) => String(value || '').trim().length > 0;

export const isValidEmail = (email) => {
  if (!isNonEmpty(email)) return false;
  // Basic RFC5322 compliant-ish regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(String(email).toLowerCase());
};

export const isStrongPassword = (password, { min = 6, requireNumber = false, requireSpecial = false } = {}) => {
  if (typeof password !== 'string' || password.length < min) return false;
  if (requireNumber && !/[0-9]/.test(password)) return false;
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>\-_[\]\\/]/.test(password)) return false;
  return true;
};

export const isValidMobile = (value) => /^[0-9]{10}$/.test(String(value || '').trim());

export const validateImageFile = (file, { maxMB = 5, allowedTypes = ['image/jpeg','image/png','image/webp','image/jpg','image/gif'] } = {}) => {
  if (!file) return { ok: false, message: 'No file selected' };
  const typeOk = allowedTypes.includes(file.type);
  if (!typeOk) return { ok: false, message: 'Only image files (JPG, PNG, WEBP, GIF) are allowed' };
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) return { ok: false, message: `File too large. Max ${maxMB} MB allowed` };
  return { ok: true };
};

export const trimObjectStrings = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (typeof v === 'string') out[k] = v.trim();
    else if (v && typeof v === 'object') out[k] = trimObjectStrings(v);
  });
  return out;
};
