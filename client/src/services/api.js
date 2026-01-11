import axios from 'axios';

// YOUR CODESPACE URL
const API_BASE = 'https://zany-space-system-64pwg7rrrp2r6p5-5000.app.github.dev/api';

// Attach token automatically (safe even if backend doesn't require it yet)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const authService = {
  // --- AUTHENTICATION ---
  register: async (userData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const response = await axios.post(`${API_BASE}/auth/register`, userData, config);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  login: async (email, password) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password }, config);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // --- PRAYERS (The Checkboxes) ---
  getTodayPrayers: async (userId, date) => {
    const response = await axios.get(`${API_BASE}/prayers/${date}?userId=${userId}`);
    return response.data;
  },

  togglePrayer: async (
    userId,
    date,
    prayerName,
    status,
    location = 'home',
    prayerStatus = null
  ) => {
    const response = await axios.post(`${API_BASE}/prayers/toggle`, {
      userId,
      date,
      prayerName,
      status,
      location,
      prayerStatus
    });
    return response.data;
  },

  // --- MOOD TRACKER ---
  updateMood: async (userId, date, mood) => {
    const response = await axios.post(`${API_BASE}/prayers/mood`, {
      userId,
      date,
      mood
    });
    return response.data;
  },

  // --- STREAK COUNTER ---
  getStreak: async (id, date) => {
    const response = await axios.get(
      `${API_BASE}/prayers/streak/count?userId=${id}&currentDate=${date}`
    );
    return response.data;
  },

  // --- HISTORY (Calendar) ---
  getHistory: async (userId) => {
    const response = await axios.get(`${API_BASE}/prayers/history/all?userId=${userId}`);
    return response.data;
  },

  // --- KAFFARAH SUMMARY ---
  getKaffarahSummary: async (userId) => {
    const response = await axios.get(`${API_BASE}/prayers/kaffarah/summary?userId=${userId}`);
    return response.data;
  },

  // ==========================================
  // QADA (make it match your backend)
  // ==========================================
  // Your current backend supports:
  // GET  /api/prayers/qada/status?userId=...
  // POST /api/prayers/qada/add
  // POST /api/prayers/qada/complete

  getQada: async (userId) => {
    const response = await axios.get(`${API_BASE}/prayers/qada/status?userId=${userId}`);
    return response.data; // returns { outstanding, totalOwed, completed, ... } depending on your User model
  },

  // Keep your Missed page API (plus/minus) behavior:
  // amount > 0 => add
  // amount < 0 => complete
  updateQada: async (userId, prayerName, amount) => {
    if (amount > 0) {
      const response = await axios.post(`${API_BASE}/prayers/qada/add`, {
        userId,
        prayerName,
        amount
      });
      return response.data;
    } else {
      const response = await axios.post(`${API_BASE}/prayers/qada/complete`, {
        userId,
        prayerName,
        amount: Math.abs(amount)
      });
      return response.data;
    }
  },

  // --- WEEKLY STATS ---
  getWeeklyStats: async (userId) => {
    const response = await axios.get(`${API_BASE}/prayers/stats/weekly?userId=${userId}`);
    return response.data;
  },

  // --- MONTHLY INSIGHTS ---
  getMonthlyInsights: async (userId, year, month) => {
    const response = await axios.get(
      `${API_BASE}/prayers/insights/monthly?userId=${userId}&year=${year}&month=${month}`
    );
    return response.data;
  },

  // --- CHALLENGES ---
  startChallenge: async (userId, title) => {
    const response = await axios.post(`${API_BASE}/prayers/challenges/start`, {
      userId,
      title
    });
    return response.data;
  },

  checkChallengeProgress: async (userId, challengeId) => {
    const response = await axios.post(`${API_BASE}/prayers/challenges/check`, {
      userId,
      challengeId
    });
    return response.data;
  },

  getActiveChallenges: async (userId) => {
    const response = await axios.get(`${API_BASE}/prayers/challenges/active?userId=${userId}`);
    return response.data;
  },

  deleteChallenge: async (userId, challengeId) => {
    const response = await axios.delete(
      `${API_BASE}/prayers/challenges/${challengeId}?userId=${userId}`
    );
    return response.data;
  },

  // --- USER STATS ---
  getUserStats: async (userId) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/stats`);
    return response.data;
  },

  // --- NOTIFICATIONS ---
  updateNotificationPreferences: async (userId, preferences) => {
    const response = await axios.put(
      `${API_BASE}/users/${userId}/notification-preferences`,
      preferences
    );
    return response.data;
  }
};

export default authService;
