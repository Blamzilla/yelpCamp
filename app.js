if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//includes section
const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const uuid = require("uuid");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalPassport = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const ObjectID = require("mongodb").ObjectID;
const ExpressError = require("./utils/ExpressError");

const apiRoutes = require("./routes/api");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const { campgroundSchema, reviewSchema } = require("./schemas.js");
const { index } = require("./controllers/campgrounds");
const thisIsATest = "test";
//DB connection section
//testing output "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl, {
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

app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/favicon.ico", (req, res) => res.status(204));
app.use(mongoSanitize());

const secret = process.env.SECRET;

const store = new MongoStore({
  mongoUrl: dbUrl,
  crypto: {
    secret,
  },
  touchAfter: 24 * 3600,
});
store.on("error", function (e) {
  console.log("Session Store Error", e);
});
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    //secure: true //Disabled for dev
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://maxcdn.bootstrapcdn.com/",
  "https://code.jquery.com/",
  "https://unpkg.com/",
  "https://kit.fontawesome.com/4e45d5ec46.js",
  "https://i.simmer.io/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://maxcdn.bootstrapcdn.com",
  "https://cdn.jsdelivr.net",
  "https://ka-f.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://i.simmer.io/",
];
const fontSrcUrls = [
  "https://kit.fontawesome.com",
  "https://ka-f.fontawesome.com",
];

const defaultSrc = ["https://i.simmer.io/"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [...defaultSrc],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/blamzilla/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://source.unsplash.com/",
        "https://images.unsplash.com",
        "https://cdn2.iconfinder.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});
app.use("/api", apiRoutes);
app.get("/games", (req, res) => {
  res.render("games");
});
//Campground Routes ewrgfeg
app.use("/campgrounds", campgroundRoutes);

//Review routes
app.use("/campgrounds/:id/review", reviewRoutes);

//User routes
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.redirect("/campgrounds");
});

app.all("*", (req, res, next) => {
  req.flash("error", "Page not found");
  return res.redirect("/campgrounds");
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh no, something went wrong!";
  }
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// This is a test
