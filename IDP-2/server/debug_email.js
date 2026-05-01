const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log('User:', process.env.EMAIL_USER);
    // Password hidden for security
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Gmail SMTP...');
        await transporter.verify();
        console.log('✅ Connection Successful!');
        
        console.log('Sending test email...');
        await transporter.sendMail({
            from: `"CEPS Portal" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'CEPS Test Email',
            text: 'If you receive this, your email configuration is PERFECT!'
        });
        console.log('✅ Test email sent successfully to ' + process.env.EMAIL_USER);
    } catch (error) {
        console.log('❌ Email Test FAILED');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('HINT: Your Gmail App Password might be incorrect or has been revoked.');
        }
    }
}

testEmail();
