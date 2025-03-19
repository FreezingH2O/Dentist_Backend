const nodemailer = require('nodemailer');

async function sendEmailReminder(appointment, user) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Appointment Reminder',
        text: `Hello ${user.name}, your appointment is scheduled for ${appointment.apptDate}. 
        Please arrive 15 minutes prior to your appointment time.`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendEmailReminder };