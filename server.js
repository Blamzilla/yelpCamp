const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Sample data for the graph
const graphData = {
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  values: [15, 22, 18, 25, 30, 35, 40, 38, 28, 20, 15, 10],
};

// Set up EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (for CSS/JS libraries like Chart.js)
app.use(express.static(path.join(__dirname, "public")));

// Route for the dashboard
app.get("/", (req, res) => {
  res.render("dashboard", { graphData });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
