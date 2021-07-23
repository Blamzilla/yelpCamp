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

app.get("/makecampground", async (req, res) => {
  const camp = new Campground({ title: "My backyard" });
  await camp.save();
  res.send(camp);
});

app.listen(3000, () => {
  console.log("listening on 3000");
});
