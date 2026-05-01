require('dotenv').config();
const nodemailer = require('nodemailer');

// Test the NEW system where admin provides the password
async function testAdminProvidedPassword() {
    console.log('\n🎓 TESTING: Admin-Controlled Password System\n');

    // Simulating admin filling the form
    const adminInput = {
        name: 'Dr. Test Faculty',
        email: 'venkatareddy15052005@gmail.com', // Test email
        department: 'Computer Science',
        registrationNumber: 'FAC2024TEST',
        phoneNumber: '9876543210',
        password: 'Admin@123'  // ← ADMIN PROVIDES THIS NOW!
    };

    console.log('📝 Admin Dashboard - Add Faculty Form:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Full Name       :', adminInput.name);
    console.log('Email           :', adminInput.email);
    console.log('Department      :', adminInput.department);
    console.log('Registration #  :', adminInput.registrationNumber);
    console.log('Phone Number    :', adminInput.phoneNumber);
    console.log('Password        :', adminInput.password, '← Admin sets this!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ CHANGES FROM OLD SYSTEM:');
    console.log('   OLD: Password was auto-generated (admin had no control)');
    console.log('   NEW: Admin provides password (full control) ✅\n');

    try {
        console.log('📧 Sending credentials email...\n');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminInput.email,
            subject: 'Your Faculty Account Credentials - CEPS Portal',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to CEPS Portal!</h2>
                <p>Dear ${adminInput.name},</p>
                <p>Your faculty account has been created by the administrator. Here are your login credentials:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${adminInput.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${adminInput.password}</code></p>
                </div>
                <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">🔑 This password was set by your administrator</p>
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
        });

        console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
        console.log('📬 Details:');
        console.log('   Recipient    :', adminInput.email);
        console.log('   Password Sent:', adminInput.password);
        console.log('   Message ID   :', info.messageId);
        console.log('\n🎉 Faculty can now login with:');
        console.log('   Email   :', adminInput.email);
        console.log('   Password:', adminInput.password);
        console.log('\n📧 Check inbox:', adminInput.email);
        console.log('\n✅ System working perfectly!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAdminProvidedPassword();
