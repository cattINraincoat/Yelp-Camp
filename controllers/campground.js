const Campground = require('../models/campground.js');
const { cloudinary } = require("../cloudinary/index.js");

//Geocoding - forward geocode
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Prefix path is set to /campgrounds

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs",{campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send();
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    //adding the forward geocoded geomtery json in the db
    campground.geometry = geoData.body.features[0].geometry;
    // getting the path and filename from req.file object using multer and storing it in images
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id; //req.user is automatically added in with passport
    await campground.save();
    console.log(campground);
    // creating the flash for successful completion of the new campground
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    // if we search for a deleted campground, whose id does not exist in the databse
    // we return this error flash, looks so much better
    if(!campground){
        req.flash("error","Cannot find that Campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs",{campground});
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash("error","Cannot find that Campground");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit.ejs', { campground });
}

module.exports.editCampground = async (req,res)=>{
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // we get an array of images and spread it because we cant push an array into an already existing one
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);
    await campground.save();
    // if there are images checked in delete images, their filename will be in the deleteImages array
    // we pull those images whose filename is in the deleteImages array
    if (req.body.deleteImages) {
        // deleting the images from cloudinary as well
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground);
    }
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect("/campgrounds");
}