const axios = require('axios');

async function testLogin() {
    console.log('\n🔐 Testing Faculty Login...\n');

    // Test with existing faculty email
    const testCredentials = {
        email: '231fa04e20.pysec18@gmail.com',  // Existing faculty email
        password: 'test123',  // Try this password
        role: 'faculty'
    };

    console.log('📝 Login Attempt:');
    console.log('   Email:', testCredentials.email);
    console.log('   Password:', testCredentials.password);
    console.log('   Role:', testCredentials.role);
    console.log();

    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', testCredentials);
        console.log('✅ Login Successful!');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.log('❌ Login Failed!');
        console.log('Status Code:', error.response?.status);
        console.log('Error Message:', error.response?.data?.msg || error.message);
        console.log();

        if (error.response?.status === 400) {
            console.log('📋 Possible Reasons for 400 Error:');
            console.log('   1. Email does not exist in database');
            console.log('   2. Password is incorrect');
            console.log('   3. Role is not provided or invalid');
            console.log('   4. Missing required fields');
            console.log();
            console.log('💡 Solution:');
            console.log('   1. Check existing faculty emails: node check_users.js');
            console.log('   2. Create a NEW faculty account through admin dashboard');
            console.log('   3. Use the exact email and password you set');
        }
    }
}

testLogin();
