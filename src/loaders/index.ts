import { Application } from "express";
import expressLoader from "./expressLoader";

export default async (expressApp: Application) => {
  expressLoader(expressApp);
};
