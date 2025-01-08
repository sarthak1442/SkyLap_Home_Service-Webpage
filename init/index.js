const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); //deletes all the data before loading new ones
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "66cca827884fc56c23a3f762",
  })); //map creates a new array
  // this will take all the data of the object and add owner to it
  await Listing.insertMany(initData.data); //initData is an object that extracts data from data.js
  console.log("data was initialized");
};

initDB();
