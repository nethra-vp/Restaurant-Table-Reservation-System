import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Basic environment-driven SMTP configuration with support for common providers
const provider = (process.env.MAILER_PROVIDER || '').toLowerCase();
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.MAIL_FROM || process.env.ADMIN_EMAIL || 'no-reply@example.com';
const secureFlag = process.env.SMTP_SECURE === 'true'; // use true for port 465 (SSL)
const rejectUnauthorized = process.env.SMTP_REJECT_UNAUTHORIZED !== 'false';

let transporter = null;

try {
  if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    // SendGrid via SMTP (no extra package) — username must be 'apikey'
    transporter = nodemailer.createTransport({
      host: process.env.SENDGRID_HOST || 'smtp.sendgrid.net',
      port: Number(smtpPort) || 587,
      secure: secureFlag,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
      tls: { rejectUnauthorized },
    });
    console.log('Mailer: configured SendGrid SMTP');
  } else if (provider === 'gmail' && smtpUser && smtpPass) {
    // Gmail SMTP (use App Password for production or OAuth2 for stricter security)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized },
    });
    console.log('Mailer: configured Gmail SMTP');
  } else if (provider === 'mailgun' && smtpUser && smtpPass) {
    // Mailgun via SMTP
    transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_HOST || smtpHost || 'smtp.mailgun.org',
      port: Number(smtpPort) || 587,
      secure: secureFlag,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized },
    });
    console.log('Mailer: configured Mailgun SMTP');
  } else if (smtpHost && smtpUser) {
    // Generic SMTP
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: secureFlag,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized },
    });
    console.log('Mailer: configured generic SMTP');
  } else {
    console.warn('SMTP not configured. Emails will be logged to console.');
  }
} catch (e) {
  console.error('Error configuring mailer transporter:', e);
  transporter = null;
}

// Verify transporter at startup so auth/config issues surface early
function mask(v) {
  if (!v) return 'n/a';
  if (v.length <= 6) return '***';
  return v.slice(0, 3) + '...' + v.slice(-3);
}

if (transporter) {
  transporter.verify()
    .then(() => {
      console.log(`Mailer verified. provider=${provider || 'generic'} host=${smtpHost || 'default'} user=${mask(smtpUser)}`);
    })
    .catch((err) => {
      console.error('Mailer verification failed:', err && err.message ? err.message : err);
      // Provider-specific troubleshooting hints
      if (provider === 'gmail') {
        console.error('Hint: Gmail authentication failed. If you use a regular account password, enable 2FA and create an App Password. Alternatively, configure OAuth2.');
      } else if (provider === 'sendgrid') {
        console.error('Hint: SendGrid failed. Ensure SENDGRID_API_KEY is correct and you set MAILER_PROVIDER=sendgrid.');
      } else if ((smtpHost || '').includes('mailtrap')) {
        console.error('Hint: Mailtrap credentials may be invalid or you are using a sandbox inbox. Verify SMTP_USER/SMTP_PASS and Mailtrap inbox settings.');
      } else {
        console.error('Hint: Verify SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in your .env. Check network/firewall and provider docs.');
      }
      // leave transporter so code can still log emails to console when send fails
    });
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
