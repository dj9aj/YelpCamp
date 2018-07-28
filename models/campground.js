var mongoose = require("mongoose");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {
        type: Date, 
        default: Date.now
    },   
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // The comments property associates comments with particular campgrounds. The ObjectId reference(automatically assigned by Mongo) is used to associate a comment with a campground. This will be an array of comment ids.
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            // Use comment model during population.
            ref: "Comment"
        }
    ]
}); 

module.exports = mongoose.model("Campground", campgroundSchema);
