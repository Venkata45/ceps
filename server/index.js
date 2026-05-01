try {
    require('dotenv').config();
    console.log('🚀 Step 1: Dotenv loaded');

    const express = require('express');
    console.log('🚀 Step 2: Express loaded');

    const mongoose = require('mongoose');
    console.log('🚀 Step 3: Mongoose loaded');

    const cors = require('cors');
    const http = require('http');
    const { Server } = require('socket.io');
    const path = require('path');
    console.log('🚀 Step 4: Core modules loaded');

    const app = express();
    const server = http.createServer(app);
    
    // Diagnostic: Print current directory and files
    console.log('📂 Current Directory:', process.cwd());
    console.log('📂 Directory Name:', __dirname);

    const io = new Server(server, {
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    console.log('🚀 Step 5: Socket.io initialized');

    app.use(express.json());
    app.use(cors({ origin: true, credentials: true }));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', time: new Date() });
    });

    console.log('🚀 Step 6: Middleware configured');

    // DB Connection
    if (!process.env.MONGO_URI) {
        console.error('❌ CRITICAL: MONGO_URI is missing!');
    } else {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log('✅ Step 7: MongoDB Connected'))
            .catch(err => console.error('❌ MongoDB Error:', err.message));
    }

    app.use((req, res, next) => {
        req.io = io;
        next();
    });

    console.log('🚀 Step 8: Loading Routes...');
    app.use('/api/auth', require('./routes/authRoutes'));
    console.log('✅ Auth Routes loaded');
    app.use('/api/events', require('./routes/eventRoutes'));
    app.use('/api/attendance', require('./routes/attendanceRoutes'));
    app.use('/api/feedback', require('./routes/feedbackRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    console.log('✅ All Routes loaded');

    const PORT = process.env.PORT || 10000;
    server.listen(PORT, () => {
        console.log(`✨ PERFECT: Server running on port ${PORT}`);
    });

} catch (error) {
    console.error('❌ CRITICAL STARTUP ERROR:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
}
