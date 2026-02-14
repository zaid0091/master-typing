const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function request(url, options = {}) {
  const csrfToken = getCookie('csrftoken');
  const res = await fetch(BASE + url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || res.statusText);
  }
  return res.json();
}

export const auth = {
  session: () => request('/auth/session/'),
  login: (username, password) => request('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username, password) => request('/auth/register/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout/', { method: 'POST' }),
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
