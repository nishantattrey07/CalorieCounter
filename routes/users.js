const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, User, Food } = require("../db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
require('dotenv').config();
const router = Router();

const saltRounds = 10;
const userSchema = z.object({
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
    email: z.string().email()
}).strict();

const foodSchema = z.object({
    category: z.enum(['Fruit', 'Vegetables', 'Grains', 'Protiens', 'Dairy', 'Beverages', 'Preapared Foods', 'others']),
    name: z.string(),
    protien: z.number().positive(),
    fat: z.number().positive(),
    carbs: z.number(),
    quantity: z.string()
});

function validateUser(name, username, email, password) { 
    let data = userSchema.safeParse({ name, username, email, password });
    return data.success ? true : false;

}
router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    if (validateUser(name, username, email, password)) { 
        try {
            const existingUser = await User.findOne({ username: username });
            if (!existingUser) { 
                try {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    const newUser = new User({ name, username, email, password: hashedPassword });
                    await newUser.save();
                    const token = jwt.sign({ username: username }, process.env.TOKEN_SECRET, {expiresIn:'7d'});
                    res.status(201).json({
                        token: token,
                        username: username,
                        id:newUser._id
                    });
                } catch (err) { 
                    console.log(err);
                    return res.status(404).send(`Our server has some issue`);
                }
            } else return res.status(409).send("Username already exists.");
        }
        catch (err) {
            console.error(err);
            return res.status(422).send("Invalid input");
        }
    } else return res.status(422).send("Invalid input");

});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: username });
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (existingUser && validPassword) {
        const token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
        res.header('auth-token', token).json({
            token: token
        });
    }
    else {
        return res.status(401).send('Wrong credentials');
    }
});

module.exports = router;