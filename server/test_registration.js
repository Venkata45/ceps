const API_URL = 'http://localhost:5001/api/auth';

async function testRegistration() {
    try {
        console.log('Testing student registration...\n');

        const studentData = {
            name: 'Test Student',
            email: 'teststudent' + Date.now() + '@example.com',
            password: 'password123',
            role: 'student',
            department: 'CSE',
            year: '3',
            registrationNumber: 'TEST' + Date.now(),
            phoneNumber: '1234567890'
        };

        console.log('Sending data:', studentData);

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        console.log('\nResponse status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Student registration SUCCESS!');
        } else {
            console.log('\n❌ Student registration FAILED');
            console.log('Error:', data.msg || data.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRegistration();
