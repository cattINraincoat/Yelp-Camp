const express = require("express");
const router = express.Router({ mergeParams: true });
// as we seperated the prefix path and the path in router middlewares
// params get seperated that's why we cannot access params for id, so to solve this problem we set mergeParams true
// now params from prefix are merged with params in router middleware path

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const Campground = require("../models/campground.js");
const Review = require("../models/review.js");

const { reviewSchema } = require('../schemas.js');

const { validateReview , isLoggedIn, isReviewAuthor } = require('../middleware.js');

//controllers
const review = require("../controllers/review.js");

// Prefix path is /campgrounds/:id/reviews
// create a review
router.post('/' , isLoggedIn , validateReview , catchAsync( review.createReview ));

// deleting the reivew and also its reference from the array of reviews in the campground
router.delete("/:reviewId", isLoggedIn , isReviewAuthor, catchAsync( review.deleteReview ));

module.exports = router;