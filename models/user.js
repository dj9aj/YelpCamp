var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

// This adds the methods from passport-local-mongoose to the Schema
UserSchema.plugin(passportLocalMongoose);

// This 
module.exports = mongoose.model("User", UserSchema);