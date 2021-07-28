const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const ObjectID = require("mongodb").ObjectID;

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id/edit",

  isLoggedIn,
  isAuthor,
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
  isAuthor,
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

  isLoggedIn,
  isAuthor,
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
    const campground = await await Campground.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");

    if (campground == null) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
  })
);

module.exports = router;
