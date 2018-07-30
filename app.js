const port              = process.env.PORT || 1337,
      express           = require("express"),
      app               = express(),
      bodyParser        = require("body-parser"),
      mongoose          = require("mongoose"),
      flash             = require("connect-flash"),
      passport          = require("passport"),
      LocalStrategy     = require("passport-local"),
      methodOverride    = require("method-override"),
      Campground        = require("./models/campground"),
      Comment           = require("./models/comment"),
      User              = require("./models/user"),
      geocoder          = require('geocoder');
      
     
// Requiring Routes   
const   commentRoutes     = require("./routes/comments"),
        campgroundRoutes  = require("./routes/campgrounds"),
        indexRoutes       = require("./routes/");
      

// Connect to DB

const url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v12";
mongoose.connect(url);

// mongodb://jack:password1@ds259361.mlab.com:59361/yelpcamp_db
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// Connect stylesheet in public directory.
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// Moment is available for use in all of the view files via the variable named 'moment'.
app.locals.moment = require("moment");
// seedDB(); // Seeds the database

// ===========================
// PASSPORT CONFIGURATION
// ===========================

// Add Express session into the App.
app.use(require("express-session")({
    // The secret will be used to decode the information in the session.    
    secret: "Max and Murphy",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use (passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// req.user is passed through to every template.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port);

console.log('Server running at http://localhost:' + port);
