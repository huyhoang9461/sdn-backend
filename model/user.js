const mongoose = require('mongoose')
const Schema = mongoose.Schema;

/**
 * Task 1: User Model
 * Represents a single user that can use the quiz app
 * - username: String field with default value of empty string
 * - admin: Boolean field with default value of false
 */
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    // Task 1: Admin field - boolean flag for admin privileges
    admin: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('User', userSchema);