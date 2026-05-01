const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { sendCredentialsEmail, sendPaymentConfirmationEmail } = require('../utils/mail');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    if (req.user.id !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

// Get statistics (admin only)
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();

        // Get active (not locked) counts
        const activeStudents = await Student.countDocuments({ isLocked: false });
        const activeFaculty = await Faculty.countDocuments({ isLocked: false });

        res.json({
            students: {
                total: totalStudents,
                active: activeStudents,
                locked: totalStudents - activeStudents
            },
            faculty: {
                total: totalFaculty,
                active: activeFaculty,
                locked: totalFaculty - activeFaculty
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all faculty (admin only)
router.get('/faculty', auth, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(faculty);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all students (admin only)
router.get('/students', auth, isAdmin, async (req, res) => {
    try {
        const students = await Student.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all registrations (admin only)
router.get('/registrations', auth, isAdmin, async (req, res) => {
    try {
        const Event = require('../models/Event');

        // Get all events with populated registered users
        const events = await Event.find()
            .populate('registeredUsers', 'name email role')
            .select('title venue date registeredUsers paymentRequired registrationFee payments createdAt')
            .sort({ date: -1 });

        // Flatten registrations into a single array
        const registrations = [];

        for (const event of events) {
            if (event.registeredUsers && event.registeredUsers.length > 0) {
                for (const user of event.registeredUsers) {
                    // Find payment record for this user in this event
                    const paymentRecord = event.payments?.find(p => p.userId.toString() === user._id.toString());

                    registrations.push({
                        eventId: event._id,
                        eventTitle: event.title,
                        eventVenue: event.venue,
                        eventDate: event.date,
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        userRole: user.role,
                        registeredAt: event.createdAt,
                        // Payment information
                        paymentRequired: event.paymentRequired || false,
                        paymentAmount: event.registrationFee || 0,
                        paymentStatus: paymentRecord?.status || 'N/A',
                        transactionId: paymentRecord?.transactionId || null
                    });
                }
            }
        }

        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Generate random password
const generatePassword = () => {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// Add faculty (admin only)
router.post('/faculty', auth, isAdmin, async (req, res) => {
    try {
        const { name, email, department, registrationNumber, phoneNumber, password } = req.body;

        // Validate required fields
        if (!name || !email || !department || !registrationNumber || !phoneNumber || !password) {
            return res.status(400).json({ msg: 'All fields are required including password' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Check if faculty already exists
        const normalizedEmail = email.toLowerCase().trim();
        let existingFaculty = await Faculty.findOne({ email: normalizedEmail });
        if (existingFaculty) {
            return res.status(400).json({ msg: 'Faculty with this email already exists' });
        }

        // Use admin-provided password
        const facultyPassword = password;
        console.log('\n=== CREATING FACULTY ===');
        console.log('Name:', name);
        console.log('Email:', normalizedEmail);
        console.log('Password received:', password);
        console.log('Password to be used:', facultyPassword);
        console.log('========================\n');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(facultyPassword, salt);

        // Create faculty
        const faculty = new Faculty({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'faculty',
            department,
            registrationNumber,
            phoneNumber,
            isLocked: false
        });

        await faculty.save();

        // Email sending - automatically notify the faculty member
        let emailSent = false;
        let emailError = null;

        try {
            await sendCredentialsEmail(email, name, facultyPassword);
            emailSent = true;
        } catch (emailErr) {
            emailError = emailErr.message;
            console.error('❌ Failed to send email:', emailErr.message);
        }

        res.json({
            msg: emailSent
                ? 'Faculty account created and credentials emailed successfully.'
                : 'Faculty account created, but email could not be sent. Please share credentials manually.',
            emailSent,
            emailError,
            faculty: {
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                registrationNumber: faculty.registrationNumber,
                phoneNumber: faculty.phoneNumber
            },
            // Admin can see and manually share credentials as backup
            credentials: {
                email: email,
                password: facultyPassword,
                note: emailSent ? 'Email sent successfully.' : 'EMAIL FAILED: Please share these credentials manually'
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete faculty (admin only)
router.delete('/faculty/:id', auth, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ msg: 'Faculty not found' });
        }

        await Faculty.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Faculty deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Verify payment (admin only)
router.post('/verify-payment', auth, isAdmin, async (req, res) => {
    try {
        const { eventId, userId, status, remarks } = req.body;
        const Event = require('../models/Event');

        if (!['Verified', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Find the payment record
        const payment = event.payments.find(p => p.userId.toString() === userId.toString());
        if (!payment) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        // Update status
        payment.status = status;
        payment.verifiedAt = status === 'Verified' ? new Date() : null;
        payment.remarks = remarks || '';
        payment.verifiedBy = req.user.id;

        await event.save();

        // Send email notification if verified
        if (status === 'Verified') {
            try {
                await sendPaymentConfirmationEmail(
                    payment.userEmail,
                    payment.userName,
                    event.title,
                    payment.amount,
                    payment.transactionId
                );
                console.log(`✅ Confirmation email sent to ${payment.userEmail}`);
            } catch (mailErr) {
                console.error('❌ Failed to send confirmation email:', mailErr.message);
            }
        }

        res.json({ msg: `Payment ${status.toLowerCase()} successfully`, event });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Test email configuration (admin only)
router.post('/test-email', auth, isAdmin, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Email address is required' });
        }

        console.log('\n🧪 Testing email configuration...');

        // Verify email configuration exists
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return res.status(500).json({
                msg: 'Email configuration missing in .env file',
                configured: false
            });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASSWORD.trim()
            }
        });

        // Verify transporter
        await transporter.verify();
        console.log('✅ Transporter verified');

        // Send test email
        const info = await transporter.sendMail({
            from: `"CEPS Test" <${process.env.EMAIL_USER.trim()}>`,
            to: email,
            subject: 'CEPS Portal - Email Configuration Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">✅ Email Configuration Successful!</h2>
                    <p>This is a test email from the CEPS Portal.</p>
                    <p>If you're seeing this, it means the email configuration is working correctly.</p>
                    <p><strong>Sender:</strong> ${process.env.EMAIL_USER}</p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">CEPS Administration Team</p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully');
        console.log('Message ID:', info.messageId);

        res.json({
            msg: 'Test email sent successfully',
            configured: true,
            emailSentTo: email,
            messageId: info.messageId,
            from: process.env.EMAIL_USER
        });
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        res.status(500).json({
            msg: 'Email test failed',
            error: error.message,
            configured: false
        });
    }
});

module.exports = router;
