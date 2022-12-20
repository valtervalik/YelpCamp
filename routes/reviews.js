const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const ExpressError = require('../utils/expressError')

const { reviewSchema } = require('../utils/validation/schemas');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    res.redirect(`/campgrounds/${id}`)
}));



module.exports = router;