const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, User, Food } = require("../db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const userMiddleware = require("../middleware/user");
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

function validateFood(category, name, protien, fat, carbs, quantity) { 
    let data = foodSchema.safeParse({ category, name, protien, fat, carbs, quantity });
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
                    console.log("User is being saved")
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
            console.log(err);
            return res.status(400).send("Invalid input");
        }
    } else return res.status(400).send("Invalid input");

});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: username });
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (existingUser && validPassword) {
        const token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
        res.status(200).header('auth-token', token).json({
            token: token
        });
    }
    else {
        return res.status(401).send('Wrong credentials');
    }
});

router.get('/profile/:username', userMiddleware, async (req, res) => { 
    let userId = req.params.username;
    let userProfile = await User.findOne({ username: userId });
    res.status(200).json({
        name: userProfile.name,
        username: userProfile.username,
        email:userProfile.email
    });
});

router.post('/addFood', userMiddleware, async function (req, res) {
    const username = req.user.username;
    const user = await User.findOne({ username: username });
    const { category, name, protien, fat, carbs, quantity } = req.body;
    try {
        if (await Food.exists({ name: name })) return res.status(409).send(`${name} already exists.`);
        else {
            let newFoodItem = new Food({ category, name, protien, fat, carbs, quantity,user:user._id ,global: false });
            await newFoodItem.save();
            res.json({
                message: `${name} added successfully`,
                id: newFoodItem._id
            });
        }
    }
    catch (err) {
        res.status(500).send(`Server error: ${err}`);
    }

});
router.get('/foods',userMiddleware, async (req, res) => {
    const username = req.user.username;
    const userId = await User.findOne({ username: username });
    const foodItems = await Food.find({
        $or: [{ user: userId }, { global: true }]
    });
    res.status(200).json(foodItems);
});



module.exports = router;