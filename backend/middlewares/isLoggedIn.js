import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { AsyncError } from "./AsyncError.js";
import ErrorHandler from "./error.js";

export const isLoggedIn = AsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  const Secret = process.env.JWT_SECRET_KEY;
  if (!token) {
    return next(new ErrorHandler("User is not Logged In", 400));
  }
  const decode = jwt.verify(token, Secret);
  req.user = await User.findById(decode.id);
  console.log("User is logged in");
  next();
});
