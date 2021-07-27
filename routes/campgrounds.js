const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const ObjectID = require("mongodb").ObjectID;
const { campgroundSchema } = require("../schemas.js");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);

    await newCamp.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res, next) => {
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
  })
);
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const findCamp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Campground successfully updated");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    console.log(req.params);
    const findCamp = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect(`/campgrounds`);
  })
);
router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const campground = await Campground.findById(id).populate("reviews");

    if (campground == null) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
  })
);

module.exports = router;
