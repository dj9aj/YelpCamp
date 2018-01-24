var express = require("express");
// The mergeParams parameter will merge the params from the campground and the comment together so that inside the comments routes, we can access the :id that we have defined. The comments routes are childs of the parent campground, so the req.params are not naturally available to the child routes.
var router = express.Router({mergeParams: true});
// The two lines below will insure that the Campground and Comment models are defined when we use them in our code below
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ===============
// Comments Routes
// ===============


// COMMENTS NEW - The below route is a nested route as the comments are dependent on the campground and its particular id. This will bring up the new comments page for the chosen campground. The isLoggedIn middleware will check if the user is logged in first. If the user is not logged in, they will be redirected to the login form.
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            console.log(err);
        } else {
            // We're passing through the campground argument from the callback above to comments.ejs. This represents the campground from findById. This will render the new comments page for the specific campground.
              res.render("comments/new", {campground: campground});
        }
    });
});

// COMMENTS CREATE - This will create the comment and post it to the campground show page.
router.post("/", middleware.isLoggedIn, function(req, res){ 
    // We're first looking up the campground by its id.
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // We're then creating the new comment. The first argument finds the data inputted to the form by the user.
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // Add username and ID to comment
                    // Both lines below are taking the id and username from the req object. This will depend on who is logged in, and it will plug the details into the comment model.
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // Save comment
                    comment.save();
                    // We're then associating the comment to the campground. campground refers to the callback from findById. comments refers to the property on the Campground Schema. And then we push comment into the array. comment refers to the comment created by the user.
                    campground.comments.push(comment._id);
                    // We then need to save this to the database.
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    // We're concatinating the string by adding the campground id to the end. This will redirect the user back to the show page with the new comment included.
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
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // This line is finding the comment by its unique ID, the second argument contains the data to update the comment with (new text inputted from user), and then the callback. We only need to state req.body.comment as opposed to req.body.comment.text, because that is the only property on the object, therefore it will return the text anyway.
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});




module.exports = router;