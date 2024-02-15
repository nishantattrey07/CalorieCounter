const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, User, Food } = require("../db");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = Router();


router.post('/signup', async (req, res) => {
    const { username, name, password, email } = req.body;
    const existingUser = await Admin.findOne({ username: username });
    if (!existingUser) {
        try {
            let newAdmin = new Admin({ name, username, password, email });
            await newAdmin.save();
            const token = jwt.sign({ username }, process.env.TOKEN_SECRET, {expiresIn:'7d'});
            res.header('auth-token', token).json({
                token: token,
                id: newAdmin.id,
                result:"success"
            });
        }
        catch (err) {
            console.log(err);
            return res.status(404).send(`Our server has some issue`);
        }
    } else return res.status(409).send("Username already exists.");
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await Admin.findOne({ username: username });
    if (existingUser && existingUser.password === password) {
        const token = jwt.sign({ username }, process.env.TOKEN_SECRET, {expiresIn:'7d'});
        res.header('auth-token', token).send(token);
    }
    else return res.status(401).send("Invalid username or password");
});

router.get('/users', adminMiddleware, async (req, res) => {
    const users = await find({});
    res.send(users);
});

router.get('/profile', adminMiddleware, async (req, res) => {
    const adminUsername = req.admin.username;
    const userProfile = await Admin.findOne({username:adminUsername});
    res.json({
        username: userProfile.username,
        name: userProfile.name,
        email:userProfile.email
    });
});

router.post('/addFood', adminMiddleware, (req, res) => { 
    
})
module.exports = router;