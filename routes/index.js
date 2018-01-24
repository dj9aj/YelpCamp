var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


// ROOT ROUTE - Landing Page Route

router.get("/", function(req, res){
    res.render("landing");
});

// ===========
// AUTH ROUTES
// ===========

// Show Register form
router.get("/register", function(req, res){
    res.render("register");
});

// Handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    // User.register method is provided by the passport-local-mongoose package. We then pass in the new user, with the username coming from req.body.username. We've saved this to a variable in the line above.
    User.register(newUser, req.body.password, function(err, user){
        // If a user tries to sign up with a name that has already registered, then the error will be logged and we short circut the callback by redirecting back to the register form.
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
         // The line below will log the user in and it will store the correct information. It will also run the serializeUser method. We're specifying that we want to use the local strategy.
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Show Login form
router.get("/login", function(req, res){
    res.render("login");
});

// Handling Login logic
// The middleware will take req.body.username & req.body.password and it will authenticate that password with what we have stored in the database for that user. The method comes from passport-local-mongoose.
// router.post("/login", passport.authenticate("local", 
//     {
//         successRedirect: "/campgrounds",
//         failureRedirect: "/login",
//         successFlash: "Welcome back!",
//         failureFlash: true
//         // We don't actually need the callback, it's just left there to demonstrate that we have a middleware, which is run first before the callback.
//     }), function(req, res){
// });

//handling login logic
router.post('/login', function(req, res, next) {
  // run passport.authenticate method with local argument
  passport.authenticate('local', function(err, user, info) {
    // if there's an error then return call of next with err as argument
    if (err) { return next(err); }
    // if there isn't a user object then return out of function by redirecting to /login
    if (!user) { return res.redirect('/login'); }
    // otherwise log the user in
    req.logIn(user, function(err) {
      // if there's an error then return next function call with err argument
      if (err) { return next(err); }
      // otherwise if there's a redirecTo property on the session then set the redirectTo variable equal to it, 
      // else set redirectTo var equal to /campgrounds (default url)
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      // delete the redirectTo property from session, whether it exists or not
      delete req.session.redirectTo;
      // redirec to whatever was stored inside of redirectTo variable (either previous page or /campgrounds)
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// Logout Route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});


module.exports = router;