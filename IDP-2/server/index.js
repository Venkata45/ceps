require('dotenv').config();
console.log('🚀 Server starting...');
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins for now to prevent CORS blocking during deployment
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://ceps-e20-chi.vercel.app',
        /\.vercel\.app$/
    ],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check & Diagnostics
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        emailUser: process.env.EMAIL_USER ? 'Configured' : 'MISSING'
    });
});

// DB Connection
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in environment variables!');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err.message);
        });
}

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('--- Email Configuration Status ---');
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log(`✅ Email configured for: ${process.env.EMAIL_USER}`);
    } else {
        console.log('❌ EMAIL_USER or EMAIL_PASSWORD missing in Environment Variables!');
    }
    console.log('---------------------------------');
});

const shutdown = (cb) => {
    try {
        io.close();
    } catch (e) {
        cb();
        return;
    }

    server.close(() => {
        mongoose.connection.close(false)
            .then(() => cb())
            .catch(() => cb());
    });

    setTimeout(() => cb(), 3000).unref();
};

process.once('SIGINT', () => shutdown(() => process.exit(0)));
process.once('SIGTERM', () => shutdown(() => process.exit(0)));
process.once('SIGUSR2', () => shutdown(() => process.kill(process.pid, 'SIGUSR2')));

module.exports = app;
