const express = require("express");
const router = express.Router({ mergeParams: true });

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn ,  isAuthor , validateCampground } = require("../middleware.js");

const Campground = require('../models/campground');

// controllers
const campground = require("../controllers/campground.js");

const { storage } = require("../cloudinary/index.js");
// MULTER
const multer = require("multer");
const upload = multer({ storage });


// read about router.route, can be used when path are same and we can chain the requests

// Prefix path is set to /campgrounds

// All campgrounds
router.get("/",catchAsync( campground.index ));

// New campground
router.get('/new',isLoggedIn, campground.renderNewForm);
router.post("/", isLoggedIn , upload.array('image') , validateCampground ,catchAsync( campground.createCampground ));

// Show a campground
router.get("/:id",catchAsync( campground.showCampground ))

// update a campground
router.get('/:id/edit', isLoggedIn , isAuthor , catchAsync( campground.renderEditForm ));
router.put("/:id", isLoggedIn , isAuthor , upload.array('image') , validateCampground ,catchAsync( campground.editCampground ));

//Delete a campground
router.delete("/:id", isLoggedIn , isAuthor , campground.deleteCampground );

// ~~~~~~~~~~~~~~~~~~~~~~~
// router.post("/", upload.single("image") , (req,res)=>{
//     console.log(req.body,req.file);
    
// })



module.exports = router;