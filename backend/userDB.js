// backend/userDB.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Make username required
        unique: true      // Ensure usernames are unique
    },
    password: {
        type: String,
        required: true 
    },
});


module.exports = mongoose.model('Register', userSchema); 