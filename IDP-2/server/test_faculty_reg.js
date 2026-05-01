const API_URL = 'http://localhost:5001/api/auth';

async function testFacultyRegistration() {
    try {
        console.log('Testing faculty registration...\n');

        const facultyData = {
            name: 'Test Faculty',
            email: 'testfaculty' + Date.now() + '@example.com',
            password: 'password123',
            role: 'faculty',
            department: 'CSE',
            registrationNumber: 'FAC' + Date.now(),
            phoneNumber: '9876543210'
        };

        console.log('Sending data:', JSON.stringify(facultyData, null, 2));

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(facultyData)
        });

        console.log('\nResponse status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Faculty registration SUCCESS!');
        } else {
            console.log('\n❌ Faculty registration FAILED');
            console.log('Error:', data.msg || data.message);
        }
    } catch (error) {
        console.error('\n❌ Request error:', error.message);
    }
}

testFacultyRegistration();
