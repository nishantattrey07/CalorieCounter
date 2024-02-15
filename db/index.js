const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongodb)


const AdminSchema = new mongoose.Schema({
    // Schema definition here
    name: {type:String, required:true},
    email: { type: String, unique: true, require: true },
    username: { type: String, unique: true, require: true },
    password: { type: String, require:true},
});
const Admin = mongoose.model('Admin', AdminSchema);
// const User = mongoose.model('User', UserSchema);
// const Food = mongoose.model('Food', FoodSchema);
module.exports = {
    Admin
}