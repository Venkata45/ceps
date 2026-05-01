require('dotenv').config();
const nodemailer = require('nodemailer').default || require('nodemailer');

async function testEmail() {
    try {
        console.log('\n🧪 Testing Email Configuration...\n');

        // Check environment variables
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('❌ Email credentials not configured in .env file');
            return;
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verify connection
        console.log('\n📡 Verifying connection to Gmail...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!\n');

        // Send test email
        console.log('📧 Sending test email...');
        const testEmail = process.env.EMAIL_USER; // Send to yourself

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: testEmail,
            subject: 'Test Email - CEPS Faculty Credentials System',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">✅ Email System Working!</h2>
                <p>This is a test email to verify the faculty credentials email system.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Sample Faculty Email:</strong> faculty@example.com</p>
                    <p style="margin: 5px 0;"><strong>Sample Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">Test123!@#</code></p>
                </div>
                <p>When you create a faculty account through the admin panel, an email like this will be automatically sent to the faculty member with their login credentials.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">CEPS Administration Team</p>
            </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📨 Sent to:', testEmail);
        console.log('📮 Response:', info.response);
        console.log('\n✨ Email system is working perfectly!\n');

    } catch (error) {
        console.error('\n❌ Email test failed:');
        console.error('Error:', error.message);

        if (error.code === 'EAUTH') {
            console.error('\n⚠️  Authentication failed. Possible reasons:');
            console.error('1. Incorrect app password');
            console.error('2. 2-Step Verification not enabled on Gmail account');
            console.error('3. App password not generated correctly');
            console.error('\n📖 How to fix:');
            console.error('1. Go to Google Account Settings');
            console.error('2. Enable 2-Step Verification');
            console.error('3. Generate an App Password for "Mail"');
            console.error('4. Update EMAIL_PASSWORD in .env with the app password (no spaces)');
        }

        console.error('\n');
    }
}

testEmail();
