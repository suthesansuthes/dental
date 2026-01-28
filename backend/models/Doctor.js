import mongoose from 'mongoose';

/**
 * Doctor Schema
 * Stores doctor information including image URL from Cloudinary
 */
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide doctor email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
      trim: true,
      enum: [
        'General Dentistry',
        'Orthodontics',
        'Periodontics',
        'Endodontics',
        'Prosthodontics',
        'Oral Surgery',
        'Pediatric Dentistry',
        'Cosmetic Dentistry',
      ],
    },
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    qualification: {
      type: String,
      required: [true, 'Please provide qualification'],
      trim: true,
    },
    image: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1612349317453-3ad32c4a0b7d?w=500&h=500&fit=crop',
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
      min: [0, 'Fee cannot be negative'],
    },
    about: {
      type: String,
      trim: true,
      maxlength: [500, 'About section cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for faster queries
 */
doctorSchema.index({ specialization: 1, isActive: 1 });
doctorSchema.index({ name: 'text' }); // Text search on name

/**
 * Virtual for getting total appointments
 */
doctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
