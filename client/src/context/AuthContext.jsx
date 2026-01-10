import { createContext, useState, useEffect, useContext } from 'react'; // Added useContext
import authService from '../services/api'; // Corrected to one 'i'

// 1. Create Context
export const AuthContext = createContext();

// 2. Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadUser = async () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Fetch fresh user data from server to get friendCode
      try {
        const response = await fetch(`http://localhost:5000/api/users/${parsedUser.id}`);
        const freshUserData = await response.json();
        
        // Update user with fresh data including friendCode
        setUser(freshUserData);
        
        // Update localStorage with complete data
        localStorage.setItem('user', JSON.stringify(freshUserData));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
    setLoading(false);
  };
  
  loadUser();
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
