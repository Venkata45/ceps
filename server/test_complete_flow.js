const axios = require('axios');

async function testCompleteFlow() {
    console.log('\n🎯 COMPLETE TEST: Create Faculty → Login as Faculty\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Step 1: Admin Login
    console.log('STEP 1: Admin Login');
    console.log('───────────────────────────────────────────────────────');
    const adminCredentials = {
        email: 'admin@ceps.edu',
        password: 'Admin@CEPS2024',
        role: 'admin'
    };

    let adminToken;
    try {
        const adminLogin = await axios.post('http://localhost:5001/api/auth/login', adminCredentials);
        adminToken = adminLogin.data.token;
        console.log('✅ Admin logged in successfully');
        console.log('   Token:', adminToken.substring(0, 20) + '...');
    } catch (error) {
        console.log('❌ Admin login failed:', error.response?.data?.msg || error.message);
        return;
    }

    console.log('\n');

    // Step 2: Create Faculty Account
    console.log('STEP 2: Admin Creates Faculty Account');
    console.log('───────────────────────────────────────────────────────');
    const timestamp = Date.now();
    const newFaculty = {
        name: 'Demo Faculty',
        email: `demo.faculty.${timestamp}@ceps.edu`,
        department: 'Computer Science',
        registrationNumber: 'FAC' + timestamp,
        phoneNumber: '9876543210',
        password: 'FacultyPass@123'  // Admin sets this password
    };

    console.log('Faculty Details:');
    console.log('   Name:', newFaculty.name);
    console.log('   Email:', newFaculty.email);
    console.log('   Password:', newFaculty.password, '← Admin sets this');

    try {
        const createResponse = await axios.post(
            'http://localhost:5001/api/admin/faculty',
            newFaculty,
            { headers: { 'x-auth-token': adminToken } }
        );
        console.log('✅ Faculty account created successfully');
        console.log('   ID:', createResponse.data.faculty.id);
        console.log('   Email:', createResponse.data.faculty.email);
        console.log('   Password from response:', createResponse.data.credentials.password);
    } catch (error) {
        console.log('❌ Failed to create faculty:', error.response?.data?.msg || error.message);
        return;
    }

    console.log('\n');

    // Step 3: Faculty Login
    console.log('STEP 3: Faculty Login with Created Credentials');
    console.log('───────────────────────────────────────────────────────');
    const facultyCredentials = {
        email: newFaculty.email,
        password: newFaculty.password,  // Using the password admin set
        role: 'faculty'
    };

    console.log('Login Attempt:');
    console.log('   Email:', facultyCredentials.email);
    console.log('   Password:', facultyCredentials.password);
    console.log('   Role:', facultyCredentials.role);

    try {
        const facultyLogin = await axios.post('http://localhost:5001/api/auth/login', facultyCredentials);
        console.log('\n✅✅✅ FACULTY LOGIN SUCCESSFUL! ✅✅✅');
        console.log('\nFaculty Details:');
        console.log('   ID:', facultyLogin.data.user.id);
        console.log('   Name:', facultyLogin.data.user.name);
        console.log('   Email:', facultyLogin.data.user.email);
        console.log('   Role:', facultyLogin.data.user.role);
        console.log('   Token:', facultyLogin.data.token.substring(0, 20) + '...');
        console.log('\n🎉 COMPLETE FLOW WORKS PERFECTLY!');
        console.log('   1. Admin created faculty with password: FacultyPass@123');
        console.log('   2. Faculty logged in with that exact password');
        console.log('   3. Successfully authenticated!');
    } catch (error) {
        console.log('❌ Faculty login failed:', error.response?.data?.msg || error.message);
        console.log('\n❌ Something went wrong. The password might not have been saved correctly.');
    }

    console.log('\n═══════════════════════════════════════════════════════\n');
}

testCompleteFlow();
