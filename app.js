//includes section
const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const uuid = require("uuid");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const app = express();
const catchAsync = require("./utils/catchAsync");
const ObjectID = require("mongodb").ObjectID;
const ExpressError = require("./utils/ExpressError");

const { campgroundSchema } = require("./schemas.js");
//DB connection section
//testing output
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

//middleware section dvfs
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//routes

app.get("/", (req, res) => {
  res.redirect("/campgrounds");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);

    await newCamp.save();
    console.log(newCamp);
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const findCamp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });

    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    console.log(req.params);
    const findCamp = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
  })
);
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next();
    }
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found"), 404);
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh no, something went wrong!";
  }
  res.status(statusCode).render("error", { err });
});
app.listen(3000, () => {
  console.log("listening on 3000");
});
