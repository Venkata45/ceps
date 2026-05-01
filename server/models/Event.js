const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    trainer: {
        name: String,
        organization: String,
        domain: String,
        contact: String
    },
    venue: { type: String, required: true },
    type: { type: String, enum: ['FDP', 'SDP', 'CRT', 'Seminar', 'Sports', 'Cultural', 'Other'], default: 'Other' },
    capacity: { type: Number, required: true },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Payment Configuration
    paymentRequired: { type: Boolean, default: false },
    registrationFee: { type: Number, default: 0 },
    upiId: { type: String }, // Admin's UPI ID for this event
    paymentMethod: { type: String, enum: ['UPI', 'Razorpay', 'Free'], default: 'Free' },

    // Payment Details for each registration
    payments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        userEmail: String,
        userPhone: String,
        studentId: String,
        amount: { type: Number, required: true },
        paymentMethod: { type: String, default: 'UPI' },
        transactionId: String, // User-provided transaction ID
        paymentProofUrl: String, // Screenshot/proof uploaded by user
        status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
        submittedAt: { type: Date, default: Date.now },
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remarks: String // Admin's remarks
    }],

    outcomes: [{
        facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        facultyName: String,
        fileName: String,
        originalName: String,
        filePath: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    attendance: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        studentName: String,
        present: { type: Boolean, default: false },
        feedbackGiven: { type: Boolean, default: false },
        markedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
