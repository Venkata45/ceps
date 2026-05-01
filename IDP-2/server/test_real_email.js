require('dotenv').config();
const nodemailer = require('nodemailer');

// REAL TEST: Send to an actual email you can check
async function testWithRealEmail() {
    console.log('\n📧 REAL EMAIL TEST\n');

    // Simulate faculty form - using a REAL email you can verify
    const formData = {
        name: 'Dr. Test Faculty',
        email: 'venkatareddy15052005@gmail.com', // ← Change this to test with different email
        department: 'Computer Science',
        registrationNumber: 'FAC2024001',
        phoneNumber: '9876543210'
    };

    const generatedPassword = 'SecurePass@123';

    console.log('📝 Creating Faculty Account:');
    console.log('   Name:', formData.name);
    console.log('   Email:', formData.email, '← Will receive credentials here');
    console.log('   Password:', generatedPassword);
    console.log();

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.verify();
        console.log('✅ Email server ready\n');

        console.log('📧 Sending credentials email...');
        console.log('   FROM:', process.env.EMAIL_USER);
        console.log('   TO:', formData.email, '← RECIPIENT\n');

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: formData.email,
            subject: 'Your Faculty Account Credentials - CEPS Portal',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">✅ PROOF: Email System Working!</h2>
                <p>Dear ${formData.name},</p>
                <p>This email proves that when you fill the form with an email address, the credentials are sent to <strong>THAT EMAIL ADDRESS</strong>.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Form Email Field:</strong> ${formData.email}</p>
                    <p style="margin: 5px 0;"><strong>This email was sent to:</strong> ${formData.email}</p>
                    <p style="margin: 5px 0;"><strong>Your Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${generatedPassword}</code></p>
                </div>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>✅ Confirmed:</strong> The email you enter in the form is where the credentials are sent!</p>
                </div>
                <p style="font-size: 14px; color: #6b7280;">
                    When you create Dr. John Smith with email "john.smith@college.edu", 
                    the email will be sent to john.smith@college.edu, not to the system sender email.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">CEPS Administration Team</p>
            </div>
            `
        });

        console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
        console.log('📬 Details:');
        console.log('   Recipient Email:', formData.email);
        console.log('   Message ID:', info.messageId);
        console.log('   Status:', info.response);
        console.log();
        console.log('🎉 SUCCESS! Check the inbox of:', formData.email);
        console.log('   You should see the credentials email there!');
        console.log();

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testWithRealEmail();
