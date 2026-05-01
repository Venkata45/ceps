require('dotenv').config();
const { sendOtpEmail } = require('./utils/mail');

async function testMailUtil() {
    console.log('Testing mail utility with current .env credentials...');
    try {
        const info = await sendOtpEmail('venkatareddy15052005@gmail.com', 'Test User', '123456', 'student');
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Email sending failed!');
        console.error('Error details:', error);
    }
}

testMailUtil();
