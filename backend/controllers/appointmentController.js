import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';
import {
  sendAppointmentConfirmation,
  sendAppointmentStatusUpdate,
} from '../config/email.js';

/**
 * @desc    Book an appointment
 * @route   POST /api/appointments
 * @access  Private/Patient
 */
export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slotId, date, time, reason } = req.body;

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  if (!doctor.isActive) {
    throw new ErrorResponse('Doctor is not available for appointments', 400);
  }

  // Verify slot exists and is available
  const slot = await Slot.findById(slotId);
  if (!slot) {
    throw new ErrorResponse('Time slot not found', 404);
  }

  if (slot.isBooked) {
    throw new ErrorResponse('This time slot is already booked', 400);
  }

  if (slot.isBlocked) {
    throw new ErrorResponse('This time slot is blocked', 400);
  }

  // Verify slot belongs to the specified doctor
  if (slot.doctor.toString() !== doctorId) {
    throw new ErrorResponse('Slot does not belong to this doctor', 400);
  }

  // Check if patient already has an appointment with this doctor on the same date
  const hasExisting = await Appointment.hasExistingAppointment(
    req.user._id,
    doctorId,
    new Date(date)
  );

  if (hasExisting) {
    throw new ErrorResponse(
      'You already have an appointment with this doctor on this date',
      400
    );
  }

  // Create appointment
  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    slot: slotId,
    date: new Date(date),
    time,
    reason,
    status: 'pending',
  });

  // Mark slot as booked
  await slot.bookSlot(appointment._id);

  // Populate appointment details for response
  await appointment.populate('doctor', 'name specialization consultationFee');
  await appointment.populate('patient', 'name email phone');

  // Send confirmation email
  try {
    await sendAppointmentConfirmation({
      to: req.user.email,
      patientName: req.user.name,
      doctorName: doctor.name,
      date: date,
      time: time,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error.message);
    // Don't throw error, appointment is still created
  }

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment,
  });
});

/**
 * @desc    Get all appointments for logged-in patient
 * @route   GET /api/appointments/my-appointments
 * @access  Private/Patient
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;

  let query = { patient: req.user._id };

  if (status) {
    query.status = status;
  }

  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
    query.status = { $in: ['pending', 'confirmed'] };
  }

  const appointments = await Appointment.find(query)
    .populate('doctor', 'name specialization image consultationFee')
    .populate('slot', 'time')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

/**
 * @desc    Get all appointments (Admin)
 * @route   GET /api/appointments
 * @access  Private/Admin
 */
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, date, patientId } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (doctorId) {
    query.doctor = doctorId;
  }

  if (patientId) {
    query.patient = patientId;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization image')
    .populate('slot', 'time')
    .sort({ date: -1, time: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization image consultationFee')
    .populate('slot', 'time date');

  if (!appointment) {
    throw new ErrorResponse('Appointment not found', 404);
  }

  // Check authorization (patient can only see their own, admin can see all)
  if (
    req.user.role === 'patient' &&
    appointment.patient._id.toString() !== req.user._id.toString()
  ) {
    throw new ErrorResponse('Not authorized to access this appointment', 403);
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

/**
 * @desc    Confirm appointment (Admin)
 * @route   PUT /api/appointments/:id/confirm
 * @access  Private/Admin
 */
export const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email')
    .populate('doctor', 'name');

  if (!appointment) {
    throw new ErrorResponse('Appointment not found', 404);
  }

  if (appointment.status === 'confirmed') {
    throw new ErrorResponse('Appointment is already confirmed', 400);
  }

  if (appointment.status === 'cancelled') {
    throw new ErrorResponse('Cannot confirm a cancelled appointment', 400);
  }

  appointment.status = 'confirmed';
  appointment.notes = req.body.notes || appointment.notes;
  await appointment.save();

  // Send email notification
  try {
    await sendAppointmentStatusUpdate({
      to: appointment.patient.email,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date: appointment.date,
      time: appointment.time,
      status: 'confirmed',
    });
  } catch (error) {
    console.error('Failed to send status update email:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: appointment,
  });
});

/**
 * @desc    Cancel appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email')
    .populate('doctor', 'name')
    .populate('slot');

  if (!appointment) {
    throw new ErrorResponse('Appointment not found', 404);
  }

  // Check authorization
  if (
    req.user.role === 'patient' &&
    appointment.patient._id.toString() !== req.user._id.toString()
  ) {
    throw new ErrorResponse('Not authorized to cancel this appointment', 403);
  }

  if (appointment.status === 'cancelled') {
    throw new ErrorResponse('Appointment is already cancelled', 400);
  }

  if (appointment.status === 'completed') {
    throw new ErrorResponse('Cannot cancel a completed appointment', 400);
  }

  // Update appointment status
  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user.role;
  appointment.cancellationReason = cancellationReason;
  await appointment.save();

  // Release the slot
  await appointment.slot.releaseSlot();

  // Send email notification
  try {
    await sendAppointmentStatusUpdate({
      to: appointment.patient.email,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date: appointment.date,
      time: appointment.time,
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Failed to send status update email:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: appointment,
  });
});

/**
 * @desc    Mark appointment as completed (Admin)
 * @route   PUT /api/appointments/:id/complete
 * @access  Private/Admin
 */
export const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ErrorResponse('Appointment not found', 404);
  }

  if (appointment.status === 'completed') {
    throw new ErrorResponse('Appointment is already marked as completed', 400);
  }

  if (appointment.status === 'cancelled') {
    throw new ErrorResponse('Cannot complete a cancelled appointment', 400);
  }

  appointment.status = 'completed';
  appointment.notes = req.body.notes || appointment.notes;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment marked as completed',
    data: appointment,
  });
});

/**
 * @desc    Get appointment statistics (Admin)
 * @route   GET /api/appointments/stats/overview
 * @access  Private/Admin
 */
export const getAppointmentStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await Appointment.getStats(start, end);

  // Get today's appointments
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayAppointments = await Appointment.countDocuments({
    date: { $gte: todayStart, $lte: todayEnd },
  });

  // Get upcoming appointments
  const upcomingAppointments = await Appointment.countDocuments({
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  });

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      today: todayAppointments,
      upcoming: upcomingAppointments,
    },
  });
});

/**
 * @desc    Delete appointment (Admin only, for testing/cleanup)
 * @route   DELETE /api/appointments/:id
 * @access  Private/Admin
 */
export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('slot');

  if (!appointment) {
    throw new ErrorResponse('Appointment not found', 404);
  }

  // Release the slot if it was booked
  if (appointment.slot && appointment.slot.isBooked) {
    await appointment.slot.releaseSlot();
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully',
  });
});
