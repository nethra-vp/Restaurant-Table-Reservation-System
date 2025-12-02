import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.MAIL_FROM || process.env.ADMIN_EMAIL || 'no-reply@example.com';

let transporter = null;
if (smtpHost && smtpUser) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn('SMTP not configured. Emails will be logged to console.');
}

export async function sendCancellationEmail(to, token) {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
  const cancelLink = `${serverUrl}/api/reservations/cancel/${token}`;
  const subject = 'Your Table Reservation – Cancel Within 5 Minutes';
  const text = `You can cancel your reservation within 5 minutes using the link below:\n\n${cancelLink}\n\nIf the link has expired, cancellation is no longer possible.`;
  const html = `<p>You can cancel your reservation within 5 minutes using the link below:</p><p><a href="${cancelLink}">${cancelLink}</a></p><p>If the link has expired, cancellation is no longer possible.</p>`;

  if (!transporter) {
    console.log('--- Cancellation Email (logged) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('--- End Email ---');
    return cancelLink;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    console.log('Cancellation email sent to', to);
    return cancelLink;
  } catch (err) {
    console.error('Error sending cancellation email:', err);
    return cancelLink;
  }
}

export async function sendConfirmationEmail(to, token, details = {}) {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
  const cancelLink = `${serverUrl}/api/reservations/cancel/${token}`;
  const subject = 'Table Reserved Successfully';
  const text = `Your table has been reserved successfully.\n\nReservation details:\nDate: ${details.date || ''}\nTime: ${details.time || ''}\nGuests: ${details.guests || ''}\n\nIf you need to cancel, you can use the link below within 5 minutes:\n${cancelLink}`;
  const html = `<p>Your table has been reserved successfully.</p>
    <p><strong>Reservation details</strong></p>
    <ul>
      <li>Date: ${details.date || ''}</li>
      <li>Time: ${details.time || ''}</li>
      <li>Guests: ${details.guests || ''}</li>
    </ul>
    <p>If you need to cancel, use this link within 5 minutes:</p>
    <p><a href="${cancelLink}">${cancelLink}</a></p>`;

  if (!transporter) {
    console.log('--- Confirmation Email (logged) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('--- End Email ---');
    return cancelLink;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    console.log('Confirmation email sent to', to);
    return cancelLink;
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    return cancelLink;
  }
}
