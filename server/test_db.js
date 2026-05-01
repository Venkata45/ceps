const mongoose = require('mongoose');

// Use the same URI as in .env
const uri = "mongodb://localhost:27017/ceps_db";

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check Events
        const Event = mongoose.model('Event', new mongoose.Schema({}), 'events');
        const events = await Event.find({});
        console.log('Events found:', events.length);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection Failed:', err);
    });
