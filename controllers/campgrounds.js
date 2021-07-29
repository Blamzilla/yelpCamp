const Campground = require("../models/campground");
const ObjectID = require("mongodb").ObjectID;
const {cloudinary} = require('../cloudinary')

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.getNew = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.creatNew = async (req, res, next) => {

  const campground = new Campground(req.body.campground);
  campground.images = req.files.map(f =>({url: f.path, filename: f.filename}))
  campground.author = req.user._id;
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
      return next();
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
    
    const findCamp = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect(`/campgrounds`);
  }

  module.exports.viewCamp = async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
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