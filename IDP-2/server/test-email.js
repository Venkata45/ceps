#!/usr/bin/env node
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🧪 Testing Email Configuration...\n');

// Check environment variables
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : '❌ MISSING');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Email configuration missing in .env file!');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Test the connection
console.log('\n📧 Verifying email transporter...');
transporter.verify()
    .then(() => {
        console.log('✅ Email transporter verified successfully!');
        console.log('\n📨 Sending test email to:', process.env.EMAIL_USER);

        // Send a test email to yourself
        return transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'CEPS Portal - Email Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">✅ Email Configuration Test Successful!</h2>
                    <p>This is a test email from the CEPS Portal server.</p>
                    <p><strong>If you're reading this, email sending is working correctly!</strong></p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">CEPS Portal Test</p>
                </div>
            `
        });
    })
    .then((info) => {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n✨ Email configuration is working perfectly!');
        console.log('Check your inbox:', process.env.EMAIL_USER);
        process.exit(0);
    })
    .catch((error) => {
        console.log('\n❌ Email test failed!');
        console.log('Error:', error.message);
        if (error.code) {
            console.log('Error code:', error.code);
        }
        if (error.response) {
            console.log('SMTP response:', error.response);
        }

        console.log('\n📝 Troubleshooting tips:');
        console.log('1. Make sure 2-Step Verification is enabled on your Google account');
        console.log('2. Generate a new App Password at: https://myaccount.google.com/apppasswords');
        console.log('3. Update EMAIL_PASSWORD in your .env file with the new App Password');
        console.log('4. Make sure "Less secure app access" is NOT needed (App Passwords work better)');

        process.exit(1);
    });
