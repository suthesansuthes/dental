import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/api/auth/me');
          setUser(data.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      const { user, token } = data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      // Handle validation errors with multiple error messages
      let message = 'Registration failed';
      if (error.response?.data?.errors) {
        // Multiple validation errors - show first 3
        const validationErrors = error.response.data.errors;
        message = validationErrors
          .slice(0, 3)
          .map(err => err.message)
          .join('; ');
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      console.error('Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        message,
      });
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await axios.post('/api/auth/login', credentials);
      const { user, token } = data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      // Handle validation errors with multiple error messages
      let message = 'Login failed';
      if (error.response?.data?.errors) {
        // Multiple validation errors - show first 3
        const validationErrors = error.response.data.errors;
        message = validationErrors
          .slice(0, 3)
          .map(err => err.message)
          .join('; ');
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message,
      });
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const { data } = await axios.post('/api/auth/admin/login', credentials);
      const { user, token } = data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Admin login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', profileData);
      setUser(data.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    adminLogin,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPatient: user?.role === 'patient',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
