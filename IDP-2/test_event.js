const axios = require('axios');

const testCreateEvent = async () => {
    try {
        const response = await axios.post('http://localhost:5001/api/events', {
            title: 'AUTOTEST PAID EVENT',
            description: 'This is an automatically created paid event',
            date: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Main Auditorium',
            type: 'Technical',
            capacity: 100,
            paymentRequired: true,
            registrationFee: 250,
            upiId: 'test@upi',
            paymentMethod: 'UPI'
        }, {
            headers: {
                // We need a token. I'll try to bypass auth if possible or find one.
                // Since I can't easily get a token, I'll just check the code again.
            }
        });
        console.log('Event created:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

// I'll actually just check the DB after the user attempts one more time with my fix.
