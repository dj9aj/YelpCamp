var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            // Access unique id provided by Mongoose
            type: mongoose.Schema.Types.ObjectId,
            // Use "User"" model during population.
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);