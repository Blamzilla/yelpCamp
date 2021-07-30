const mongoose = require("mongoose");
const Reviews = require("./review");
const Schema = mongoose.Schema;




const ImageSchema = new Schema({
  
      url: String,
      filename: String
    
})

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload', '/upload/w_100')
})

const opts = {toJSON: {virtuals: true}, timestamps: true}
const CampgroundSchema = new Schema({
 date: {
   type: Number,
   
 },
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `<a href='/campgrounds/${this.id}'>${this.title}</a> <br> ${this.location}`
})


CampgroundSchema.post("findOneAndDelete", async function (doc) {
  
  if (doc) {
    await Reviews.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
