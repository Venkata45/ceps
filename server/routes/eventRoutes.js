const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const outcomesDir = path.join(__dirname, '..', 'uploads', 'outcomes');
fs.mkdirSync(outcomesDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, outcomesDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX files are allowed.'));
        }
    }
});

// Helper function to get user from either Student or Faculty collection
const getUser = async (userId) => {
    if (userId === 'admin') {
        return {
            id: 'admin',
            role: 'admin',
            name: 'Administrator',
            email: process.env.ADMIN_EMAIL
        };
    }

    let user = await Student.findById(userId);
    if (!user) {
        user = await Faculty.findById(userId);
    }
    return user;
};

// Helper function to update event status based on date
const updateEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventEndTime = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration

    if (now >= eventEndTime) {
        event.status = 'Completed';
    } else if (now >= eventDate) {
        event.status = 'Ongoing';
    } else {
        event.status = 'Upcoming';
    }
    return event;
};

// Test authentication endpoint
router.get('/test-auth', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({
            message: 'Authentication working',
            user: { id: user.id, name: user.name, role: user.role },
            tokenReceived: !!req.header('x-auth-token')
        });
    } catch (err) {
        console.error('Test auth error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all events with automatic status updates
router.get('/', async (req, res) => {
    try {
        let events = await Event.find().sort({ date: 1 });

        // Update status for all events based on current time
        events = events.map(event => updateEventStatus(event));

        // Save updated events if status changed
        for (let event of events) {
            await event.save();
        }

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single event with status update
router.get('/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return next();
        }

        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        event = updateEventStatus(event);
        await event.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update event status (admin/faculty only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await getUser(req.user.id);

        if (!['admin', 'faculty'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        event.status = status;
        await event.save();

        if (req.io) {
            req.io.emit('updateEvent', event);
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Only administrators can create events' });
        }

        // Log payment configuration
        console.log('📦 Received event data:', JSON.stringify(req.body, null, 2));
        console.log('💰 Payment Config:', {
            paymentRequired: req.body.paymentRequired,
            registrationFee: req.body.registrationFee,
            upiId: req.body.upiId,
            paymentMethod: req.body.paymentMethod
        });

        // Explicitly map fields to ensure they are saved
        const eventData = {
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            venue: req.body.venue,
            type: req.body.type,
            capacity: req.body.capacity,
            trainer: req.body.trainer,
            paymentRequired: req.body.paymentRequired === true,
            registrationFee: parseFloat(req.body.registrationFee) || 0,
            upiId: req.body.upiId,
            paymentMethod: req.body.paymentMethod || 'Free'
        };

        if (req.user.id !== 'admin') {
            eventData.createdBy = req.user.id;
        }

        const newEvent = new Event(eventData);

        // Set initial status based on event date
        const updatedEvent = updateEventStatus(newEvent);

        const event = await updatedEvent.save();

        console.log('✅ Event saved with payment fields:', {
            title: event.title,
            paymentRequired: event.paymentRequired,
            registrationFee: event.registrationFee,
            upiId: event.upiId
        });

        // Emit socket event
        if (req.io) {
            req.io.emit('newEvent', event);
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Register for Event
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const user = await getUser(req.user.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Update status before checking registration
        updateEventStatus(event);
        await event.save();

        if (event.status !== 'Upcoming') {
            return res.status(400).json({ msg: 'Registration is only open for upcoming events' });
        }

        // Check if already registered (Compare strings)
        if (event.registeredUsers.some(id => id.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already registered' });
        }

        // Check capacity
        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ msg: 'Event is full' });
        }

        event.registeredUsers.push(req.user.id);
        await event.save();

        if (req.io) {
            req.io.emit('updateEvent', event);
        }

        res.json({
            msg: 'Successfully registered for the event',
            event: event,
            seatsAvailable: event.capacity - event.registeredUsers.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Submit payment for event (students only)
router.post('/:id/payment', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const user = await getUser(req.user.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        if (!event.paymentRequired) {
            return res.status(400).json({ msg: 'This event does not require payment' });
        }

        // Check if user is a student
        if (user.role !== 'student') {
            return res.status(403).json({ msg: 'Only students can submit payment' });
        }

        const { transactionId, amount, studentDetails } = req.body;

        if (!transactionId) {
            return res.status(400).json({ msg: 'Transaction ID is required' });
        }

        // Check if payment already submitted
        const existingPayment = event.payments?.find(p => p.userId.toString() === req.user.id);
        if (existingPayment) {
            return res.status(400).json({
                msg: 'Payment already submitted',
                status: existingPayment.status
            });
        }

        // Create payment record
        if (!event.payments) {
            event.payments = [];
        }

        event.payments.push({
            userId: req.user.id,
            userName: studentDetails?.name || user.name,
            userEmail: studentDetails?.email || user.email,
            userPhone: studentDetails?.phone,
            studentId: studentDetails?.studentId,
            amount: amount || event.registrationFee,
            paymentMethod: 'UPI',
            transactionId: transactionId,
            status: 'Pending',
            submittedAt: new Date()
        });

        // Now register the user (payment will be verified later by admin)
        if (!event.registeredUsers.some(id => id.toString() === req.user.id)) {
            // Check capacity
            if (event.registeredUsers.length >= event.capacity) {
                return res.status(400).json({ msg: 'Event is full' });
            }
            event.registeredUsers.push(req.user.id);
        }

        await event.save();

        if (req.io) {
            req.io.emit('updateEvent', event);
        }

        res.json({
            msg: 'Payment submitted successfully. Your registration is pending verification.',
            paymentStatus: 'Pending'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Get event statistics (admin/faculty only)
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!['admin', 'faculty'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const events = await Event.find();

        // Update status for all events
        const updatedEvents = events.map(event => updateEventStatus(event));

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);

        const stats = {
            total: updatedEvents.length,
            upcoming: updatedEvents.filter(e => e.status === 'Upcoming').length,
            ongoing: updatedEvents.filter(e => e.status === 'Ongoing').length,
            completed: updatedEvents.filter(e => e.status === 'Completed').length,
            todayEvents: updatedEvents.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= todayStart && eventDate < todayEnd;
            }).length,
            thisWeekEvents: updatedEvents.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= weekStart && eventDate < weekEnd;
            }).length,
            totalRegistrations: updatedEvents.reduce((sum, e) => sum + (e.registeredUsers?.length || 0), 0),
            totalCapacity: updatedEvents.reduce((sum, e) => sum + (e.capacity || 0), 0)
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Upload event outcome (faculty/admin only)
router.post('/outcomes/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!['admin', 'faculty'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized to upload outcomes' });
        }

        const { eventId } = req.body;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        const outcome = {
            eventId: eventId,
            eventTitle: event.title,
            facultyId: user.id,
            facultyName: user.name,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            uploadDate: new Date()
        };

        // Store outcome reference in event (you might want a separate Outcome model)
        if (!event.outcomes) {
            event.outcomes = [];
        }
        event.outcomes.push(outcome);
        await event.save();

        res.json({
            msg: 'Outcome uploaded successfully',
            outcome: {
                ...outcome,
                fileUrl: `${req.protocol}://${req.get('host')}/uploads/outcomes/${req.file.filename}`
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

// Update event
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!['admin'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized to edit events' });
        }

        const {
            title,
            description,
            date,
            venue,
            type,
            capacity,
            trainer,
            paymentRequired,
            registrationFee,
            upiId,
            paymentMethod
        } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Update event fields
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.venue = venue || event.venue;
        event.type = type || event.type;
        event.capacity = capacity || event.capacity;
        event.trainer = trainer || event.trainer;

        // Update payment fields
        if (paymentRequired !== undefined) event.paymentRequired = paymentRequired;
        if (registrationFee !== undefined) event.registrationFee = registrationFee;
        if (upiId !== undefined) event.upiId = upiId;
        if (paymentMethod !== undefined) event.paymentMethod = paymentMethod;

        // Auto-update status based on new date
        const updatedEvent = updateEventStatus(event);

        await updatedEvent.save();

        // Emit socket event for real-time updates
        if (req.io) {
            req.io.emit('updateEvent', updatedEvent);
        }

        res.json(updatedEvent);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get event outcomes (faculty/admin only)
router.get('/outcomes', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!['admin', 'faculty'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const events = await Event.find({ 'outcomes.0': { $exists: true } });
        const outcomes = [];

        events.forEach(event => {
            event.outcomes.forEach(outcome => {
                outcomes.push({
                    ...outcome,
                    eventTitle: event.title,
                    eventDate: event.date,
                    fileUrl: `${req.protocol}://${req.get('host')}/uploads/outcomes/${outcome.fileName}`
                });
            });
        });

        res.json(outcomes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Mark attendance for students (faculty/admin only)
router.post('/:id/attendance', auth, async (req, res) => {
    try {
        const user = await getUser(req.user.id);
        if (!['admin', 'faculty'].includes(user.role)) {
            return res.status(403).json({ msg: 'Not authorized to manage attendance' });
        }

        const { eventId, studentIds } = req.body;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Initialize attendance array if it doesn't exist
        if (!event.attendance) {
            event.attendance = [];
        }

        // Mark attendance for each student
        studentIds.forEach(studentId => {
            const existingAttendance = event.attendance.find(att =>
                att.studentId?.toString() === studentId.toString()
            );

            if (!existingAttendance) {
                event.attendance.push({
                    studentId: studentId,
                    present: true,
                    feedbackGiven: false,
                    markedAt: new Date()
                });
            }
        });

        await event.save();

        res.json({
            msg: 'Attendance marked successfully',
            attendanceCount: studentIds.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get student attendance
router.get('/attendance/student', auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const events = await Event.find({ 'registeredUsers': studentId });

        const attendanceRecords = [];
        events.forEach(event => {
            // Check if student has attendance record for this event
            const attendance = event.attendance?.find(att =>
                att.studentId?.toString() === studentId
            );

            if (attendance) {
                attendanceRecords.push({
                    eventTitle: event.title,
                    eventDate: event.date,
                    venue: event.venue,
                    status: event.status,
                    present: attendance.present,
                    feedbackGiven: attendance.feedbackGiven || false
                });
            }
        });

        res.json(attendanceRecords);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
