export function saveHFToken(token: string) {
  if (!token || token.includes('demo')) return;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hf_saved_token', token);
    } catch (e) {}
    return;
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), '.hf_token.json');
    fs.writeFileSync(filePath, JSON.stringify({ token, updatedAt: new Date().toISOString() }), 'utf-8');
  } catch (err) {
    console.error('Failed to save HF token to disk:', err);
  }
}

export function getSavedHFToken(): string {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('hf_saved_token') || '';
    } catch (e) {
      return '';
    }
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), '.hf_token.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data && data.token) {
        return data.token;
      }
    }
  } catch (err) {
    console.error('Failed to read HF token from disk:', err);
  }
  return process.env.HF_TOKEN || '';
}
