if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const flash = require("connect-flash");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL;
console.log("Database URL being used:", dbUrl);

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); //to apply css

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE :", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie will expire after 7 days
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Function to get coordinates based on location string
async function getCoordinates(location) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    location
  )}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry;
    return { lat, lng };
  } else {
    throw new Error("Location not found");
  }
}

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
