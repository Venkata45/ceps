require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n📊 Checking Database Users...\n');

        const faculty = await Faculty.find();
        const students = await Student.find();

        console.log(`Faculty Count: ${faculty.length}`);
        console.log(`Student Count: ${students.length}\n`);

        if (faculty.length > 0) {
            console.log('📚 Faculty Members:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            faculty.forEach((f, i) => {
                console.log(`${i + 1}. ${f.name}`);
                console.log(`   Email: ${f.email}`);
                console.log(`   Role: ${f.role}`);
                console.log(`   Department: ${f.department}`);
                console.log(`   Locked: ${f.isLocked ? 'Yes' : 'No'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No faculty members found in database');
            console.log('   Create a faculty account through admin dashboard first!');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUsers();
