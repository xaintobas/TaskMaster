const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};