// models/DownloadExpense.js
const mongoose = require('mongoose');

const downloadExpenseSchema = new mongoose.Schema({
    URL: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }

}, {
    timestamps: true,
});

const DownloadExpense = mongoose.model('DownloadExpense', downloadExpenseSchema);

module.exports = DownloadExpense;
