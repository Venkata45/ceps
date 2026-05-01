const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        // Handle admin
        if (req.user.id === 'admin') {
            return res.json({
                id: 'admin',
                name: 'Administrator',
                email: process.env.ADMIN_EMAIL,
                role: 'admin'
            });
        }

        // Try to find in Student collection first
        let user = await Student.findById(req.user.id).select('-password');

        // If not found, try Faculty collection
        if (!user) {
            user = await Faculty.findById(req.user.id).select('-password');
        }

        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            registrationNumber: user.registrationNumber,
            phoneNumber: user.phoneNumber,
            isLocked: user.isLocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if admin
        if (req.user.id !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const students = await Student.find().select('-password').sort({ createdAt: -1 });
        const faculty = await Faculty.find().select('-password').sort({ createdAt: -1 });

        const allUsers = [
            ...students.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                role: s.role,
                department: s.department,
                year: s.year,
                registrationNumber: s.registrationNumber,
                phoneNumber: s.phoneNumber,
                isLocked: s.isLocked,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            })),
            ...faculty.map(f => ({
                id: f.id,
                name: f.name,
                email: f.email,
                role: f.role,
                department: f.department,
                registrationNumber: f.registrationNumber,
                phoneNumber: f.phoneNumber,
                isLocked: f.isLocked,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt
            }))
        ];

        res.json(allUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Lock/unlock user (admin only)
router.put('/:userId/lock', auth, async (req, res) => {
    try {
        const { isLocked } = req.body;

        // Check if admin
        if (req.user.id !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Try to find in Student collection first
        let userToUpdate = await Student.findById(req.params.userId);

        // If not found, try Faculty collection
        if (!userToUpdate) {
            userToUpdate = await Faculty.findById(req.params.userId);
        }

        if (!userToUpdate) return res.status(404).json({ msg: 'User not found' });

        userToUpdate.isLocked = Boolean(isLocked);
        await userToUpdate.save();

        res.json({
            msg: `User ${userToUpdate.isLocked ? 'locked' : 'unlocked'} successfully`,
            user: {
                id: userToUpdate.id,
                name: userToUpdate.name,
                email: userToUpdate.email,
                role: userToUpdate.role,
                isLocked: userToUpdate.isLocked
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, department, year, registrationNumber, phoneNumber } = req.body;

        if (req.user.id === 'admin') {
            return res.status(403).json({ msg: 'Admin profile cannot be updated via this route' });
        }

        // Try to find in Student collection first
        let userToUpdate = await Student.findById(req.user.id);
        let collection = Student;

        // If not found, try Faculty collection
        if (!userToUpdate) {
            userToUpdate = await Faculty.findById(req.user.id);
            collection = Faculty;
        }

        if (!userToUpdate) return res.status(404).json({ msg: 'User not found' });

        // Update fields
        if (name) userToUpdate.name = name;
        if (department) userToUpdate.department = department;
        if (year) userToUpdate.year = year;
        if (registrationNumber) userToUpdate.registrationNumber = registrationNumber;
        if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;

        await userToUpdate.save();

        res.json({
            msg: 'Profile updated successfully',
            user: {
                id: userToUpdate.id,
                name: userToUpdate.name,
                email: userToUpdate.email,
                role: userToUpdate.role,
                department: userToUpdate.department,
                year: userToUpdate.year,
                registrationNumber: userToUpdate.registrationNumber,
                phoneNumber: userToUpdate.phoneNumber
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
