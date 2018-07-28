var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // Check if user is logged in
    if (req.isAuthenticated()){
        // Find campground by it's unique ID
          Campground.findById(req.params.id, function(err, foundCampground) {
            if (err) {
                // "back" will take the user back to the previous page
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // Compare ID of author to the user who is currently logged in. .equals is a Mongoose method. foundCampground.author.id is an object and req.user._id is a string. .equals will coerce the values.
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
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
    if (req.isAuthenticated()){
        // Find commeny by ID
       Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                req.flash("error", "You do not have permission to do that");
                res.redirect("back");
            } else {
                // Check if author is equal to logged in user or admin user
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
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

middlewareObj.isLoggedIn = function(req, res, next) {
    // if user is authenticated then go to the next function in the middleware chain
    if (req.isAuthenticated()) {
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