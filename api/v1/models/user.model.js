const mongoose = require("mongoose");
const generateHelper = require("../../../helpers/generate");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    avatar: String,
    status: {
        type: String,
        default: "active",
    },
    token: String,
    phone: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: String,
}, {
    timestamps: true,
    collection: 'users'
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
