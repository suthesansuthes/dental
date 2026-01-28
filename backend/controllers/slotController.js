import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

/**
 * @desc    Create slots for a doctor
 * @route   POST /api/slots
 * @access  Private/Admin
 */
export const createSlots = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlots } = req.body;

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Check if date is in the past
  const slotDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (slotDate < today) {
    throw new ErrorResponse('Cannot create slots for past dates', 400);
  }

  // Create slots
  const createdSlots = await Slot.createDailySlots(doctorId, date, timeSlots);

  res.status(201).json({
    success: true,
    message: `${createdSlots.length} slots created successfully`,
    data: createdSlots,
  });
});

/**
 * @desc    Get available slots for a doctor on a specific date
 * @route   GET /api/slots/available/:doctorId
 * @access  Public
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  let { date } = req.query;

  if (!date) {
    throw new ErrorResponse('Please provide a date', 400);
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Parse and normalize date
  const slotDate = new Date(date);
  if (isNaN(slotDate.getTime())) {
    throw new ErrorResponse('Invalid date format', 400);
  }

  console.log('📅 Getting available slots:', {
    doctorId,
    date: date,
    parsedDate: slotDate.toISOString(),
  });

  // Get available slots
  const slots = await Slot.getAvailableSlots(doctorId, slotDate);

  console.log(`✅ Found ${slots.length} available slots`);

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
  });
});

/**
 * @desc    Get all slots for a doctor (with filters)
 * @route   GET /api/slots/doctor/:doctorId
 * @access  Private/Admin
 */
export const getDoctorSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date, isBooked, isBlocked } = req.query;

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Build query
  let query = { doctor: doctorId };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  if (isBooked !== undefined) {
    query.isBooked = isBooked === 'true';
  }

  if (isBlocked !== undefined) {
    query.isBlocked = isBlocked === 'true';
  }

  const slots = await Slot.find(query)
    .populate('appointment')
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
  });
});

/**
 * @desc    Block/Unblock a slot
 * @route   PUT /api/slots/:id/block
 * @access  Private/Admin
 */
export const toggleBlockSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);

  if (!slot) {
    throw new ErrorResponse('Slot not found', 404);
  }

  if (slot.isBooked) {
    throw new ErrorResponse('Cannot block a booked slot', 400);
  }

  slot.isBlocked = !slot.isBlocked;
  await slot.save();

  res.status(200).json({
    success: true,
    message: `Slot ${slot.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: slot,
  });
});

/**
 * @desc    Block multiple dates for a doctor
 * @route   POST /api/slots/block-dates
 * @access  Private/Admin
 */
export const blockDates = asyncHandler(async (req, res) => {
  const { doctorId, dates } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    throw new ErrorResponse('Please provide an array of dates to block', 400);
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  let blockedCount = 0;

  for (const date of dates) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Block all unbooked slots for this date
    const result = await Slot.updateMany(
      {
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        isBooked: false,
      },
      { isBlocked: true }
    );

    blockedCount += result.modifiedCount;
  }

  res.status(200).json({
    success: true,
    message: `${blockedCount} slots blocked for ${dates.length} date(s)`,
  });
});

/**
 * @desc    Delete a slot
 * @route   DELETE /api/slots/:id
 * @access  Private/Admin
 */
export const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);

  if (!slot) {
    throw new ErrorResponse('Slot not found', 404);
  }

  if (slot.isBooked) {
    throw new ErrorResponse('Cannot delete a booked slot', 400);
  }

  await slot.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Slot deleted successfully',
  });
});

/**
 * @desc    Generate default time slots
 * @route   GET /api/slots/generate-times
 * @access  Private/Admin
 */
export const generateTimeSlots = asyncHandler(async (req, res) => {
  // Generate standard time slots from 9 AM to 5 PM with 30-minute intervals
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', // Lunch break typically here
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM',
  ];

  res.status(200).json({
    success: true,
    data: timeSlots,
  });
});

/**
 * @desc    Bulk create slots for multiple days
 * @route   POST /api/slots/bulk-create
 * @access  Private/Admin
 */
export const bulkCreateSlots = asyncHandler(async (req, res) => {
  const { doctorId, startDate, endDate, timeSlots, excludeDays = [] } = req.body;

  if (!startDate || !endDate || !timeSlots || timeSlots.length === 0) {
    throw new ErrorResponse('Please provide startDate, endDate, and timeSlots', 400);
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    throw new ErrorResponse('Start date must be before end date', 400);
  }

  let totalCreated = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Skip if day is excluded or not in doctor's available days
    if (!excludeDays.includes(dayName) && doctor.availableDays.includes(dayName)) {
      const created = await Slot.createDailySlots(doctorId, new Date(current), timeSlots);
      totalCreated += created.length;
    }

    current.setDate(current.getDate() + 1);
  }

  res.status(201).json({
    success: true,
    message: `${totalCreated} slots created successfully`,
  });
});
