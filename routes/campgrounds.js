var express = require("express");
// The line below allows us to create modular routes in a seperate file. We store all the routes below in the router object and then export it to our app.js file (where we require it and add it to our main application with app.use()).
var router = express.Router();
// This will insure that the Campground model is defined when we use them in our code below
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');


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

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var price = req.body.price;
    geocoder.geocode(req.body.location, function (err, data) {
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      var location = data.results[0].formatted_address;
      var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      Campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
              res.redirect("/campgrounds");
          }
      });
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
router.put("/:id", function(req, res){
    geocoder.geocode(req.body.campground.location, function (err, data) {
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      var location = data.results[0].formatted_address;
      var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
      Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success", "Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
    });
  });

// DELETE - Handles delete logic
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           req.flash("success", "Campground Deleted!");
           res.redirect("/campgrounds");
       }
   }); 
});


// We're exporting the router, which we then require in app.js
module.exports = router;