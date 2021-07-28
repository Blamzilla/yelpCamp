const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const multer = require('multer')

const {storage} = require('../cloudinary')
const upload = multer({storage})

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.creatNew))

router.get("/new", isLoggedIn, campgrounds.getNew); //New Campground form

router.route('/:id')
    .get(catchAsync(campgrounds.viewCamp))
    .put(isAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.editCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp))
    

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.viewCampPage)); //Edit Campground Form


module.exports = router;
