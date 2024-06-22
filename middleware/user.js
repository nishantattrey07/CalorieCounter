const jwt = require('jsonwebtoken')
require('dotenv').config();

function userMiddleware(req, res, next) { 
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try { 
        const verified = jwt.verify(token, process.env.token_secret);
        if (verified.username) {
            req.user = verified;
            next();
        }
        else {
            res.status(403).json({
                msg: "No user found"
            })
        }
        
    }
    catch (err) {
        res.status(400).send('Invalid Token');
        console.log(err);
    }

}
module.exports = userMiddleware;