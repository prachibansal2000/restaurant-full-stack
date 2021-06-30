import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";

// this we are going to use for the server
const app = express();

// this is what express is going to use
app.use(cors());
// means our server can accept json in the body of request
app.use(express.json());

// this will be url to which people will go to and
// route will be in restaurants file which we still hav to make
app.use("/api/v1/restaurants", restaurants);

// if someone tries to put different route that does not exist then we are going to return following
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
