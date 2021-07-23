const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.get("/", (req, res) => {
  res.send("root");
});

app.listen(3000, () => {
  console.log("listening on 3000");
});
