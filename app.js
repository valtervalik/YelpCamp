const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const method_override = require('method-override');
const ejs_mate = require('ejs-mate');

const ExpressError = require('./utils/expressError')

//importar rutas
const campgroundsRoutes = require('./routes/campgrounds')

const mongoose = require('mongoose');

//Conectar con la base de datos
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp', {
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


//campgrounds Routes
app.use('/campgrounds', campgroundsRoutes);

//middleware
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