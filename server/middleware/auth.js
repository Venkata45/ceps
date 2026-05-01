const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        console.log('No token provided in request headers');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        console.log('Token used:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
