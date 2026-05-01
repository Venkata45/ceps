require('dotenv').config();
const nodemailer = require('nodemailer');

// This simulates EXACTLY what happens when you create a faculty member
async function testLiveFacultyEmail() {
    console.log('\n📧 LIVE TEST: Sending Faculty Credentials Email\n');

    // EXACTLY what comes from your form
    const formData = {
        name: 'Dr. John Smith',                    // From "Full Name" field
        email: 'john.smith@college.edu',          // From "Email" field ← RECIPIENT
        department: 'Computer Science',            // From "Department" field
        registrationNumber: 'FAC2024001',         // From "Registration Number" field
        phoneNumber: '9876543210'                  // From "Phone Number" field
    };

    const generatedPassword = 'Test@123Demo'; // Auto-generated password

    console.log('📝 Form Data (From your screenshot):');
    console.log('   Full Name:', formData.name);
    console.log('   Email:', formData.email, '← EMAIL WILL BE SENT HERE');
    console.log('   Department:', formData.department);
    console.log('   Registration #:', formData.registrationNumber);
    console.log('   Phone:', formData.phoneNumber);
    console.log('   Generated Password:', generatedPassword);
    console.log();

    try {
        console.log('📡 Setting up email transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.verify();
        console.log('✅ Email server connection verified\n');

        console.log('📧 Preparing to send email:');
        console.log('   FROM:', process.env.EMAIL_USER, '(CEPS System)');
        console.log('   TO:', formData.email, '(Faculty Member) ← RECIPIENT\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: formData.email,  // ← THIS IS THE KEY LINE!
            subject: 'Your Faculty Account Credentials - CEPS Portal',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to CEPS Portal!</h2>
                <p>Dear ${formData.name},</p>
                <p>Your faculty account has been created by the administrator. Here are your login credentials:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${formData.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${generatedPassword}</code></p>
                </div>
                <p>Please follow these steps:</p>
                <ol>
                    <li>Go to the CEPS Portal login page</li>
                    <li>Select "Faculty" as your role</li>
                    <li>Enter your email and password</li>
                    <li><strong>Change your password immediately after first login</strong></li>
                </ol>
                <p style="color: #dc2626; font-weight: bold;">⚠️ Security Notice: Please keep these credentials secure and do not share them with anyone.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">Best regards,<br>CEPS Administration Team</p>
            </div>
            `
        };

        console.log('📤 Sending email...');
        const info = await transporter.sendMail(mailOptions);

        console.log('\n✅ EMAIL SENT SUCCESSFULLY!\n');
        console.log('📬 Confirmation Details:');
        console.log('   Message ID:', info.messageId);
        console.log('   SMTP Response:', info.response);
        console.log('   Recipient:', formData.email);
        console.log();
        console.log('🎉 The email with credentials was sent to:', formData.email);
        console.log();
        console.log('⚠️  NOTE: Since john.smith@college.edu may not be a real email,');
        console.log('   the email server accepted it but the recipient may not receive it.');
        console.log('   To test with a REAL email, replace formData.email with your own email.');
        console.log();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Details:', error);
    }
}

testLiveFacultyEmail();
