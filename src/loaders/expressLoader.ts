import express, { Application, json } from "express";
import routes from "../routes/index";
import cors from "cors";
import { rateLimiterUsingThirdParty } from "../middleware/ratelimite";
export default (app: Application) => {
  require("dotenv").config();
  app.set("view engine", "ejs");
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(cors());
  app.use(rateLimiterUsingThirdParty);
  app.use(json());

  routes(app);
};
