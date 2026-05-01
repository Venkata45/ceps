require('dotenv').config();
const nodemailer = require('nodemailer').default || require('nodemailer');

// Simulate creating a faculty member
async function demoFacultyEmail() {
    console.log('\n🎓 DEMO: Creating Faculty Account\n');

    // This simulates what happens when admin fills the form
    const facultyData = {
        name: 'Dr. Demo Faculty',
        email: 'any.email@example.com', // ← THIS is where email will be sent!
        department: 'Computer Science',
        registrationNumber: 'FAC001',
        phoneNumber: '9876543210'
    };

    const generatedPassword = 'Demo@123XY'; // Auto-generated password

    console.log('📝 Form Data Entered by Admin:');
    console.log('   Name:', facultyData.name);
    console.log('   Email:', facultyData.email, '← Email will be sent HERE');
    console.log('   Department:', facultyData.department);
    console.log('   Registration:', facultyData.registrationNumber);
    console.log('   Phone:', facultyData.phoneNumber);
    console.log('   Generated Password:', generatedPassword);
    console.log();

    console.log('📧 Email Configuration:');
    console.log('   FROM (Sender):', process.env.EMAIL_USER);
    console.log('   TO (Recipient):', facultyData.email, '← Faculty member receives it here');
    console.log();

    console.log('✅ The email will be sent FROM:', process.env.EMAIL_USER);
    console.log('✅ The email will be sent TO:', facultyData.email);
    console.log();

    console.log('Note: venkatareddy15052005@gmail.com is only the SENDER,');
    console.log('      not the recipient. The faculty member receives the email');
    console.log('      at whatever email address YOU enter in the form!');
    console.log();

    // Ask if they want to send a real test
    console.log('💡 To test with a real email, update facultyData.email above');
    console.log('   and the email will be sent to that address.');
    console.log();
}

demoFacultyEmail();
