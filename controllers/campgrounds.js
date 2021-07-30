const Campground = require("../models/campground");
const ObjectID = require("mongodb").ObjectID;
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async (req, res, next) => {
  const perPage = 9;
    const page = req.params.page || 1
  const campgrounds = await Campground.find({}).skip((perPage * page) - perPage)
        .sort({_id: "desc"})
        .limit(perPage)
        .exec(function(err, campgrounds){
            Campground.count().exec(function(err, count){
                if (err) return next(err)
                res.render('campgrounds/index', {campgrounds, current: page, pages: Math.ceil(count /perPage)})
            })
        })
  
  
  
  
  
  
};

module.exports.getNew = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.creatNew = async (req, res, next) => {
const geoData = await geoCoder.forwardGeocode({
  query: req.body.campground.location,
  limit:1
}).send()

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry
  campground.images = req.files.map(f =>({url: f.path, filename: f.filename}))
  campground.author = req.user._id;
  campground.date = Math.floor(Date.now() /1000)
  await campground.save();

  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.viewCampPage = async (req, res, next) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return next();
  }

  const campground = await Campground.findById(id);
  if (campground == null) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};


module.exports.editCamp = async (req, res, next) => {
   
  const { id } = req.params;

    if (!ObjectID.isValid(id)) {
      req.flash('error', "Campground not found") 
      return res.redirect('/campgrounds')
    }
    
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f=>({url: f.path, filename: f.filename}))
    campground.images.push(...imgs)
    await campground.save()
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename)
      }
    await campground.updateOne({$pull: {images:{filename:{$in: req.body.deleteImages}}}})
    }
    req.flash("success", "Campground successfully updated");
    res.redirect(`/campgrounds/${id}`);
  }

  module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const campgrounds = await Campground.findById(id)
    
    
    for(let filename of campgrounds.images){
        await cloudinary.uploader.destroy(filename.filename)
      }
    const findCamp = await Campground.findByIdAndDelete(id);
    
    req.flash("success", "Successfully deleted campground");
    res.redirect(`/campgrounds`);
  }

  module.exports.viewCamp = async (req, res, next) => {
    const { id } = req.params;
   
    if (!ObjectID.isValid(id)) {
       req.flash("error", "Campground not found");
    return res.redirect(`/campgrounds`);
    }
    const campground = await await Campground.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");

    if (campground == null) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
  }