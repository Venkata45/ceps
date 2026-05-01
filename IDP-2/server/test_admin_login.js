const API_URL = 'http://localhost:5001/api/auth';

async function testAdminLogin() {
    try {
        console.log('Testing admin login...');

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@ceps.edu',
                password: 'Admin@CEPS2024',
                role: 'admin'
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ Admin login SUCCESS!');
        } else {
            console.log('❌ Admin login FAILED');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAdminLogin();
