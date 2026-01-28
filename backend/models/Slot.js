import mongoose from 'mongoose';

/**
 * Slot Schema
 * Manages individual time slots for each doctor
 * Prevents double booking
 */
const slotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      // Format: "09:00 AM", "02:30 PM", etc.
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index to ensure uniqueness
 * A doctor cannot have duplicate time slots for the same date
 */
slotSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

/**
 * Index for faster queries by date
 */
slotSchema.index({ doctor: 1, date: 1 });
slotSchema.index({ isBooked: 1, isBlocked: 1 });

/**
 * Static method to create multiple slots for a doctor
 * @param {ObjectId} doctorId - Doctor's ID
 * @param {Date} date - Date for slots
 * @param {Array<string>} timeSlots - Array of time strings
 * @returns {Promise<Array>} - Created slots
 */
slotSchema.statics.createDailySlots = async function (doctorId, date, timeSlots) {
  const slots = timeSlots.map(time => ({
    doctor: doctorId,
    date: date,
    time: time,
    isBooked: false,
    isBlocked: false,
  }));

  try {
    // Use insertMany with ordered: false to continue even if some duplicates exist
    return await this.insertMany(slots, { ordered: false });
  } catch (error) {
    // Ignore duplicate key errors (code 11000)
    if (error.code === 11000) {
      console.log('Some slots already exist, skipping duplicates');
      return [];
    }
    throw error;
  }
};

/**
 * Static method to get available slots for a doctor on a specific date
 * @param {ObjectId} doctorId - Doctor's ID
 * @param {Date} date - Date to check
 * @returns {Promise<Array>} - Available slots
 */
slotSchema.statics.getAvailableSlots = async function (doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isBooked: false,
    isBlocked: false,
  }).sort({ time: 1 });
};

/**
 * Instance method to book a slot
 * @param {ObjectId} appointmentId - Appointment ID
 * @returns {Promise<Slot>}
 */
slotSchema.methods.bookSlot = async function (appointmentId) {
  if (this.isBooked) {
    throw new Error('Slot is already booked');
  }
  if (this.isBlocked) {
    throw new Error('Slot is blocked');
  }
  
  this.isBooked = true;
  this.appointment = appointmentId;
  return await this.save();
};

/**
 * Instance method to release a slot
 * @returns {Promise<Slot>}
 */
slotSchema.methods.releaseSlot = async function () {
  this.isBooked = false;
  this.appointment = null;
  return await this.save();
};

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
