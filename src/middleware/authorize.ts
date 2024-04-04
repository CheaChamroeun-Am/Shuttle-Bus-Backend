import { Response, NextFunction } from "express";

//authorize user
export const authorizeUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  //type of user role
  const kindOfUser = ["STUDENT", "STAFF", "CUSTOMER"];
  const role = req.user.role;
  if (!kindOfUser.includes(role)) {
    return res.status(403).send({ message: "Forbidden" });
  } else {
    next();
  }
};
//authorize admin
export const authorizeAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // type of admin role
  const kindOfAdmin = ["SUPERADMIN", "ADMIN"];
  const role = req.user.role;
  if (!kindOfAdmin.includes(role)) {
    return res.status(403).send({ message: "Forbidden" });
  } else {
    next();
  }
};
