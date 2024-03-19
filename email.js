const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Replace with your SMTP server address
  port: 587, // Replace with your SMTP server port
  secure: false,
  auth: {
    user: '22pa1a0225@vishnu.edu.in', // Replace with sender email address
    pass: '22PA1A0225@' // Replace with sender email password
  }
});

async function sendEmail() {
  try {
    await transporter.sendMail({
      from: '22pa1a0225@vishnu.edu.in', // Sender email address
      to: '22pa1a0251@vishnu.edu.in', // Recipient email address
      subject: 'Subject of the email',
      text: 'Body of the email'
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendEmail;
