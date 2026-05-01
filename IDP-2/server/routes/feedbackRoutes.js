const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// Submit Feedback
router.post('/', auth, async (req, res) => {
    try {
        const { eventId, rating, comments } = req.body;

        // Check if student attended? (Optional requirement: "Student submit feedback on trainers")
        // Usually only attended students give feedback.
        const attendance = await Attendance.findOne({
            event: eventId,
            student: req.user.id,
            status: 'Present'
        });

        if (!attendance) {
            return res.status(400).json({ msg: 'You must attend the event to submit feedback' });
        }

        // Check if already submitted
        const existingFeedback = await Feedback.findOne({ event: eventId, student: req.user.id });
        if (existingFeedback) {
            return res.status(400).json({ msg: 'Feedback already submitted' });
        }

        const feedback = new Feedback({
            event: eventId,
            student: req.user.id,
            rating,
            comments
        });

        await feedback.save();
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Feedback for an event (Admin/Faculty)
router.get('/event/:eventId', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ event: req.params.eventId }).populate('student', 'name');
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
