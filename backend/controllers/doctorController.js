import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';
import { deleteImage, uploadToCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
export const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialization, search, isActive } = req.query;

  // Build query
  let query = {};

  if (specialization) {
    query.specialization = specialization;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const doctors = await Doctor.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

/**
 * @desc    Create new doctor
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
export const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    specialization,
    experience,
    qualification,
    consultationFee,
    availableDays,
    about,
  } = req.body;

  // Check if doctor with email already exists
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ErrorResponse('Doctor with this email already exists', 400);
  }

  // Prepare doctor data
  const doctorData = {
    name,
    email,
    phone,
    specialization,
    experience,
    qualification,
    consultationFee,
    availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    about,
  };

  // Handle image upload from Cloudinary
  if (req.file && req.file.buffer) {
    try {
      console.log('📤 Uploading image to Cloudinary...');
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      
      console.log('📊 Cloudinary result:', {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
      });
      
      doctorData.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
      
      console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);
    } catch (error) {
      console.error('❌ Image upload to Cloudinary failed:', error.message || JSON.stringify(error));
      console.error('Full error:', error);
      // Continue without image if upload fails
      doctorData.image = {
        url: 'https://images.unsplash.com/photo-1612349317453-3ad32c4a0b7d?w=500&h=500&fit=crop',
        publicId: null,
      };
    }
  } else {
    // Default image if no file provided
    doctorData.image = {
      url: 'https://images.unsplash.com/photo-1612349317453-3ad32c4a0b7d?w=500&h=500&fit=crop',
      publicId: null,
    };
  }

  const doctor = await Doctor.create(doctorData);

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: doctor,
  });
});

/**
 * @desc    Update doctor
 * @route   PUT /api/doctors/:id
 * @access  Private/Admin
 */
export const updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  const {
    name,
    email,
    phone,
    specialization,
    experience,
    qualification,
    consultationFee,
    availableDays,
    about,
    isActive,
  } = req.body;

  // Check if email is being changed to an existing one
  if (email && email !== doctor.email) {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      throw new ErrorResponse('Doctor with this email already exists', 400);
    }
  }

  // Update fields
  if (name) doctor.name = name;
  if (email) doctor.email = email;
  if (phone) doctor.phone = phone;
  if (specialization) doctor.specialization = specialization;
  if (experience !== undefined) doctor.experience = experience;
  if (qualification) doctor.qualification = qualification;
  if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
  if (availableDays) doctor.availableDays = availableDays;
  if (about) doctor.about = about;
  if (isActive !== undefined) doctor.isActive = isActive;

  // Handle image upload
  if (req.file && req.file.buffer) {
    try {
      console.log('📤 Uploading image to Cloudinary...');
      
      // Delete old image from Cloudinary if it exists
      if (doctor.image?.publicId) {
        try {
          await deleteImage(doctor.image.publicId);
          console.log('🗑️  Old image deleted');
        } catch (error) {
          console.error('Error deleting old image:', error.message);
          // Continue even if deletion fails
        }
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer);
      
      console.log('📊 Cloudinary result:', {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
      });
      
      doctor.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
      
      console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);
    } catch (error) {
      console.error('❌ Image upload to Cloudinary failed:', error.message || JSON.stringify(error));
      console.error('Full error:', error);
      // Continue without image update if upload fails
    }
  }

  await doctor.save();

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: doctor,
  });
});

/**
 * @desc    Delete doctor
 * @route   DELETE /api/doctors/:id
 * @access  Private/Admin
 */
export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Check if doctor has any upcoming appointments
  const upcomingAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  });

  if (upcomingAppointments > 0) {
    throw new ErrorResponse(
      `Cannot delete doctor with ${upcomingAppointments} upcoming appointments. Please cancel or complete them first.`,
      400
    );
  }

  // Delete image from Cloudinary
  if (doctor.image.publicId) {
    await deleteImage(doctor.image.publicId);
  }

  // Delete all slots associated with this doctor
  await Slot.deleteMany({ doctor: doctor._id });

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
  });
});

/**
 * @desc    Get doctor statistics
 * @route   GET /api/doctors/:id/stats
 * @access  Private/Admin
 */
export const getDoctorStats = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Get appointment counts by status
  const appointments = await Appointment.aggregate([
    { $match: { doctor: doctor._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  appointments.forEach(item => {
    stats[item._id] = item.count;
    stats.total += item.count;
  });

  // Get upcoming appointments count
  const upcomingCount = await Appointment.countDocuments({
    doctor: doctor._id,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  });

  res.status(200).json({
    success: true,
    data: {
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
      appointments: stats,
      upcoming: upcomingCount,
    },
  });
});

/**
 * @desc    Get all specializations
 * @route   GET /api/doctors/specializations/list
 * @access  Public
 */
export const getSpecializations = asyncHandler(async (req, res) => {
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

  res.status(200).json({
    success: true,
    data: specializations,
  });
});
