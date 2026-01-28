import mongoose from 'mongoose';

/**
 * Appointment Schema
 * Links patient, doctor, and slot
 * Tracks appointment status and history
 */
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'admin', null],
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for faster queries
 */
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1, date: -1 });
appointmentSchema.index({ date: -1 });

/**
 * Pre-save middleware to set timestamp fields
 */
appointmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    } else if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

/**
 * Static method to get appointment statistics
 * @param {Date} startDate - Start date for stats
 * @param {Date} endDate - End date for stats
 * @returns {Promise<Object>} - Statistics object
 */
appointmentSchema.statics.getStats = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate || new Date(0),
          $lte: endDate || new Date(),
        },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await this.countDocuments({
    createdAt: {
      $gte: startDate || new Date(0),
      $lte: endDate || new Date(),
    },
  });

  return {
    total,
    byStatus: stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
  };
};

/**
 * Static method to check if patient has appointment with doctor on same date
 * @param {ObjectId} patientId - Patient's ID
 * @param {ObjectId} doctorId - Doctor's ID
 * @param {Date} date - Appointment date
 * @returns {Promise<boolean>} - True if appointment exists
 */
appointmentSchema.statics.hasExistingAppointment = async function (patientId, doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await this.findOne({
    patient: patientId,
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] },
  });

  return !!existing;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
