const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    title: String,
    content: String,
    status: String,
    timeStart: Date,
    timeFinish: Date,
    listUser: Array,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: String
}, {
    timestamps: true,
    collection: 'tasks'
});

const Task = mongoose.model("Task", taskSchema, "tasks");

module.exports = Task;
