const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

// Prefix path is /campgrounds/:id/reviews

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    console.log(review);
    req.flash('success', 'Successfully left a review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res,next)=>{
    const {id , reviewId} = req.params;
    // pull removes the instance in reviews which matches the reviewId 
    // so we delete the review but also its reference present in the campground because its of no use now
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}