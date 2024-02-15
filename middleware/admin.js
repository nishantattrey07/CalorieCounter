const jwt = require('jsonwebtoken')
require('dotenv').config();

function adminMiddleware(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if (verified.username) {
            req.admin = verified;
            next();
        } else {
            return res.status(401).send({ msg: 'Invalid Token' });
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}

module.exports = adminMiddleware;