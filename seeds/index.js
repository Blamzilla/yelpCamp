const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { desciptors, places, descriptors } = require("./seedhelpers");
//DB connection section
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const collection = ["483251", "24195127", "19655117", "4454477", "2110747"];
    const randomCollection = Math.floor(Math.random() * 3);
    const price = Math.floor(Math.random() * 20) + 10;
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      date: Math.floor(Date.now() /1000) + i,
      geometry: {
        type:"Point",
        coordinates:[cities[random1000].longitude,
      cities[random1000].latitude]
      },
      author: "6100bf1f5a29f0328cfde5cd",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [{url:`https://source.unsplash.com/collection/${collection[randomCollection]}/800x600`,
      filename: 'bla'}],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus ratione quisquam, molestias numquam earum eveniet accusantium totam omnis magnam dolore cum aspernatur, non quae sed qui libero, ea voluptatem minus.",
      price: price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
