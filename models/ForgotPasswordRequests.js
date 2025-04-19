// models/ForgotPasswordRequest.js
const mongoose = require('mongoose');

const forgotPasswordRequestSchema = new mongoose.Schema({

    isactive: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, {
    timestamps: true,
});

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);

module.exports = ForgotPasswordRequest;
