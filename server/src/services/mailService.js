'use strict';

/**
 * Send a verification email to a user.
 * Supports Resend if RESEND_API_KEY is configured in env,
 * otherwise logs the email content to stdout for local testing (Mock Mode).
 *
 * @param {string} email - Recipient's email address
 * @param {string} name - Recipient's name
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function sendVerificationEmail(email, name, code) {
  const apiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl; background-color: #0a0f0d; color: #ffffff;">
      <h2 style="color: #10b981; text-align: center;">🌱 Welcome to EcoTrack!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for signing up to track and reduce your carbon footprint. To complete your registration and activate your account, please verify your email address using the code below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #10b981; padding: 10px 20px; border: 2px dashed #10b981; border-radius: 8px; background-color: rgba(16, 185, 129, 0.05);">${code}</span>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">This code is valid for 24 hours. If you did not request this email, you can safely ignore it.</p>
      <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
      <p style="text-align: center; font-size: 12px; color: #64748b;">EcoTrack Team — Save the Planet, One Step at a Time.</p>
    </div>
  `;

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'EcoTrack <onboarding@resend.dev>',
          to: email,
          subject: '🌱 Verify your EcoTrack Account',
          html: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      console.log(`✉️ Email verification sent via Resend API to ${email}`);
      return { success: true, message: 'Email sent successfully via Resend API.' };
    } catch (err) {
      console.error('❌ Resend API failed, falling back to mock logging:', err.message);
    }
  }

  // Fallback / Mock Mode: Print to console
  console.log('\n=================== MOCK EMAIL SERVICE ===================');
  console.log(`TO: ${name} <${email}>`);
  console.log('SUBJECT: 🌱 Verify your EcoTrack Account');
  console.log(`VERIFICATION CODE: ${code}`);
  console.log('----------------------------------------------------------');
  console.log('Status: MOCK_MODE_ACTIVE (No RESEND_API_KEY configured)');
  console.log('==========================================================\n');

  return { success: true, message: 'Email logged to console (Mock Mode).' };
}

module.exports = { sendVerificationEmail };
