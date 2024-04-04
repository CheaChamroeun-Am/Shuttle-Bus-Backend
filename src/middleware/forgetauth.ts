import { Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import config from "../config/config";
export const authForget = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // get token from bearer header
  const authToken = req.params;
  if (!authToken) {
    return res.status(401).send({ error: "No token provided" });
  }
  try {
    const token = authToken.token;
    // split bearer token into two parts
    const decoded = await verify(token, config.FORGET_PASSWORD_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.render("token_expire");
  }
};
