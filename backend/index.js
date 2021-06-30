import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import RestaurantsDAO from "./dao/restaurantsDAO.js";
import ReviewsDao from "./dao/reviewsDao.js";

//load in the environmental variables
dotenv.config();
// to get to our mongo client
const MongoClient = mongodb.MongoClient;

// to access to environmental variable
const port = process.env.PORT || 8000;

// connect to database
// inside is database uri
// poolSize: 50 is if we want only 50 people to connect
// wtimeout: 2500 at 2500ms time will timeout
MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  poolSize: 50,
  wtimeout: 2500,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  // Now we will be catching the error
  .catch((err) => {
    console.error("error here", err.stack);
    process.exit(1);
  })

  //app.listen is how we are starting our server
  .then(async (client) => {
    //initial refernce to restaurants collection
    await RestaurantsDAO.injectDB(client);
    await ReviewsDao.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
