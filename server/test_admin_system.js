const API_URL = 'http://localhost:5001/api';

async function testAdminSystem() {
    try {
        console.log('=== Testing Admin System ===\n');

        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@ceps.edu',
                password: 'Admin@CEPS2024',
                role: 'admin'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.log('❌ Admin login failed:', loginData.msg);
            return;
        }

        const token = loginData.token;
        console.log('✅ Admin logged in successfully\n');

        // Step 2: Get stats
        console.log('2. Getting statistics...');
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'x-auth-token': token }
        });
        const stats = await statsRes.json();
        console.log('✅ Statistics:', JSON.stringify(stats, null, 2), '\n');

        // Step 3: Add a faculty member
        console.log('3. Adding new faculty member...');
        const facultyData = {
            name: 'Dr. Test Professor ' + Date.now(),
            email: `professor${Date.now()}@college.edu`,
            department: 'Computer Science',
            registrationNumber: 'FAC' + Date.now(),
            phoneNumber: '9876543210'
        };

        const addFacultyRes = await fetch(`${API_URL}/admin/faculty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(facultyData)
        });

        const newFaculty = await addFacultyRes.json();
        console.log('✅ Faculty created:', newFaculty.msg);
        console.log('\n📧 Generated Credentials:');
        console.log('   Email:', newFaculty.credentials.email);
        console.log('   Password:', newFaculty.credentials.password);
        console.log('\n');

        // Step 4: Get all faculty
        console.log('4. Getting all faculty...');
        const facultyListRes = await fetch(`${API_URL}/admin/faculty`, {
            headers: { 'x-auth-token': token }
        });
        const facultyList = await facultyListRes.json();
        console.log(`✅ Total faculty count: ${facultyList.length}\n`);

        console.log('=== All Tests Passed! ===\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAdminSystem();
