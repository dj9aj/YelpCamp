var express = require("express");
// Store all routes in the router object and then export to app.js.
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');


// =================
// CAMPGROUND ROUTES
// =================

// INDEX - Show all Campgrounds 
router.get("/", function(req, res) {
    // Get all campgrounds from DB. Empty object will find all campgrounds. 
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            // Send all campgrounds from the search to index.ejs.
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    // Get data from form and add to campgrounds array
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
      Campground.create(newCampground, function(err, newlyCreated) {
          if (err) {
              console.log(err);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
              res.redirect("/campgrounds");
          }
      });
    });
  });

// NEW - Display form to create new Campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

// SHOW - Show one campground
router.get("/:id", function(req, res) {
    // .populate.exec will pass comments to the show template instead of the comment ids.
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT - show edit campground form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
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
      Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground) {
          if (err) {
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
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndRemove(req.params.id, function(err) {
       if (err) {
           res.redirect("/campgrounds");
        } else {
           req.flash("success", "Campground Deleted!");
           res.redirect("/campgrounds");
        }
   }); 
});

// We're exporting the router, which we then require in app.js
module.exports = router;