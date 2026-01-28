// Simplified Admin Pages - Expand these for production
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, LoadingSpinner } from './AllPages';
import { doctorAPI, appointmentAPI, slotAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';

// ============================================
// ADMIN DASHBOARD
// ============================================

export const AdminDashboard = () => {
  const { loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats after auth is loaded
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading]);

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching admin stats...');
      const [appointmentStats, doctorsList] = await Promise.all([
        appointmentAPI.getStats(),
        doctorAPI.getAll(),
      ]);
      
      setStats({
        appointments: appointmentStats.data,
        totalDoctors: doctorsList.count,
      });
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.appointments.total || 0}</p>
              </div>
              <Calendar className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="card bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.appointments.byStatus?.confirmed || 0}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={40} />
            </div>
          </div>

          <div className="card bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.appointments.byStatus?.pending || 0}
                </p>
              </div>
              <Clock className="text-yellow-500" size={40} />
            </div>
          </div>

          <div className="card bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Doctors</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalDoctors || 0}</p>
              </div>
              <Users className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/doctors" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">👨‍⚕️ Manage Doctors</h3>
            <p className="text-gray-600">Add, edit, or remove doctors</p>
          </Link>

          <Link to="/admin/slots" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">🗓️ Manage Slots</h3>
            <p className="text-gray-600">Create and manage time slots</p>
          </Link>

          <Link to="/admin/appointments" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">📋 Appointments</h3>
            <p className="text-gray-600">View and manage all appointments</p>
          </Link>
        </div>
      </div>
    </>
  );
};

// ============================================
// MANAGE DOCTORS (Simplified)
// ============================================

export const ManageDoctors = () => {
  const { loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General Dentistry',
    experience: '',
    qualification: '',
    consultationFee: '',
    about: '',
  });

  useEffect(() => {
    // Only fetch doctors after auth is loaded
    if (!authLoading) {
      fetchDoctors();
    }
  }, [authLoading]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorAPI.getAll();
      setDoctors(data.data);
    } catch (error) {
      console.error('❌ Failed to load doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualification: doctor.qualification,
      consultationFee: doctor.consultationFee,
      about: doctor.about,
    });
    setImagePreview(doctor.image?.url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });

      // Add image file if selected
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }

      if (editingId) {
        await doctorAPI.update(editingId, formDataObj);
        toast.success('Doctor updated successfully');
      } else {
        await doctorAPI.create(formDataObj);
        toast.success('Doctor created successfully');
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await doctorAPI.delete(id);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: 'General Dentistry',
      experience: '',
      qualification: '',
      consultationFee: '',
      about: '',
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingId(null);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Doctors</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Doctor'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Doctor</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              {/* Image Upload Preview */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Doctor Photo</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Doctor preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field flex-1"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Name"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <select
                className="input-field"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              >
                <option>General Dentistry</option>
                <option>Orthodontics</option>
                <option>Periodontics</option>
                <option>Endodontics</option>
                <option>Prosthodontics</option>
                <option>Oral Surgery</option>
                <option>Pediatric Dentistry</option>
                <option>Cosmetic Dentistry</option>
              </select>
              <input
                type="number"
                placeholder="Years of Experience"
                className="input-field"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Qualification (e.g., BDS, MDS)"
                className="input-field"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                className="input-field"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                required
              />
              <textarea
                placeholder="About Doctor"
                className="input-field md:col-span-2"
                rows="3"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              ></textarea>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Update' : 'Create'} Doctor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={doctor.image?.url || '/default-doctor.jpg'}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      <p className="text-sm text-gray-600">{doctor.experience} years exp</p>
                    </div>
                  </div>
                  <span className={`badge ${doctor.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="btn-primary flex-1"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(doctor._id)} className="btn-danger flex-1">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// MANAGE APPOINTMENTS (Simplified)
// ============================================

export const ManageAppointments = () => {
  const { loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Only fetch appointments after auth is loaded
    if (!authLoading) {
      fetchAppointments();
    }
  }, [filter, authLoading]);

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await appointmentAPI.getAll(params);
      setAppointments(data.data);
    } catch (error) {
      console.error('❌ Failed to load appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentAPI.confirm(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (error) {
      console.error('❌ Failed to confirm appointment:', error);
      toast.error('Failed to confirm appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    
    try {
      await appointmentAPI.cancel(id, 'Cancelled by admin');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>

        <div className="mb-6">
          <select
            className="input-field max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">Patient: {apt.patient?.name}</h3>
                    <p className="text-gray-600">Doctor: Dr. {apt.doctor?.name}</p>
                    <p className="text-gray-600">Date: {new Date(apt.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Time: {apt.time}</p>
                  </div>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                </div>
                {apt.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleConfirm(apt._id)} className="btn-primary">
                      Confirm
                    </button>
                    <button onClick={() => handleCancel(apt._id)} className="btn-danger">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// MANAGE SLOTS (Simplified)
// ============================================

export const ManageSlots = () => {
  const { loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch doctors after auth is loaded
    if (!authLoading) {
      fetchDoctors();
    }
  }, [authLoading]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorAPI.getAll();
      setDoctors(data.data);
    } catch (error) {
      console.error('❌ Failed to load doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const generateSlots = async () => {
    if (!selectedDoctor || !date) {
      toast.error('Please select doctor and date');
      return;
    }

    const timeSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    ];

    try {
      await slotAPI.create({
        doctorId: selectedDoctor,
        date,
        timeSlots,
      });
      toast.success('Slots created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create slots');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Slots</h1>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Create Slots</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Doctor</label>
              <select
                className="input-field"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Choose Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <button onClick={generateSlots} className="btn-primary w-full">
              Generate Default Slots
            </button>

            <p className="text-sm text-gray-600">
              This will create slots from 9:00 AM to 4:30 PM with 30-minute intervals
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default { AdminDashboard, ManageDoctors, ManageAppointments, ManageSlots };
