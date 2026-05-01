#!/usr/bin/env node

// Quick test to verify nodemailer works
const nodemailer = require('nodemailer');

console.log('Testing nodemailer...');
console.log('nodemailer:', typeof nodemailer);
console.log('nodemailer.createTransport:', typeof nodemailer.createTransport);

if (typeof nodemailer.createTransport === 'function') {
    console.log('✅ nodemailer.createTransport is available!');

    // Try creating a transporter
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'test@gmail.com',
                pass: 'testpass'
            }
        });
        console.log('✅ Transporter created successfully!');
    } catch (err) {
        console.log('❌ Error creating transporter:', err.message);
    }
} else {
    console.log('❌ nodemailer.createTransport is NOT a function');
    console.log('Available properties:', Object.keys(nodemailer));
}
