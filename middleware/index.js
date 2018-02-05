var Campground = require("../models/campground");
var Comment = require("../models/comment");

// All middleware goes in
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // This line is checking whether the user is logged in
    if(req.isAuthenticated()){
        // This is finding the campground by its unique ID
          Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                // "back" will take the user back to the previous page
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // The line below will compare the ID of the user who created the campground, to the user who is currently logged in. .equals is a Mongoose method. This is used because foundCampground.author.id is an object and req.user._id is a string. If we tried to compare via triple equals they would not be the same.
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next(); 
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        }); 
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    // This line is checking whether the user is logged in
    if(req.isAuthenticated()){
        // This is finding the comment by its unique ID
       Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "You do not have permission to do that");
                // "back" will take the user back to the previous page
                res.redirect("back");
            } else {
                // The line below will compare the ID of the user who created the comment to the user who is currently logged in. .equals is a Mongoose method. This is used because foundComment.author.id is an object and req.user._id is a string. If we tried to compare via triple equals they would not be the same.
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next(); 
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        }); 
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// This middleware can be used anywhere we want to check whether a user is logged in. 
// middlewareObj.isLoggedIn = function(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "You need to be logged in to do that");
//     res.redirect("/login");
// };

middlewareObj.isLoggedIn = function(req, res, next){
    // if user is authenticated then go to the next function in the middleware chain
    if(req.isAuthenticated()){
        return next();
    }
    // otherwise disrupt the middleware chain, set the session property of redirectTo equal to the originalUrl from the request
    req.session.redirectTo = req.originalUrl;
    // flash an error message
    req.flash("error", "You need to be logged in to do that");
    // and redirect to /login where, once the user logs in, they will be redirected back to the previous page
    res.redirect("/login");
}

module.exports = middlewareObj;