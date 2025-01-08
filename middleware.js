const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; //this helps in that way is a user tries to access new listings page without login then once he logged in then istead on going to listing page again it goes directly to new listing page
    req.flash("error", "you must be logged in to create listing");
    return res.redirect("/login");
  }
  next();
};

//isLoggedIn
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    
  } else {
    res.locals.redirectUrl = "/listings"; // Fallback URL
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  //this schema make sure that whether title, discription, location, price,country is misssing during posting is so itgive error

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You didn't create this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
