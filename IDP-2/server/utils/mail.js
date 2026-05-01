const nodemailer = require('nodemailer');

// Re-create transporter for each call to avoid stale connections on cloud platforms
const getTransporter = () => {
    const user = (process.env.EMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASSWORD || '').trim();

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 30000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendResetEmail = async (email, name, token, role) => {
    const transporter = getTransporter();
    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}/${role}`;
    const sender = (process.env.EMAIL_USER || '').trim();
    
    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset</h1>
            <p>Hello ${name},</p>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (email, name, otp, role) => {
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Your CEPS OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">CEPS Portal - Password Reset</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your 6-digit OTP code to reset your <strong>${role}</strong> account password is:</p>
                <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; letter-spacing: 5px; color: #111827;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name, role) => {
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Welcome to CEPS Portal!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">Welcome to CEPS!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your <strong>${role}</strong> account has been successfully registered on the Campus Event Planning & Scheduling Portal.</p>
                <p>You can now log in to discover and participate in campus events.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendCredentialsEmail = async (email, name, password) => {
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Your CEPS Faculty Account Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">Welcome to CEPS Portal!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>An administrator has created a faculty account for you. Here are your login credentials:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please log in and change your password as soon as possible.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendPaymentConfirmationEmail = async (email, name, eventTitle, amount, transactionId) => {
    const transporter = getTransporter();
    const sender = (process.env.EMAIL_USER || '').trim();

    const mailOptions = {
        from: `"CEPS Portal" <${sender}>`,
        to: email.trim(),
        subject: 'Payment Confirmation - CEPS Portal',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981;">Payment Verified!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your payment for the event <strong>${eventTitle}</strong> has been verified successfully.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Amount Paid:</strong> ₹${amount}</p>
                    <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
                </div>
                <p>You are now fully registered for this event. See you there!</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">Campus Event Planning & Scheduling Portal</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { 
    sendResetEmail, 
    sendOtpEmail, 
    sendWelcomeEmail, 
    sendCredentialsEmail, 
    sendPaymentConfirmationEmail 
};
