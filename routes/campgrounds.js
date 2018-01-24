var express = require("express");
// The line below allows us to create modular routes in a seperate file. We store all the routes below in the router object and then export it to our app.js file (where we require it and add it to our main application with app.use()).
var router = express.Router();
// This will insure that the Campground model is defined when we use them in our code below
var Campground = require("../models/campground");
var middleware = require("../middleware");

// =================
// CAMPGROUND ROUTES
// =================
// INDEX - Show all Campgrounds 
router.get("/", function(req, res){
    // Get all campgrounds from DB. Empty object below will find all campgrounds. 
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err)
        } else {
            // This will send all the campgrounds from the search and send them to the index.ejs file. This will insure that the allCampgrounds argument from the callback function is equal to the campgrounds variable in the index.ejs file. req.user is equal to the details of whoever is signed in at the time.
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

// CREATE - Add new Campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // Get data from form and is inserted to object below, which is then added to DB. 
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    // We're creating an object to ensure that the variables above are sent through to the index.ejs file to match up. The object is then saved to the newCampground variable which is used to create a new campground below.
    var newCampground = {name: name, image: image, description: desc, price: price, author: author};
    // Create a new Campground and save to database. We're passing in the object above, which is saved to database.
    Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       } else {
        //   If there are no error messages, we are re-directed back to the index.ejs file to display all campgrounds.
           res.redirect("/campgrounds");
       }
    });
});

// NEW - This displays form to create new Campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    // Find the campground by unique ID. The first argument finds the ID of the campground that was clicked on. The .populate.exec will pass the actual comments to the show template instead of just the comment ids.. We then pass the callback on .exec. 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            // We're passing n the foundCampground to the show template under the variable "campground".
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT - shows edit campground form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground}); 
    }); 
});

// UPDATE - handles update logic
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // The first argunment finds the campground that is being edited. The second argument will find the name, image and description properties all nested inside a single object from req.body.campground. This is because the names in the form are set as "campground[name]" etc.
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            console.log(err);
        } else {
            // The line below is concatinating a string to create the correct URL, which is the campground show page of the updated campground. We're using req.params.id to add the ID onto the end of the URL.
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE - Handles delete logic
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }
   }); 
});





// We're exporting the router, which we then require in app.js
module.exports = router;