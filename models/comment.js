var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            // mongoose.Schema.Types.objectId is how we can access the unique id provided by Mongo. This tells us which user made each comment
            type: mongoose.Schema.Types.ObjectId,
            // The ref option is what tells Mongoose which model to use during population.
            ref: "User"
        },
        username: String
    }
});

// The first argument represents a single collection that the model is for
module.exports = mongoose.model("Comment", commentSchema);