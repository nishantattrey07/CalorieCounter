const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, User, Food } = require("../db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
require('dotenv').config();
const router = Router();

const saltRounds = 10;


const adminSchema = z.object({
    name: z.string(),
    username: z.string().min(3),
    password: z.string().min(8),
    email: z.string().email()
});


function validateAdmin(username, name, email, password) {
    let data = adminSchema.safeParse({ username, name, email, password });
    if (!data.success) return false;
    else {
        return true;
    }
}




router.post('/signup', async (req, res) => {
    const { username, name, password, email } = req.body;
    if (validateAdmin(username, name, email, password)) {
        try {
            const existingUser = await Admin.findOne({ username: username });
            if (!existingUser) {
                try {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    let newAdmin = new Admin({ name, username, password: hashedPassword, email });
                    await newAdmin.save();
                    const token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
                    res.header('auth-token', token).json({
                        token: token,
                        id: newAdmin.id,
                        result: "success"
                    });
                }
                catch (err) {
                    console.log(err);
                    return res.status(404).send(`Our server has some issue`);
                }
            } else return res.status(409).send("Username already exists.");
        } catch (err) {
            console.error(err);
        }
    } else {
        return res.status(422).send("Invalid input");
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await Admin.findOne({ username: username });
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (existingUser && validPassword) {
        const token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
        res.header('auth-token', token).json({
            token: token
        });
    }
    else return res.status(401).send("Invalid username or password");
});

router.get('/users', adminMiddleware, async (req, res) => {
    const users = await find({});
    res.send(users);
});

router.get('/profile', adminMiddleware, async (req, res) => {
    const adminUsername = req.admin.username;
    const userProfile = await Admin.findOne({ username: adminUsername });
    res.json({
        username: userProfile.username,
        name: userProfile.name,
        email: userProfile.email
    });
});

router.post('/addFood', adminMiddleware, (req, res) => {

})
module.exports = router;