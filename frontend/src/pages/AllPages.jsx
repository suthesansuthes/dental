// This file contains all the main pages for the application
// Extract each component to separate files for production use

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, slotAPI, appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  LogOut,
  Home as HomeIcon,
  Users,
  ClipboardList,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';

// ============================================
// SHARED COMPONENTS
// ============================================

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              🦷 Dental Clinic
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/doctors"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Doctors
                    </Link>
                    <Link
                      to="/patient/appointments"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      My Appointments
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Patient Login
                </Link>
                <Link to="/admin/login" className="btn-primary">
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="spinner"></div>
  </div>
);

// ============================================
// HOME PAGE
// ============================================

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to Dental Clinic
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Book your dental appointments online with our experienced
              professionals
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link
                to="/doctors"
                className="btn-secondary text-lg px-8 py-3"
              >
                View Doctors
              </Link>
            </div>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Calendar className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments online 24/7 at your convenience
              </p>
            </div>
            <div className="card text-center">
              <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Doctors</h3>
              <p className="text-gray-600">
                Experienced professionals in various specializations
              </p>
            </div>
            <div className="card text-center">
              <Clock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">
                Choose from available time slots that suit you
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// LOGIN PAGE
// ============================================

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/patient/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      navigate('/patient/dashboard');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h2 className="text-3xl font-bold text-center mb-6">
              Patient Login
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Login
              </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// REGISTER PAGE
// ============================================

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/patient/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/patient/dashboard');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters with uppercase, lowercase, and a number
                </p>
              </div>
              <button type="submit" className="btn-primary w-full">
                Register
              </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// ADMIN LOGIN PAGE
// ============================================

export const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { adminLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await adminLogin(formData);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h2 className="text-3xl font-bold text-center mb-6">
              Admin Login
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@dentalclinic.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Admin Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default {
  Home,
  Login,
  Register,
  AdminLogin,
  Navbar,
  LoadingSpinner,
};
