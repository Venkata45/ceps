const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  department: { type: String }, // For faculty and students
  year: { type: String }, // For students
  registrationNumber: { type: String }, // For students
  phoneNumber: { type: String }, // For students
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
