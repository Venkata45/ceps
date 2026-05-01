const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get registered students for an event (to mark attendance)
router.get('/event/:eventId/students', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('registeredUsers', 'name email year department');
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Also fetch existing attendance records for this event
        const attendanceRecords = await Attendance.find({ event: req.params.eventId });

        const studentsWithAttendance = event.registeredUsers.map(student => {
            const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
            return {
                ...student._toObject(),
                attendanceStatus: record ? record.status : null // null means not marked yet
            };
        });

        res.json(studentsWithAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark Attendance (Bulk or Single)
router.post('/mark', auth, async (req, res) => {
    try {
        const { eventId, studentId, status } = req.body;

        let attendance = await Attendance.findOne({ event: eventId, student: studentId });

        if (attendance) {
            attendance.status = status;
            attendance.markedBy = req.user.id;
        } else {
            attendance = new Attendance({
                event: eventId,
                student: studentId,
                status,
                markedBy: req.user.id
            });
        }

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
