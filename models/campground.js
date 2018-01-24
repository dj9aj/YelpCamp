var mongoose = require("mongoose");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // The comments property is what associates comments with particular campgrounds. The ObjectId reference(automatically assigned by Mongo) is used to associate a comment with a campground. This will be an array of comment ids. We're not embedding the comments in here, we're just embedding an id, which is a reference to the comments. 
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            // The ref option is what tells Mongoose which model to use during population. The ref is referring to the "Comment" model.
            ref: "Comment"
        }
    ]
}); 

// This exports the model so that we can require this from app.js
module.exports = mongoose.model("Campground", campgroundSchema);
