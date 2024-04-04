import { User } from "@prisma/client";
import config from "../config/config";
const jwt = require("jsonwebtoken");

//generate token for login
function jwtGenerator(user: User) {
  const accessToken = jwt.sign(
    { email: user.email, role: user.role, id: user.id },
    config.ACCESS_SECRET,
    { expiresIn: "100d", algorithm: "HS256" }
  );
  const refreshToken = jwt.sign(
    { email: user.email, role: user.role, id: user.id },
    config.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user_id: user.id,
  };
}

//generate token for reset password
function forgetPasswordToken(mail: string) {
  const forgetPasswordToken = jwt.sign(
    { email: mail },
    config.FORGET_PASSWORD_SECRET,
    {
      expiresIn: "30m",
    }
  );
  return { forgetPasswordToken: forgetPasswordToken };
}

//verify token
function verifyRefreshToken(refreshToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, config.REFRESH_SECRET, (err: any, user: any) => {
      if (err) return reject();
      const email = user.email;
      const password = user.password;
      const id = user.id;
      const userInfo = { email: email, password: password, id: id };
      console.log(userInfo);
      resolve(userInfo);
    });
  });
}

//verify token
function verifyResetPasswordToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.FORGET_PASSWORD_SECRET, (err: any, user: any) => {
      if (err) return reject();
      const email = user.email;
      const userInfo = { email: email };

      resolve(userInfo);
    });
  });
}

export default {
  verifyResetPasswordToken,
  forgetPasswordToken,
  jwtGenerator,
  verifyRefreshToken,
};
