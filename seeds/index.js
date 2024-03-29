const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().catch((err) => console.log(err));

async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp', {
		useNewUrlParser: true,
		autoIndex: true,
		useUnifiedTopology: true,
	});
	console.log('Mongo Connection Open');
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const c = new Campground({
			author: '63adf4d7a471553c3af981e3',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [],
			description:
				'Feels great to be here where de grass is green and the girls are pretty',
			price,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
		});
		await c.save();
	}
};

seedDB().then(() => mongoose.connection.close());
