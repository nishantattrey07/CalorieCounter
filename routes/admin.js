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
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
    email: z.string().email()
}).strict();

const foodSchema = z.object({
    category: z.enum(['Fruit', 'Vegetables', 'Grains', 'Protiens', 'Dairy', 'Beverages', 'Preapared Foods', 'others']),
    name: z.string(),
    protein: z.number().positive(),
    fat: z.number().positive(),
    carbs: z.number(),
    calories:z.number(),
    quantity: z.string()
});


function validateAdmin(username, name, email, password) {
    let data = adminSchema.safeParse({ username, name, email, password });
    return data.success ? true : false;
}

function validateFood(category, name, protien, fat, carbs, quantity) { 
    let data = foodSchema.safeParse({ category, name, protien, fat, carbs, quantity });
    if (!data.success) return data.error;
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
                    console.log("Admin is being saved")
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
            console.log(err);
            return res.status(422).send("Invalid input");
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
        console.log("login is working")
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
router.get('/profile/users/:username', adminMiddleware, async (req, res) => {
    const userId = req.params.username;
    const userProfile = await User.findOne({ username: userId });
    res.json({
        username: userProfile.username,
        name: userProfile.name,
        email: userProfile.email
    });
});


router.post('/addFood', adminMiddleware, async (req, res) => {
    const { category, name, protien, fat, carbs, quantity } = req.body;
    if (validateFood(category, name, protien, fat, carbs, quantity)) {
        try {
            if (await Food.exists({ name: name })) return res.status(409).send(`${name} already exists.`);
            else {
                let newFoodItem = new Food({ category, name, protien, fat, carbs, quantity,global:true});
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
        
    }
    else { 
        res.json({
            msg:data.error
        });
    }
})
module.exports = router;