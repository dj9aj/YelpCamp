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
    res.render("register", {page: "register"});
});

// Handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === "admin12345") {
        newUser.isAdmin = true;
    }
    // Register new user
    User.register(newUser, req.body.password, function(err, user) {
        // If user tries to sign up with a name that has already registered, then the error will be logged and the user will be redirected back to the register form.
        if (err) {
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully Signed Up! Nice to meet you " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Show Login form
router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});

//e login logic Hanfl
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
      req.flash("success", "Welcome Back " + user.username + "!");
      // redirect to whatever was stored inside of redirectTo variable (either previous page or /campgrounds)
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