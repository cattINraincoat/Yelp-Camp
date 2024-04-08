const mongoose = require('mongoose');
const Campground = require("../models/campground.js");
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') // *********************there weere some options here check in the first yelpcamp section for future reference
  .then(()=>{
    console.log("Mongo Connection Open")
  })
  .catch(err=>{
    console.log("Mongo Connection ERROR")
    console.log(err)
  })

  // checking db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            // your user id bob
            author: "660ffed4d70112995b3749c7",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint sed reiciendis iusto illum minus, quas numquam expedita harum eius, totam consequuntur odio ullam repudiandae omnis, exercitationem temporibus quisquam ut velit!",
            price,
            geometry: { 
              type: 'Point', 
              coordinates: [
                cities[random1000].longitude, 
                cities[random1000].latitude,
              ] 
            },
            images: [
              {
                url: 'https://res.cloudinary.com/dh9tlfm3y/image/upload/v1712499520/YelpCamp/o7dlt9rovu9fumfn1cyp.jpg',
                filename: 'YelpCamp/hptl3vlghbuzxb1tq2vb',
              },
              {
                url: 'https://res.cloudinary.com/dh9tlfm3y/image/upload/v1712499527/YelpCamp/rvl79wiohcd4cztwh5pv.jpg',
                filename: 'YelpCamp/xoovatemlb6wsuslycm4',
              }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})