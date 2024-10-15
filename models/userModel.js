
const { mongoose, Schema } = require('mongoose');


// Define the Customer schema
const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        otp: {
            type: String
        },
        otpTimestamp: {
            type: Date
        },
        newotp: {
            type: String
        },
        newotpTimestamp: {
            type: Date
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        role: {
            type: String,
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);


const User = mongoose.model('User', userSchema);

module.exports = User;