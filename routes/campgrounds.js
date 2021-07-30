const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const multer = require('multer')
const Campground = require('../models/campground')
const {storage} = require('../cloudinary')
const upload = multer({storage})

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get('/page/:page', (req, res, next)=>{
    const perPage = 9;
    const page = req.params.page || 1

    Campground
        .find({})
        .sort({_id: "desc"})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, campgrounds){
            Campground.count().exec(function(err, count){
                if (err) return next(err)
                res.render('campgrounds/index', {campgrounds, current: page, pages: Math.ceil(count /perPage)})
            })
        })
})

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
