var express = require("express");
// Merge params from the campground and the comment together so that we can access the id. The comments routes are childs of the parent campground, so the req.params are not naturally available to the child routes.
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// ===============
// Comments Routes
// ===============

// COMMENTS NEW - Nested route as the comments are dependent on the campground and its particular id.
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) { 
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req, res) { 
    Campground.findById(req.params.id, function(err, campground) { 
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // Create comment with data inputted by user.
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // Add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // Associate comment to the campground. campground refers to the callback from findById. comments refers to the property on the Campground Schema. And then we push comment into the array. comment refers to the comment created by the user.
                    campground.comments.push(comment._id);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            //   We already know the campground ID, as this is defined in our app.js when we include the route files at the bottom. If a user is making or editing a comment ona campground, then the campground ID is already known. We can then pass req.params.id(contains campground ID) to the edit.ejs file, and make it equal to the campground_id variable we created.
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});  
        }
    });
});

// COMMENT UPDATE - Handling update logic
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;