const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'faculty' },
    department: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otpCode: String,
    otpExpires: Date,
    otpVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
