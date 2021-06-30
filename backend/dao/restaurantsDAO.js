import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

//to store refernce to the database
let restaurants;

export default class RestaurantsDAO {
  //injectDB is a calles as sonn as server is connected
  //and get refernce to the databse
  static async injectDB(conn) {
    if (restaurants) {
      return;
    }
    try {
      //getting data from the colllections in mongodb atlas
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection("restaurants");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`
      );
    }
  }
  static async getRestaurants({
    filters = null, //if want to apply filter like sorting etc
    page = 0, //page no.0 from the database
    restaurantsPerPage = 20, //no. of deatils per page
  } = {}) {
    let query;
    if (filters) {
      if ("name" in filters) {
        //$text means text search
        //in this we have not mentiioned the database field beacuse we are going to do the setting in the atlas
        query = { $text: { $search: filters["name"] } };
      } else if ("cuisine" in filters) {
        //$eq means equal to
        //"cuisine" is the database field in which we have to search
        query = { cuisine: { $eq: filters["cuisine"] } };
      } else if ("zipcode" in filters) {
        //$eq means equal to
        //"address.zipcode"  is the database field in which we have to search
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      }
    }
    let cursor;
    try {
      //find all the restaurants which go along with the query that we have entered
      cursor = await restaurants.find(query);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }
    //if no error
    const displayCursor = cursor
      .limit(restaurantsPerPage)
      //skip to get to that specific data
      .skip(restaurantsPerPage * page);
    try {
      const restaurantsList = await displayCursor.toArray();
      const totalNumRestaurants = await restaurants.countDocuments(query);

      return { restaurantsList, totalNumRestaurants };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents,${e}`
      );
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }
  }
  static async getRestaurantByID(id) {
    try {
      const pipeline = [
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                //match the restaurant id and find reviews that match that id
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            //set them as reviews in the result
            as: "reviews",
          },
        },
        {
          //here we are adding a new field name reviews
          $addFields: {
            reviews: "$reviews",
          },
        },
      ];
      //aggregate means clubing them together and returing them
      return await restaurants.aggregate(pipeline).next();
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`);
      throw e;
    }
  }

  static async getCuisines() {
    let cuisines = [];
    try {
      cuisines = await restaurants.distinct("cuisine");
      return cuisines;
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`);
      return cuisines;
    }
  }
}
