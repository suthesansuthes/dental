import nodemailer from 'nodemailer';

/**
 * Create reusable transporter object using SMTP transport
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send appointment confirmation email to patient
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.patientName - Patient's name
 * @param {string} options.doctorName - Doctor's name
 * @param {string} options.date - Appointment date
 * @param {string} options.time - Appointment time
 * @returns {Promise<void>}
 */
export const sendAppointmentConfirmation = async ({ to, patientName, doctorName, date, time }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Appointment Confirmation - Dental Clinic',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
            .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #0066cc; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 Dental Clinic</h1>
            </div>
            <div class="content">
              <h2>Hello ${patientName},</h2>
              <p>Your appointment has been successfully booked!</p>
              
              <div class="details">
                <h3>Appointment Details:</h3>
                <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Status:</strong> Pending Confirmation</p>
              </div>
              
              <p>Your appointment is currently pending. You will receive another email once the admin confirms your appointment.</p>
              
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Bring any previous dental records if available</li>
                <li>If you need to cancel or reschedule, please contact us at least 24 hours in advance</li>
              </ul>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 Dental Clinic. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent to: ${to}`);
  } catch (error) {
    console.error(`Email Error: ${error.message}`);
    throw error;
  }
};

/**
 * Send appointment status update email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.patientName - Patient's name
 * @param {string} options.doctorName - Doctor's name
 * @param {string} options.date - Appointment date
 * @param {string} options.time - Appointment time
 * @param {string} options.status - New status (confirmed/cancelled)
 * @returns {Promise<void>}
 */
export const sendAppointmentStatusUpdate = async ({ to, patientName, doctorName, date, time, status }) => {
  const transporter = createTransporter();

  const isConfirmed = status === 'confirmed';
  const statusColor = isConfirmed ? '#28a745' : '#dc3545';
  const statusText = isConfirmed ? 'CONFIRMED' : 'CANCELLED';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Appointment ${statusText} - Dental Clinic`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
            .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 Dental Clinic</h1>
              <h2>Appointment ${statusText}</h2>
            </div>
            <div class="content">
              <h2>Hello ${patientName},</h2>
              <p>Your appointment has been <strong>${statusText}</strong>.</p>
              
              <div class="details">
                <h3>Appointment Details:</h3>
                <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
              </div>
              
              ${isConfirmed 
                ? '<p>We look forward to seeing you! Please arrive 10 minutes before your scheduled time.</p>' 
                : '<p>If you would like to reschedule, please book a new appointment through our website.</p>'
              }
            </div>
            
            <div class="footer">
              <p>© 2024 Dental Clinic. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Status update email sent to: ${to}`);
  } catch (error) {
    console.error(`Email Error: ${error.message}`);
    throw error;
  }
};

export default createTransporter;
