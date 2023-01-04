const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Thanks for your review');
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`)
}));



module.exports = router;