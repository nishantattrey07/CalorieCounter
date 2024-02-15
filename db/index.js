const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongodb)

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    protien: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    quantity: { type: String, required: true }
});

const Admin = mongoose.model('Admin', AdminSchema);
// const User = mongoose.model('User', UserSchema);
const Food = mongoose.model('Food', FoodSchema);
module.exports = {
    Admin,
    Food
}