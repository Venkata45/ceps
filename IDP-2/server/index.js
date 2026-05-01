require('dotenv').config();
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
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://ceps-e20-chi.vercel.app',
            /\.vercel\.app$/
        ],
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

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
