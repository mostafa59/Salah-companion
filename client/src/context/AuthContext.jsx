import { createContext, useState, useEffect, useContext } from 'react'; // Added useContext
import authService from '../services/api'; // Corrected to one 'i'

// 1. Create Context
export const AuthContext = createContext();

// 2. Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
    return response;
  };

   const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error("Register Context Error:", error);
      const msg = error.response?.data?.msg || "Server Error";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook (This is what Register.jsx is looking for!)
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
