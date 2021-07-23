//includes section
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const uuid = require("uuid");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const app = express();

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

//middleware section
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

//routes

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.post("/campgrounds", async (req, res) => {
  const newCamp = new Campground(req.body.campground);
  console.log(req.body);
  //await newCamp.save();
  res.redirect("/campgrounds");
});
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});

// app.post("/campgrounds/new", async (req, res) => {
//   const { title, description, price, location } = req.body;
//   const newCamp = new Campground.create(title, description, price, location);

//   newCamp.save();
// });

app.listen(3000, () => {
  console.log("listening on 3000");
});
