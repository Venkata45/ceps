const nodemailer = require('nodemailer');

/**
 * Creates a robust transporter for Gmail.
 * Using Port 587 with STARTTLS is generally more reliable on cloud platforms like Render.
 */
const getTransporter = () => {
    const user = (process.env.EMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASSWORD || '').trim();

    if (!user || !pass) {
        console.error('❌ EMAIL_USER or EMAIL_PASSWORD missing in environment variables!');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: { user, pass },
        // Increased timeouts to handle cloud network latency
        connectionTimeout: 20000, 
        greetingTimeout: 20000,
        socketTimeout: 20000,
        logger: true,
        debug: true,
        tls: {
            // This ensures the connection isn't rejected by Render's firewall
            rejectUnauthorized: false
        }
    });
};

/**
 * Sends an OTP email for password reset.
 */
const sendOtpEmail = async (email, name, otp, role) => {
    console.log(`📧 Attempting to send OTP to: ${email}...`);
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Your CEPS OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #4f46e5; text-align: center;">CEPS Portal</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>You requested an OTP to reset your <strong>${role}</strong> account password.</p>
                <div style="background: #f3f4f6; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; border-radius: 12px; letter-spacing: 8px; color: #111827; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="text-align: center; color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error(`❌ OTP delivery failed for ${email}:`, error.message);
        throw error;
    }
};

/**
 * Sends a welcome email after registration.
 */
const sendWelcomeEmail = async (email, name, role) => {
    console.log(`📧 Sending Welcome email to: ${email}...`);
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Welcome to CEPS Portal!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #4f46e5; text-align: center;">Welcome to CEPS!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your <strong>${role}</strong> account has been successfully registered on the CEPS Portal.</p>
                <p>You can now log in to discover and participate in campus events.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error(`❌ Welcome email delivery failed for ${email}:`, error.message);
    }
};

/**
 * Sends credentials to newly created faculty accounts.
 */
const sendCredentialsEmail = async (email, name, password) => {
    console.log(`📧 Sending Faculty Credentials to: ${email}...`);
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Your CEPS Faculty Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #4f46e5; text-align: center;">Faculty Account Created</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>An administrator has created your faculty account. Use the credentials below to log in:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please log in and change your password immediately.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Credentials sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error(`❌ Credentials delivery failed for ${email}:`, error.message);
        throw error;
    }
};

/**
 * Sends a link-based reset email.
 */
const sendResetEmail = async (email, name, token, role) => {
    console.log(`📧 Sending Reset Link to: ${email}...`);
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();
    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}/${role}`;
    
    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2>Password Reset Request</h2>
                <p>Hello ${name},</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p style="margin-top: 20px;">Or copy this link: ${resetUrl}</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Reset link sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error(`❌ Reset link delivery failed for ${email}:`, error.message);
        throw error;
    }
};

/**
 * Sends payment confirmation.
 */
const sendPaymentConfirmationEmail = async (email, name, eventTitle, amount, transactionId) => {
    console.log(`📧 Sending Payment Confirmation to: ${email}...`);
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Payment Verified - CEPS Portal',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981;">Payment Verified!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your payment for <strong>${eventTitle}</strong> has been verified.</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Payment confirmation sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error(`❌ Payment confirmation failed for ${email}:`, error.message);
    }
};

module.exports = { 
    sendResetEmail, 
    sendOtpEmail, 
    sendWelcomeEmail, 
    sendCredentialsEmail, 
    sendPaymentConfirmationEmail 
};
