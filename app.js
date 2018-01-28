const port          = 1337,
      express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require("mongoose"),
      flash         = require("connect-flash"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      Campground    = require("./models/campground"),
      Comment       = require("./models/comment"),
      User          = require("./models/user"),
      seedDB        = require("./seeds");
     
// Requiring Routes   
const   commentRoutes     = require("./routes/comments"),
        campgroundRoutes  = require("./routes/campgrounds"),
        indexRoutes       = require("./routes/");
      

// The line below connects to our database
mongoose.connect("mongodb://localhost/yelp_camp_v12");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// This will connect our stylesheet and will know to look in the public directory. This is safer if a directory changes as this will always work.
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // Seeds the database

// ===========================
// PASSPORT CONFIGURATION
// ===========================
// This is adding our express session into the App. We're requiring and running app.use inline all at once. We're running it as a function and passing in some arguments. We have to pass in them 3 options in order to work with Passport.
app.use(require("express-session")({
    // The secret will be used to decode the information in the session.    
    secret: "Max and Murphy",
    resave: false,
    saveUninitialized: false
}));

// This 2 lines below are telling Express to use Passport. 
app.use(passport.initialize());
app.use (passport.session());
// This is giving the app the LocalStrategy. This allows us to look up the user's data in the app's database. The 'new' keyword creates a new instance of LocalStrategy. Then inside that we give it a method "User.authenticate()". This comes from passportLocalMongoose.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This means that req.user is passed through to every template. Whatever we put in res.locals is what's available inside of our template. The variable currentUser is now locally available in all the views templates. This will work for all the routes.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    // This will allow us to move on to the next piece of code.
    next();
});

// This tells app.js to use the three route files that we have required. We have shortened the route declaration when they're declared.
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port);

console.log('Server running at http://localhost:' + port);
