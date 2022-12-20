const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const ExpressError = require('../utils/expressError')

const { campSchema, reviewSchema } = require('../utils/validation/schemas');


//validation
const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
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

//Routes
router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.post('/', validateCampground, wrapAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground })
}));

router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}));

router.put('/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { ...camp } = req.body.campground;
    const campground = await Campground.findByIdAndUpdate(id, { ...camp });
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

router.post('/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.delete('/:campId/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { campId, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } });
    res.redirect(`/campgrounds/${campId}`)
}));



module.exports = router;