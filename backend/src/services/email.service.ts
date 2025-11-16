import * as nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler';

// Configure email transporter
// In production, use SendGrid, AWS SES, or Postmark
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured transporter
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const from = process.env.SMTP_FROM || 'noreply@proposalplatform.com';

    await transporter.sendMail({
      from: `Proposal Platform <${from}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html)
    });

    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failures shouldn't break the main flow
  }
};

/**
 * Strip HTML tags for text version
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Send proposal share notification email
 */
export const sendProposalShareEmail = async (
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  proposalTitle: string,
  shareUrl: string,
  customMessage?: string
): Promise<void> => {
  const subject = `${senderName} shared a proposal with you: ${proposalTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .proposal-info {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">New Proposal Shared</h1>
        </div>
        <div class="content">
          <div class="greeting">
            Hi ${recipientName},
          </div>

          <p>
            <strong>${senderName}</strong> has shared a proposal with you on our platform.
          </p>

          <div class="proposal-info">
            <strong>Proposal:</strong> ${proposalTitle}
          </div>

          ${customMessage ? `
            <div class="message">
              <strong>Personal message from ${senderName}:</strong><br><br>
              ${customMessage}
            </div>
          ` : ''}

          <p style="text-align: center;">
            <a href="${shareUrl}" class="button">View Proposal</a>
          </p>

          <p style="font-size: 14px; color: #666;">
            Click the button above to view the proposal. If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #666; word-break: break-all;">
            ${shareUrl}
          </p>

          <div class="footer">
            <p>
              This email was sent from Proposal Platform.<br>
              If you believe this was sent in error, please ignore this email.
            </p>
            <p style="font-size: 12px; color: #999;">
              © 2025 Proposal Platform. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: recipientEmail,
    subject,
    html
  });
};

/**
 * Send signup welcome email
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  verificationUrl?: string
): Promise<void> => {
  const subject = 'Welcome to Proposal Platform!';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .features {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .feature:last-child {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">Welcome Aboard!</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px;">
            Hi ${userName},
          </p>

          <p>
            Welcome to Proposal Platform! We're excited to have you on board.
          </p>

          ${verificationUrl ? `
            <p>
              To get started, please verify your email address:
            </p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
          ` : ''}

          <div class="features">
            <h3 style="margin-top: 0;">What you can do:</h3>
            <div class="feature">
              ✅ Create and share professional proposals
            </div>
            <div class="feature">
              ✅ Collaborate with clients in real-time
            </div>
            <div class="feature">
              ✅ Get digital signatures securely
            </div>
            <div class="feature">
              ✅ Track proposal engagement
            </div>
          </div>

          <p>
            If you have any questions, feel free to reach out to our support team.
          </p>

          <div class="footer">
            <p>
              Need help? Visit our <a href="${process.env.FRONTEND_URL}/help">Help Center</a>
            </p>
            <p style="font-size: 12px; color: #999;">
              © 2025 Proposal Platform. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject,
    html
  });
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (
  userEmail: string,
  userName: string,
  verificationUrl: string
): Promise<void> => {
  const subject = 'Verify your email address';

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Hi ${userName},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        </p>
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${verificationUrl}
        </p>
        <p style="font-size: 14px; color: #666;">
          This link will expire in 24 hours.
        </p>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject,
    html
  });
};

/**
 * Send connection established notification
 */
export const sendConnectionEmail = async (
  recipientEmail: string,
  recipientName: string,
  initiatorName: string,
  proposalTitle?: string
): Promise<void> => {
  const subject = `You're now connected with ${initiatorName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Connection Established</h2>
        <p>Hi ${recipientName},</p>
        <p>
          You are now connected with <strong>${initiatorName}</strong> on Proposal Platform.
        </p>
        ${proposalTitle ? `
          <p>
            This connection was established through the proposal: <strong>${proposalTitle}</strong>
          </p>
        ` : ''}
        <p>
          You can now collaborate on proposals and exchange messages directly.
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/connections" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Connections</a>
        </p>
      </body>
    </html>
  `;

  await sendEmail({
    to: recipientEmail,
    subject,
    html
  });
};

/**
 * Send comment notification
 */
export const sendCommentNotification = async (
  recipientEmail: string,
  recipientName: string,
  commenterName: string,
  proposalTitle: string,
  commentPreview: string,
  proposalUrl: string
): Promise<void> => {
  const subject = `${commenterName} commented on "${proposalTitle}"`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Comment</h2>
        <p>Hi ${recipientName},</p>
        <p>
          <strong>${commenterName}</strong> commented on the proposal <strong>${proposalTitle}</strong>:
        </p>
        <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          ${commentPreview}
        </div>
        <p style="text-align: center;">
          <a href="${proposalUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Comment</a>
        </p>
      </body>
    </html>
  `;

  await sendEmail({
    to: recipientEmail,
    subject,
    html
  });
};

/**
 * Send signature request email
 */
export const sendSignatureRequestEmail = async (
  signerEmail: string,
  signerName: string,
  proposalTitle: string,
  requesterName: string,
  authToken: string
): Promise<void> => {
  const signUrl = `${process.env.FRONTEND_URL}/sign/${authToken}`;
  const subject = `Signature Requested: ${proposalTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .info-box { background: #fff; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; }
          .legal { background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Signature Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${signerName},</h2>
            <p>${requesterName} has requested your signature on a proposal.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Proposal:</strong> ${proposalTitle}</p>
              <p style="margin: 10px 0 0 0;"><strong>Requested by:</strong> ${requesterName}</p>
            </div>

            <p>Please review the document carefully and sign if you agree with the terms.</p>

            <div style="text-align: center;">
              <a href="${signUrl}" class="button">Review & Sign Document</a>
            </div>

            <div class="legal">
              <p style="margin: 0; font-size: 13px;">
                <strong>⚖️ Legal Notice:</strong> This is a legally binding signature request.
                By signing this document, you are entering into a legal agreement.
                The Proposal Platform will act as a legal witness to this agreement,
                maintaining tamper-proof records in compliance with ESIGN Act, UETA, and eIDAS regulations.
              </p>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              This signature link is unique to you and expires in 30 days.
              If you have questions, please contact ${requesterName}.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Proposal Platform - Secure Digital Signatures</p>
            <p>This email contains a confidential signature request.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: signerEmail,
    subject,
    html
  });
};

/**
 * Send signature reminder email
 */
export const sendSignatureReminderEmail = async (
  signerEmail: string,
  signerName: string,
  proposalTitle: string,
  authToken: string
): Promise<void> => {
  const signUrl = `${process.env.FRONTEND_URL}/sign/${authToken}`;
  const subject = `Reminder: Signature Pending - ${proposalTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Signature Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${signerName},</h2>
            <p>This is a friendly reminder that your signature is still pending on:</p>
            <p><strong>${proposalTitle}</strong></p>
            <p>Please take a moment to review and sign the document.</p>
            <div style="text-align: center;">
              <a href="${signUrl}" class="button">Sign Now</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Proposal Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: signerEmail,
    subject,
    html
  });
};

/**
 * Send signature completion email
 */
export const sendSignatureCompletedEmail = async (
  recipientEmail: string,
  recipientName: string,
  proposalTitle: string,
  certificateUrl: string,
  blockchainHash: string
): Promise<void> => {
  const subject = `Agreement Completed: ${proposalTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .hash-box { background: #fff; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; font-size: 12px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Agreement Signed & Completed</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${recipientName}!</h2>

            <div class="success-box">
              <h3 style="margin-top: 0; color: #047857;">All Parties Have Signed</h3>
              <p style="margin-bottom: 0; font-size: 16px;"><strong>${proposalTitle}</strong></p>
            </div>

            <p>The agreement has been successfully executed and is now legally binding. All parties have completed their signatures.</p>

            <h3>📋 Legal Record</h3>
            <p>This agreement is legally binding and has been witnessed by the Proposal Platform in compliance with:</p>
            <ul>
              <li>ESIGN Act (United States)</li>
              <li>UETA (Uniform Electronic Transactions Act)</li>
              <li>eIDAS (European Union)</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}${certificateUrl}" class="button">Download Certificate</a>
            </div>

            <h3>🔒 Blockchain Verification Hash</h3>
            <p>For tamper-proof verification, this agreement has been registered with the following hash:</p>
            <div class="hash-box">
              ${blockchainHash}
            </div>
            <p style="font-size: 13px; color: #6b7280;">
              This hash can be used to verify the authenticity and integrity of the signed document at any time.
            </p>

            <h3>📁 Your Records</h3>
            <p>Please keep this email and the certificate for your records. You can access the signed document and certificate at any time from your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2025 Proposal Platform - Secure Digital Signatures</p>
            <p>This is a legal notification of completed agreement.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: recipientEmail,
    subject,
    html
  });
};

/**
 * Test email configuration
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email server connection successful');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

export default {
  sendProposalShareEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendConnectionEmail,
  sendCommentNotification,
  sendSignatureRequestEmail,
  sendSignatureReminderEmail,
  testEmailConnection
};
