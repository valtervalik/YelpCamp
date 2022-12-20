const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/expressError')

const { campSchema } = require('../utils/validation/schemas');


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

module.exports = router;