// if we are in development mode we require dotenv package
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require("./models/campground.js");
const Review = require("./models/review.js");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
//Authentication
const passport = require("passport");
const LocalStrategy =  require("passport-local");
const User = require('./models/user');

//const catchAsync = require("./utils/catchAsync.js");
const ExpressError = require('./utils/ExpressError');

const { campgroundSchema, reviewSchema } = require('./schemas.js');

// campground routes
const campgroundRoutes = require("./routes/campground.js");
// review routes
const reviewRoutes = require("./routes/review.js");
// users routes
const userRoutes = require("./routes/users.js");
const { Console } = require('console');

const dbUrl = process.env.DB_URL;
//process.env.DB_URL;
//mongodb://127.0.0.1:27017/yelp-camp

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp") 
  .then(()=>{
    console.log("Mongo Connection Open")
  })
  .catch(err=>{
    console.log("Mongo Connection ERROR")
    console.log(err)
  })

// checking db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
// parsing req.body
app.use(express.urlencoded({ extended: true }));
// for layout boilerplate
app.engine("ejs", ejsMate)
// setting up ejs view engine and directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
// sanitise user supplied data to prevent mongo operator injection ex $ operators and stuff
app.use(mongoSanitize({
    replaceWith:"_"
}));
// includes many security headers in our request
// content security policy designates what's allowed and what's not allowed, the secipts or response coming from other sources like cdns cloudinary unsplash etc
app.use(helmet({contentSecurityPolicy: false}));


app.use(methodOverride('_method'));
// storing out static files in public folder
app.use(express.static(path.join(__dirname,"public")));


// SESSION middleware
// right now this uses memory store
// session cookie and its properties

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // session updated after this time period in seconds
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig={
    store:store,
    name:"session",
    secret:"thisshouldbeabettersecret!",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true, //your browser should not allow a client-side script to access the session cookie. 
        //secure:true, // this says cookie should only work on https, http secure
        exprire:Date.now() + 1000*60*60*24*7, // expiration time of 7 week, date.now has time in milliseconds
        maxAge: 1000*60*60*24*7 // a week of age
    }
}
app.use(session(sessionConfig));

// passport.session should be after session middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash middlewares
app.use(flash());
// this middleware allows us to not pass the flash in our routes, it works on every request which shows success
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user; // req.user contains information on the user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// server side validating using Joi middleware function
const validateCampground = (req, res, next) => {
    // validates the request body with the campgroundSchema we created
    const { error } = campgroundSchema.validate(req.body);
    // we get the details from error and convert it into an array of strings
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // then throw that error which will be caught by our error handling middleware down there
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



// Router Middleware 
//app.use, we specify the routers , prefix path
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);




//ROUTES
app.get("/home",(req,res)=>{
    console.log(res.locals);
    res.render("home.ejs");
})




//error handling
app.all("*",(req,res,next)=>{
    next(new ExpressError("Page Not Found", 404))
})

// middleware function runs after getting chained in the catch using next
app.use((err,req,res,next)=>{
    const {statusCode =500} = err;
    if(!err.message)
    {
        err.message = "Oh No, Something went wrong!";
    }
    res.status(statusCode).render("error.ejs", {err});
})


app.listen(3000,()=>{
    console.log("Listening on Port 3000")
})



// // All campgrounds
// app.get("/campgrounds",catchAsync(async (req,res)=>{
//     const campgrounds = await Campground.find({});
//     res.render("campgrounds/index.ejs",{campgrounds});
// }))
// // New campground

// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new');
// })  
// app.post("/campgrounds", validateCampground ,catchAsync(async (req,res,next)=>{
//     // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect("/campgrounds");
// }))

// // Show a campground
// app.get("/campgrounds/:id",catchAsync(async (req,res)=>{
//     const {id}= req.params;
//     const campground = await Campground.findById(id).populate("reviews");
//     console.log(campground);
//     res.render("campgrounds/show.ejs",{campground});
// }))

// // update a campground
// app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id)
//     res.render('campgrounds/edit.ejs', { campground });
// }))

// app.put("/campgrounds/:id", validateCampground ,catchAsync(async (req,res)=>{
//     const {id} = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     res.redirect(`/campgrounds/${campground._id}`);

// }))

// //Delete a campground
// app.delete("/campgrounds/:id", async(req,res)=>{
//     const {id} = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect("/campgrounds");
// })


// // create a review
// app.post('/campgrounds/:id/reviews' ,catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     console.log(review);
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// // deleting the reivew and also its reference from the array of reviews in the campground
// app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req,res,next)=>{
//     const {id , reviewId} = req.params;
//     // pull removes the instance in reviews which matches the reviewId 
//     // so we delete the review but also its reference present in the campground because its of no use now
//     await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
// }))


