const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getAccessToken() {
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function setTokens(tokens) {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(BASE + '/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

async function request(url, options = {}) {
  let token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(BASE + url, { ...options, headers });

  // If 401, try refreshing the token once
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(BASE + url, { ...options, headers });
    }
  }

  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || res.statusText);
  }
  return res.json();
}

export const auth = {
  session: () => request('/auth/session/'),
  login: async (username, password) => {
    const data = await request('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (data.tokens) setTokens(data.tokens);
    return data;
  },
  register: async (username, password) => {
    const data = await request('/auth/register/', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (data.tokens) setTokens(data.tokens);
    return data;
  },
  logout: () => {
    clearTokens();
    return Promise.resolve({ message: 'Logged out' });
  },
  profile: () => request('/auth/profile/'),
  updateProfile: (data) => request('/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const tests = {
  submit: (data) => request('/tests/submit/', { method: 'POST', body: JSON.stringify(data) }),
  history: () => request('/tests/history/'),
  clearHistory: () => request('/tests/history/clear/', { method: 'DELETE' }),
  stats: () => request('/tests/stats/'),
  achievements: () => request('/tests/achievements/'),
  titles: () => request('/tests/titles/'),
};

export const shop = {
  items: () => request('/shop/items/'),
  buy: (item_id) => request('/shop/buy/', { method: 'POST', body: JSON.stringify({ item_id }) }),
  equip: (item_id) => request('/shop/equip/', { method: 'POST', body: JSON.stringify({ item_id }) }),
};

export const clans = {
  list: () => request('/clans/list/'),
  mine: () => request('/clans/my/'),
  create: (name) => request('/clans/create/', { method: 'POST', body: JSON.stringify({ name }) }),
  join: (clan_id) => request('/clans/join/', { method: 'POST', body: JSON.stringify({ clan_id }) }),
  leave: () => request('/clans/leave/', { method: 'POST' }),
};

export const leaderboard = {
  global: () => request('/leaderboard/global/'),
  submitScore: (data) => request('/leaderboard/submit/', { method: 'POST', body: JSON.stringify(data) }),
};
