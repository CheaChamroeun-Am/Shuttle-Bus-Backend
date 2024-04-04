import dotenv from "dotenv";
import path from "path";
dotenv.config();
dotenv.config({ path: path.join(__dirname, "../../.env") });

export default {
  PORT: process.env.PORT || 6000,
  ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
  MAILUSER: process.env.MAILUSERNAME,
  MAILPASS: process.env.MAILPASSWORD,
  FORGET_PASSWORD_SECRET: process.env.FORGET_PASSWORD_SECRET,
  BASE: process.env.BASE_URL,
  LAUNDRY: process.env.LAUNDRY_URL,
};
