const mongoose = require('mongoose');
const Review = require("./review.js");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});
// virtual is deriving from urls already stored on the database
//this means we don't need to change urls in database, we can just derive from them the changed url with thumbnail 
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// this allows mongoose to include virtuals when we convert a document to json
// can't get mongoose virtuals to be part of the result object
// so we set this cuz it doesn't allow it by default
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images:[ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:"Review" // reference to Review model
    }]
}, opts);

//popuUpmarkup text not stored in database but made for us using a virtual middleware

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


// this middleware is set up to delete the the reviews referenced on a 
//campground when a campground is deleted
// findOneAndDelete is triggereed when findByIdAndDelete is called
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            // delete the review whose id is in the document reviews reference array
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);