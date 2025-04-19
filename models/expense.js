
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    money: {
        type: Number,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    options: {
        type: String,
        required: false,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, 
{
    timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
