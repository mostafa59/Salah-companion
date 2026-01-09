import axios from 'axios';

// YOUR CODESPACE URL (Double check this matches your setup)
const API_BASE = 'https://zany-space-system-64pwg7rrrp2r6p5-5000.app.github.dev/api'; 

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

  togglePrayer: async (userId, date, prayerName, status) => {
    const response = await axios.post(`${API_BASE}/prayers/toggle`, {
      userId,
      date,
      prayerName,
      status
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
    const response = await axios.get(`${API_BASE}/prayers/streak/count?userId=${id}&currentDate=${date}`);
    return response.data;
  },
  // --- HISTORY (Calendar) ---
  getHistory: async (userId) => {
    // GET /api/prayers/history/all?userId=123
    const response = await axios.get(`${API_BASE}/prayers/history/all?userId=${userId}`);
    return response.data;
  },

  // --- QADA (Missed Prayers) - NEW ⚡ ---
  getQada: async (userId) => {
    // GET /api/qada?userId=123
    const response = await axios.get(`${API_BASE}/qada?userId=${userId}`);
    return response.data;
  },

  updateQada: async (userId, prayerName, amount) => {
    // POST /api/qada/update
    const response = await axios.post(`${API_BASE}/qada/update`, {
      userId,
      prayerName,
      amount
    });
    return response.data;
  }
};

export default authService;
