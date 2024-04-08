const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.js');
const passport = require("passport");
const { storeReturnTo } = require('../middleware.js');

//controllers
const user = require("../controllers/user.js");

// ROUTE- REGISTER A USER
// register form
router.get("/register", user.renderRegisterFrom );
// register and save in database with hashed password
router.post("/register", catchAsync( user.registerNewUser ));

// ROUTE - LOG IN A USER
// login form
router.get("/login", user.renderLoginForm );
// login the user
router.post("/login", storeReturnTo , passport.authenticate("local", {failureFlash:true, failureRedirect:"/login"}), user.loginUser );

// ROUTE - LOG OUT THE USER
router.get('/logout', user.logoutUser );


module.exports = router;