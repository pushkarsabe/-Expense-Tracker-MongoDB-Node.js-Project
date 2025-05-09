const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    ispremiumuser: {
        type: Boolean,
        default: false,
    },
    totalExpenses: {
        type: Number,
        default: 0,
    },
    monthlyBudget: {
        type: Number,
        default: 0, 
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
