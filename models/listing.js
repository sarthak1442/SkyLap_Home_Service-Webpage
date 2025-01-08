
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); //for the .post function

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});
//The post middleware is executed after the document is deleted.
//The $in operator is used to match any document where the _id field is in the listing.reviews array.
// deletes all Review documents whose _id is in the array listing.reviews.

listingSchema.post("findOneAndDelete", async (listing) => {
  //The listing parameter represents the document that was just deleted by the findOneAndDelete operation.
  if (listing) {
    //await ensures that the deleteMany operation completes before the function exits.
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
