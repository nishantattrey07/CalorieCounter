const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongodb)

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    addedFood: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Food'
    }]
});

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    calories: { type: Number, required: true },
    quantity: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    global: { type: Boolean, default: false }
});



const Admin = mongoose.model('Admin', AdminSchema);
const User = mongoose.model('User', UserSchema);
const Food = mongoose.model('Food', FoodSchema);
module.exports = {
    Admin,
    User,
    Food
}