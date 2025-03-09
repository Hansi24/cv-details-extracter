import nodemailer from 'nodemailer';
import { config } from '../config/config';

const sendEmail = (to: string, subject: string, html: string, attachments: any[] = []) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL,
      pass: config.APP_PASSWORD,
    }
  });

  const mailOptions = {
    from: config.EMAIL,
    to: to,
    subject: subject,
    html: html,
    attachments: attachments, // Include attachments like logo
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }});
};

export const sendUnderReviewEmail = async (applicantEmail: string) => {
  // Email Subject
  const emailSubject = "Your Application is Under Review";

  // HTML Email Body
  const emailBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <div style="text-align: center;">
        <img src="https://cvdrivebucket.s3.us-east-1.amazonaws.com/illustration-of-a-magnifier-and-employee-logo-template-for-job-searching-company-vector.jpg" alt="Your Company Logo" style="width: 100px; height: 100px; object-fit: cover;">
      </div>
      <h2 style="color: #007bff;">Your Application is Under Review</h2>
      <p>Dear Applicant,</p>
      <p>Thank you for submitting your application. We are currently reviewing your details and will get back to you within the next few days.</p>
      <p>If any additional information is required, we will contact you via this email.</p>
      <p>Meanwhile, if you have any questions, feel free to reach out to our support team.</p>
      <p style="margin-top: 20px;">Best regards,</p>
      <p><strong>Your Company Name</strong></p>
      <p><a href="http://localhost:5173/" style="color: #007bff; text-decoration: none;">Visit our website</a></p>
    </div>
  `;

  // Send the email
  await sendEmail(applicantEmail, emailSubject, emailBody);
};

