//includes section
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const uuid = require("uuid");
const methodOverride = require("method-override");

const app = express();

//middleware section
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("listening on 3000");
});
