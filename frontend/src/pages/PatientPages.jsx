// Additional comprehensive pages for the Dental Clinic application

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doctorAPI, slotAPI, appointmentAPI } from '../services/api';
import { Navbar, LoadingSpinner } from './AllPages';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Phone, Mail, Award, Briefcase, DollarSign } from 'lucide-react';

// ============================================
// DOCTORS LIST PAGE (Public)
// ============================================

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorAPI.getAll({ specialization: filter, isActive: true });
      setDoctors(data.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Periodontics',
    'Endodontics',
    'Prosthodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Cosmetic Dentistry',
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Doctors</h1>

        {/* Filter */}
        <div className="mb-6">
          <select
            className="input-field max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="card hover:shadow-lg transition-shadow">
                <img
                  src={doctor.image?.url || '/default-doctor.jpg'}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-center mb-2">Dr. {doctor.name}</h3>
                <p className="text-center text-primary-600 mb-4">{doctor.specialization}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Briefcase size={16} />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Award size={16} />
                    <span>{doctor.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <DollarSign size={16} />
                    <span>${doctor.consultationFee} consultation</span>
                  </div>
                </div>

                {doctor.about && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.about}</p>
                )}

                <button
                  onClick={() => navigate(`/patient/book/${doctor._id}`)}
                  className="btn-primary w-full"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found</p>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// PATIENT DASHBOARD
// ============================================

export const PatientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      const data = await appointmentAPI.getMyAppointments({ upcoming: true });
      setUpcomingAppointments(data.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/doctors')}>
            <h3 className="text-xl font-bold mb-2">📋 Book New Appointment</h3>
            <p className="text-gray-600">Browse our doctors and book an appointment</p>
          </div>
          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/appointments')}>
            <h3 className="text-xl font-bold mb-2">📅 My Appointments</h3>
            <p className="text-gray-600">View your appointment history and status</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>

        {loading ? (
          <LoadingSpinner />
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt._id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={apt.doctor?.image?.url || '/default-doctor.jpg'}
                    alt={apt.doctor?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">Dr. {apt.doctor?.name}</h4>
                    <p className="text-gray-600">{apt.doctor?.specialization}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(apt.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`badge badge-${apt.status}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-gray-500">No upcoming appointments</p>
            <button onClick={() => navigate('/doctors')} className="btn-primary mt-4">
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// BOOK APPOINTMENT PAGE
// ============================================

export const BookAppointment = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const data = await doctorAPI.getById(doctorId);
      setDoctor(data.data);
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await slotAPI.getAvailable(doctorId, selectedDate);
      setSlots(data.data);
      setSelectedSlot(null);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setBooking(true);
    try {
      await appointmentAPI.book({
        doctorId,
        slotId: selectedSlot._id,
        date: selectedDate,
        time: selectedSlot.time,
        reason,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
          ← Back
        </button>

        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <img
              src={doctor?.image?.url || '/default-doctor.jpg'}
              alt={doctor?.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">Dr. {doctor?.name}</h1>
              <p className="text-primary-600">{doctor?.specialization}</p>
              <p className="text-gray-600">{doctor?.experience} years experience</p>
              <p className="text-gray-600">Consultation Fee: ${doctor?.consultationFee}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            {slots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 border rounded-lg text-sm ${
                      selectedSlot?._id === slot._id
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white hover:border-primary-500'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No slots available for this date</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit (Optional)
            </label>
            <textarea
              className="input-field"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..."
            ></textarea>
          </div>

          <button
            onClick={handleBooking}
            disabled={!selectedSlot || booking}
            className="btn-primary w-full"
          >
            {booking ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================
// MY APPOINTMENTS PAGE
// ============================================

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await appointmentAPI.getMyAppointments(params);
      setAppointments(data.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentAPI.cancel(id, 'Cancelled by patient');
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
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

        <div className="mb-6">
          <select
            className="input-field max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={apt.doctor?.image?.url || '/default-doctor.jpg'}
                      alt={apt.doctor?.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg">Dr. {apt.doctor?.name}</h3>
                      <p className="text-gray-600">{apt.doctor?.specialization}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span>{format(new Date(apt.date), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} />
                    <span>{apt.time}</span>
                  </div>
                </div>

                {apt.reason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-gray-600">{apt.reason}</p>
                  </div>
                )}

                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(apt._id)}
                    className="btn-danger"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-gray-500 mb-4">No appointments found</p>
            <Link to="/doctors" className="btn-primary">
              Book an Appointment
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default { DoctorsList, PatientDashboard, BookAppointment, MyAppointments };
