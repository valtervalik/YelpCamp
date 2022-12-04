const express = require('express');
const app = express();
const path = require('path');
const method_override = require('method-override');
const ejs_mate = require('ejs-mate');

const wrapAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')

const port = 3000;
//Conectar con la base de datos
const mongoose = require('mongoose');
const Campground = require('./models/campground');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/YelpCamp', {
        useNewUrlParser: true,
        autoIndex: true,
        useUnifiedTopology: true
    })
    console.log("Mongo Connection Open")
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(method_override('_method'));

app.engine('ejs', ejs_mate);



app.get('/', (req, res) => {
    res.render('home')
});

app.get('/campgrounds', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', wrapAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}));

app.put('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { ...camp } = req.body.campground;
    const campground = await Campground.findByIdAndUpdate(id, { ...camp });
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});