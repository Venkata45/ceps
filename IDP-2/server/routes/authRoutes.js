const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const crypto = require('crypto');
const { sendResetEmail, sendOtpEmail, sendWelcomeEmail } = require('../utils/mail');

// Register
router.post('/register', async (req, res) => {
    try {
        console.log("Register request body:", req.body);
        const { name, email, password, role, department, year, registrationNumber, phoneNumber } = req.body;

        // Basic Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ msg: 'Please provide all required fields: name, email, password, and role' });
        }

        // Prevent admin and faculty registration via public endpoint
        if (role === 'admin' || role === 'faculty') {
            return res.status(403).json({ msg: 'Admin and Faculty accounts must be created by administrators' });
        }

        // Determine which model to use
        const Model = role === 'faculty' ? Faculty : Student;

        // Validation for student role
        if (role === 'student') {
            if (!department) return res.status(400).json({ msg: 'Department is required' });
            if (!year) return res.status(400).json({ msg: 'Academic year is required' });
            if (!registrationNumber) return res.status(400).json({ msg: 'Registration number is required' });
            if (!phoneNumber) return res.status(400).json({ msg: 'Phone number is required' });
        }

        // Check if user already exists
        const normalizedEmail = email.toLowerCase().trim();
        let existingUser = await Model.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ msg: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
            department,
            registrationNumber,
            phoneNumber
        };

        // Add year only for students
        if (role === 'student') {
            userData.year = year;
        }

        const user = new Model(userData);
        await user.save();

        // Send welcome email (asynchronous notification)
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (mailErr) {
            console.error('Welcome email failed:', mailErr.message);
            // We don't fail the registration if only the welcome email fails
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    department: user.department,
                    year: user.year,
                    registrationNumber: user.registrationNumber,
                    phoneNumber: user.phoneNumber
                }
            });
        });
    } catch (err) {
        console.error('Register error:', err.message);

        // MongoDB not connected
        if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.message?.includes('buffering timed out')) {
            return res.status(503).json({ msg: 'Database connection failed. Please try again in a moment.' });
        }

        // Duplicate email (race condition)
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }

        // Validation error
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }

        res.status(500).json({ msg: 'Registration failed. Please try again.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate required fields
        if (!email || !password || !role) {
            return res.status(400).json({ msg: 'Please provide email, password, and role' });
        }

        // Handle admin login with hardcoded credentials
        if (role === 'admin') {
            console.log('Admin login attempt:', { email, role });
            console.log('Expected:', {
                adminEmail: process.env.ADMIN_EMAIL,
                passwordMatch: password === process.env.ADMIN_PASSWORD
            });

            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const payload = { user: { id: 'admin', role: 'admin' } };
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        user: {
                            id: 'admin',
                            name: 'Administrator',
                            role: 'admin',
                            email: process.env.ADMIN_EMAIL
                        }
                    });
                });
            } else {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }
            return;
        }

        // Determine which model to query based on role
        const Model = role === 'faculty' ? Faculty : Student;

        let user = await Model.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

        // Check if account is locked
        if (user.isLocked) {
            return res.status(403).json({ msg: 'Account is locked. Please contact administrator' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    department: user.department,
                    year: user.year,
                    registrationNumber: user.registrationNumber,
                    phoneNumber: user.phoneNumber
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Test endpoint to list all users (for debugging)
router.get('/test-users', async (req, res) => {
    try {
        const students = await Student.find().select('name email role department year createdAt');
        const faculty = await Faculty.find().select('name email role department createdAt');

        res.json({
            students: students.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                department: u.department,
                year: u.year,
                createdAt: u.createdAt || u._id.getTimestamp()
            })),
            faculty: faculty.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                department: u.department,
                createdAt: u.createdAt || u._id.getTimestamp()
            }))
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ msg: 'Please provide email and role' });
        }

        const Model = role === 'faculty' ? Faculty : Student;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await Model.findOne({ email: normalizedEmail });

        if (!user) {
            // For security reasons, don't reveal if user exists
            return res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set expiry
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        try {
            await sendResetEmail(user.email, user.name, resetToken, role);
            res.json({ msg: 'Reset email sent successfully' });
        } catch (mailErr) {
            console.error('Mail error:', mailErr);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ msg: 'Error sending email' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, role, password } = req.body;

        if (!token || !role || !password) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const Model = role === 'faculty' ? Faculty : Student;

        const user = await Model.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset tokens
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ─── OTP-based Password Reset ───────────────────────────────────────────────

// Step 1: Send OTP to email
router.post('/send-otp', async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ msg: 'Please provide email and role' });
        }

        const Model = role === 'faculty' ? Faculty : Student;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await Model.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ msg: `No ${role} account found with that email address.` });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.otpVerified = false;
        await user.save();

        try {
            await sendOtpEmail(user.email, user.name, otp, role);
            res.json({ msg: 'OTP sent successfully to your email.' });
        } catch (mailErr) {
            console.error('OTP delivery failed:', mailErr.message);
            // If the email fails, we return a 500 error so the frontend knows it failed
            return res.status(500).json({ 
                msg: 'Failed to send OTP email. Please check your internet connection or try again later.',
                error: mailErr.message 
            });
        }
    } catch (err) {
        console.error('Send OTP error:', err.message);
        if (err.name === 'MongooseError' || err.message?.includes('buffering timed out')) {
            return res.status(503).json({ msg: 'Database connection failed. Please try again in a moment.' });
        }
        res.status(500).json({ msg: 'Failed to send OTP. Please try again.' });
    }
});

// Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, role, otp } = req.body;
        if (!email || !role || !otp) {
            return res.status(400).json({ msg: 'Email, role, and OTP are required' });
        }

        const Model = role === 'faculty' ? Faculty : Student;
        const user = await Model.findOne({ email: email.toLowerCase().trim() });

        if (!user || !user.otpCode || !user.otpExpires) {
            return res.status(400).json({ msg: 'Invalid request. Please request a new OTP.' });
        }

        if (Date.now() > user.otpExpires.getTime()) {
            user.otpCode = undefined;
            user.otpExpires = undefined;
            user.otpVerified = false;
            await user.save();
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        if (user.otpCode !== otp.trim()) {
            return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }

        // OTP is valid — mark as verified but don't clear yet (needed for reset step)
        user.otpVerified = true;
        await user.save();

        res.json({ msg: 'OTP verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Step 3: Reset password (after OTP verified)
router.post('/reset-password-otp', async (req, res) => {
    try {
        const { email, role, password } = req.body;
        if (!email || !role || !password) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const Model = role === 'faculty' ? Faculty : Student;
        const user = await Model.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (!user.otpVerified) {
            return res.status(403).json({ msg: 'OTP not verified. Please complete OTP verification first.' });
        }

        // Ensure OTP session hasn't expired
        if (!user.otpExpires || Date.now() > user.otpExpires.getTime()) {
            return res.status(400).json({ msg: 'OTP session expired. Please start over.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear OTP fields
        user.otpCode = undefined;
        user.otpExpires = undefined;
        user.otpVerified = false;

        await user.save();
        res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
