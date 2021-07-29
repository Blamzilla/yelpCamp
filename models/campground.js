const mongoose = require("mongoose");
const Reviews = require("./review");
const Schema = mongoose.Schema;


//https://res.cloudinary.com/blamzilla/image/upload/w_200/v1627523541/YelpCamp/hd1yt0trjh7dghzsjoad.jpg

const ImageSchema = new Schema({
  
      url: String,
      filename: String
    
})

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload', '/upload/w_100')
})
const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  
  if (doc) {
    await Reviews.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
