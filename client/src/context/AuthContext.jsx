import { createContext, useState, useEffect, useContext, useRef } from 'react';
import authService from '../services/api';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = 'https://zany-space-system-64pwg7rrrp2r6p5-5000.app.github.dev/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // ← NEW: Prevent double initialization

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        try {
          const response = await fetch(`${API_BASE}/users/${parsedUser.id}`);
          
          if (!response.ok) {
            console.error('Failed to fetch user data: Server returned', response.status);
            setLoading(false);
            return;
          }
          
          const freshUserData = await response.json();
          setUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // ← FIXED: Socket Connection with Ref Protection
  useEffect(() => {
    // Prevent double initialization
    if (!user || !user.id || socketRef.current) {
      return;
    }

    console.log('🔌 Initiating socket connection for user:', user.id);
    
    const newSocket = io('https://zany-space-system-64pwg7rrrp2r6p5-5000.app.github.dev', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Store in ref to prevent re-initialization
    socketRef.current = newSocket;
    
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully!');
      console.log('🆔 Socket ID:', newSocket.id);
      console.log('📤 Joining room for user ID:', user.id);
      
      newSocket.emit('join', String(user.id));
      console.log('✅ Join event emitted');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected. Reason:', reason);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      console.log('📤 Re-joining room for user ID:', user.id);
      newSocket.emit('join', String(user.id));
    });
    
    newSocket.on('receive_nudge', (data) => {
      console.log('📩 === NUDGE RECEIVED ===');
      console.log('📦 Data:', data);
      console.log('👤 From:', data.from);
      console.log('💬 Message:', data.message);
      
      try {
        const audio = new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg');
        audio.volume = 0.5;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🔊 Notification sound played successfully!');
            })
            .catch(error => {
              console.log('⚠️ Sound blocked by browser:', error.message);
            });
        }
      } catch (error) {
        console.log('❌ Audio playback error:', error);
      }

      toast.success(data.message, {
        duration: 5000,
        icon: '🔔',
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
        }
      });
      
      console.log('✅ Toast notification displayed');
      console.log('========================\n');
    });
    
    setSocket(newSocket);
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]); // ← REMOVED socket from dependencies

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
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, socket }}>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
